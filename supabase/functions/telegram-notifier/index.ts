import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";

// (Audit-2026-06-25 P0/PR2.) Previously this function accepted `botToken`
// from the request body and relayed messages through ANY Telegram bot the
// caller chose. That made it an open Telegram relay reachable through your
// project URL — a free reputation-burning spam tool — and it had no caller
// authentication. Now: the bot token is read server-side from
// TELEGRAM_BOT_TOKEN (Supabase secret). Callers may NOT supply their own
// token. Callers must be authenticated. We log only redacted ids, never the
// API response body (which used to leak bot metadata to console).
interface SendMessageRequest {
  action: 'send_message' | 'test_connection' | 'get_chat_info';
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
    // Auth: relay endpoints must not be open. We require any logged-in user
    // here (not admin) because internal alert workflows want to call this
    // from server-side code with a service-role token too — and getUser will
    // succeed for those.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const gate = await requireUser(req, supabase);
    if (gate instanceof Response) return gate;

    const request: SendMessageRequest = await req.json();
    const { action, chatId, message, parseMode, disableNotification } = request;

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'TELEGRAM_BOT_TOKEN not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!chatId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing chatId' }),
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

    // Log only the action + a coarse outcome — never the full Telegram API
    // response (which can include bot metadata, chat titles, member counts).
    console.log(`Telegram ${action} ok=${Boolean((result as { success?: boolean }).success)}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Telegram notifier error');
    return new Response(
      JSON.stringify({ success: false, error: 'internal' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
