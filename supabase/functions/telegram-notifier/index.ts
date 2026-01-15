import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  action: 'send_message' | 'test_connection' | 'get_chat_info';
  botToken: string;
  chatId: string;
  message?: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableNotification?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

// Send a message to Telegram
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  parseMode: string = 'HTML',
  disableNotification: boolean = false
): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
      disable_notification: disableNotification,
    }),
  });

  return await response.json();
}

// Test connection by getting bot info and verifying chat access
async function testConnection(botToken: string, chatId: string): Promise<{ success: boolean; botName?: string; chatTitle?: string; error?: string }> {
  try {
    // Get bot info
    const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    const botResponse = await fetch(botInfoUrl);
    const botData: TelegramResponse = await botResponse.json();

    if (!botData.ok) {
      return { success: false, error: `Invalid bot token: ${botData.description}` };
    }

    const botName = botData.result?.first_name || botData.result?.username;

    // Try to get chat info to verify chat_id
    const chatInfoUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    const chatResponse = await fetch(chatInfoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    });
    const chatData: TelegramResponse = await chatResponse.json();

    if (!chatData.ok) {
      return { 
        success: false, 
        botName,
        error: `Cannot access chat: ${chatData.description}. Make sure the bot is added to the group/channel.` 
      };
    }

    const chatTitle = chatData.result?.title || chatData.result?.first_name || 'Private Chat';

    // Send a test message
    const testMessage = `✅ <b>VoltSite Connection Test</b>\n\nBot "${botName}" successfully connected to this chat.\n\nYou will receive AESO market alerts here.`;
    const sendResult = await sendTelegramMessage(botToken, chatId, testMessage);

    if (!sendResult.ok) {
      return { 
        success: false, 
        botName,
        chatTitle,
        error: `Cannot send messages: ${sendResult.description}` 
      };
    }

    return { success: true, botName, chatTitle };
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` };
  }
}

// Get chat information
async function getChatInfo(botToken: string, chatId: string): Promise<TelegramResponse> {
  const url = `https://api.telegram.org/bot${botToken}/getChat`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId }),
  });

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: SendMessageRequest = await req.json();
    const { action, botToken, chatId, message, parseMode, disableNotification } = request;

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing botToken or chatId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any;

    switch (action) {
      case 'send_message':
        if (!message) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing message' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const sendResult = await sendTelegramMessage(
          botToken, 
          chatId, 
          message, 
          parseMode || 'HTML',
          disableNotification || false
        );
        result = { 
          success: sendResult.ok, 
          messageId: sendResult.result?.message_id,
          error: sendResult.description 
        };
        break;

      case 'test_connection':
        result = await testConnection(botToken, chatId);
        break;

      case 'get_chat_info':
        const chatInfo = await getChatInfo(botToken, chatId);
        result = { 
          success: chatInfo.ok, 
          chat: chatInfo.result,
          error: chatInfo.description 
        };
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Telegram ${action} result:`, JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Telegram notifier error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
