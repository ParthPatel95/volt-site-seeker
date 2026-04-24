import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

// Store active connections
const connections = new Map<string, WebSocket>()
const userConnections = new Map<string, string>() // userId -> connectionId

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const upgradeHeader = req.headers.get("upgrade") || ""
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  const connectionId = crypto.randomUUID()
  // userId is only ever set from a verified JWT below; never from a
  // client-supplied value. Previously clients could spoof identity by sending
  // any userId/senderId they wanted.
  let userId: string | null = null

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

      switch (data.type) {
        case 'auth': {
          // Verify a supplied Supabase access token instead of trusting
          // data.userId. Client must send { type: 'auth', token: <access_jwt> }.
          const token: string | undefined = data?.token
          if (!token || typeof token !== 'string') {
            socket.send(JSON.stringify({ type: 'error', message: 'Missing token' }))
            return
          }
          const { data: userResult, error: authError } = await supabase.auth.getUser(token)
          if (authError || !userResult?.user) {
            socket.send(JSON.stringify({ type: 'error', message: 'Invalid token' }))
            return
          }
          userId = userResult.user.id
          // Replace any previous connection for this user to avoid stale
          // mappings (e.g. duplicate tabs).
          const prevConnId = userConnections.get(userId)
          if (prevConnId && prevConnId !== connectionId) {
            connections.get(prevConnId)?.close()
            connections.delete(prevConnId)
          }
          userConnections.set(userId, connectionId)
          socket.send(JSON.stringify({ type: 'auth_success', userId }))
          break
        }

        case 'send_message': {
          if (!userId) {
            socket.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }))
            return
          }
          if (!data.listingId || !data.recipientId || typeof data.message !== 'string') {
            socket.send(JSON.stringify({ type: 'error', message: 'Invalid payload' }))
            return
          }
          if (data.message.length === 0 || data.message.length > 5000) {
            socket.send(JSON.stringify({ type: 'error', message: 'Message length out of range' }))
            return
          }

          // sender_id is ALWAYS the authenticated user; ignore any
          // client-supplied senderId.
          const { data: message, error } = await supabase
            .from('voltmarket_messages')
            .insert({
              listing_id: data.listingId,
              sender_id: userId,
              recipient_id: data.recipientId,
              message: data.message,
            })
            .select()
            .single()

          if (error || !message) {
            console.error('Error saving message:', error?.message)
            socket.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }))
            return
          }

          if (message.conversation_id) {
            await supabase
              .from('voltmarket_conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', message.conversation_id)
          }

          const messageData = {
            type: 'new_message',
            message: {
              id: message.id,
              listing_id: message.listing_id,
              sender_id: message.sender_id,
              recipient_id: message.recipient_id,
              message: message.message,
              created_at: message.created_at,
              is_read: message.is_read,
            },
          }

          const senderConnectionId = userConnections.get(userId)
          if (senderConnectionId && connections.has(senderConnectionId)) {
            connections.get(senderConnectionId)?.send(JSON.stringify(messageData))
          }
          const recipientConnectionId = userConnections.get(data.recipientId)
          if (recipientConnectionId && connections.has(recipientConnectionId)) {
            connections.get(recipientConnectionId)?.send(JSON.stringify(messageData))
          }
          break
        }

        case 'mark_read': {
          if (!userId) return
          await supabase
            .from('voltmarket_messages')
            .update({ is_read: true })
            .eq('id', data.messageId)
            .eq('recipient_id', userId)

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
                messageId: data.messageId,
              }))
            }
          }
          break
        }

        case 'typing': {
          if (!userId) return
          const typingRecipientConnId = userConnections.get(data.recipientId)
          if (typingRecipientConnId && connections.has(typingRecipientConnId)) {
            connections.get(typingRecipientConnId)?.send(JSON.stringify({
              type: 'typing',
              senderId: userId,
              isTyping: data.isTyping,
            }))
          }
          break
        }

        default:
          console.log('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error processing message:', error instanceof Error ? error.message : 'unknown')
      try {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }))
      } catch {
        /* socket may already be closed */
      }
    }
  }

  const cleanup = () => {
    connections.delete(connectionId)
    if (userId && userConnections.get(userId) === connectionId) {
      userConnections.delete(userId)
    }
  }

  socket.onclose = () => {
    console.log(`WebSocket connection closed: ${connectionId}`)
    cleanup()
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
    cleanup()
  }

  return response
})
