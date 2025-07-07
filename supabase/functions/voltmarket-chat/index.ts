import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Store active connections
const connections = new Map<string, WebSocket>()
const userConnections = new Map<string, string>() // userId -> connectionId

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const upgradeHeader = req.headers.get("upgrade") || ""
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  const connectionId = crypto.randomUUID()
  let userId: string | null = null

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  socket.onopen = () => {
    connections.set(connectionId, socket)
    console.log(`WebSocket connection opened: ${connectionId}`)
  }

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('Received message:', data)

      switch (data.type) {
        case 'auth':
          // Authenticate user and store connection
          userId = data.userId
          if (userId) {
            userConnections.set(userId, connectionId)
            socket.send(JSON.stringify({
              type: 'auth_success',
              message: 'Authenticated successfully'
            }))
          }
          break

        case 'send_message':
          if (!userId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Not authenticated'
            }))
            return
          }

          // Save message to database
          const { data: message, error } = await supabase
            .from('voltmarket_messages')
            .insert({
              listing_id: data.listingId,
              sender_id: data.senderId,
              recipient_id: data.recipientId,
              message: data.message
            })
            .select()
            .single()

          if (error) {
            console.error('Error saving message:', error)
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to send message'
            }))
            return
          }

          // Update conversation timestamp
          await supabase
            .from('voltmarket_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('listing_id', data.listingId)
            .or(`and(buyer_id.eq.${data.senderId},seller_id.eq.${data.recipientId}),and(buyer_id.eq.${data.recipientId},seller_id.eq.${data.senderId})`)

          // Broadcast message to both sender and recipient
          const messageData = {
            type: 'new_message',
            message: {
              id: message.id,
              listing_id: message.listing_id,
              sender_id: message.sender_id,
              recipient_id: message.recipient_id,
              message: message.message,
              created_at: message.created_at,
              is_read: message.is_read
            }
          }

          // Send to sender
          const senderConnectionId = userConnections.get(data.senderId)
          if (senderConnectionId && connections.has(senderConnectionId)) {
            connections.get(senderConnectionId)?.send(JSON.stringify(messageData))
          }

          // Send to recipient
          const recipientConnectionId = userConnections.get(data.recipientId)
          if (recipientConnectionId && connections.has(recipientConnectionId)) {
            connections.get(recipientConnectionId)?.send(JSON.stringify(messageData))
          }
          break

        case 'mark_read':
          if (!userId) return

          // Mark message as read
          await supabase
            .from('voltmarket_messages')
            .update({ is_read: true })
            .eq('id', data.messageId)
            .eq('recipient_id', userId)

          // Notify sender that message was read
          const { data: readMessage } = await supabase
            .from('voltmarket_messages')
            .select('sender_id')
            .eq('id', data.messageId)
            .single()

          if (readMessage) {
            const senderConnId = userConnections.get(readMessage.sender_id)
            if (senderConnId && connections.has(senderConnId)) {
              connections.get(senderConnId)?.send(JSON.stringify({
                type: 'message_read',
                messageId: data.messageId
              }))
            }
          }
          break

        case 'typing':
          if (!userId) return

          // Broadcast typing indicator to recipient
          const typingRecipientConnId = userConnections.get(data.recipientId)
          if (typingRecipientConnId && connections.has(typingRecipientConnId)) {
            connections.get(typingRecipientConnId)?.send(JSON.stringify({
              type: 'typing',
              senderId: userId,
              isTyping: data.isTyping
            }))
          }
          break

        default:
          console.log('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }))
    }
  }

  socket.onclose = () => {
    console.log(`WebSocket connection closed: ${connectionId}`)
    connections.delete(connectionId)
    
    // Remove user connection mapping
    if (userId) {
      userConnections.delete(userId)
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
    connections.delete(connectionId)
    if (userId) {
      userConnections.delete(userId)
    }
  }

  return response
})