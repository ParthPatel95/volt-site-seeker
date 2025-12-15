import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_NAMES: Record<string, string> = {
  'hi': 'Hindi',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'it': 'Italian',
  'nl': 'Dutch',
  'ru': 'Russian',
  'ar': 'Arabic',
  'fa': 'Persian',
  'tr': 'Turkish',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, targetLanguage, pageId } = await req.json();

    if (!content || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing content or targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    console.log(`Translating page ${pageId} to ${languageName}, content length: ${content.length}`);

    // Call Lovable AI for translation with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in technical and financial content. Translate the following educational content about energy markets, Bitcoin mining, and datacenter infrastructure to ${languageName}. 

Guidelines:
- Maintain the original paragraph structure and formatting
- Keep technical terms accurate (Bitcoin, AESO, MW, kWh, etc. can remain in English if commonly used)
- Preserve numbers, percentages, and units
- Ensure natural, fluent translation suitable for business professionals
- Keep section headers and bullet points intact
- For RTL languages (Arabic, Urdu, Persian), ensure proper text direction`,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI translation failed: ${response.status}`);
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
