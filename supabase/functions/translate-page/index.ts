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

interface TranslationSegment {
  id: string;
  text: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, segments, targetLanguage, pageId } = await req.json();

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    // Handle segmented translation (new format)
    if (segments && Array.isArray(segments)) {
      console.log(`Translating ${segments.length} segments to ${languageName} for page ${pageId}`);

      // Format segments for translation with IDs
      const formattedContent = (segments as TranslationSegment[])
        .map((seg, idx) => `[T${idx.toString().padStart(3, '0')}]${seg.text}`)
        .join('\n');

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
              content: `You are a professional translator. Translate the following content to ${languageName}.

CRITICAL RULES:
1. Each line starts with a marker like [T001], [T002], etc.
2. You MUST preserve these markers EXACTLY as they appear
3. Translate ONLY the text after each marker
4. Keep the same line order
5. Keep technical terms (Bitcoin, MW, kWh, AESO, etc.) in English
6. Preserve numbers, percentages, and units exactly
7. Output format: [T001]translated text[T002]translated text...

Example input:
[T001]What is AESO?
[T002]The Alberta Electric System Operator manages the grid.

Example output for Hindi:
[T001]AESO क्या है?[T002]Alberta Electric System Operator ग्रिड का प्रबंधन करता है।`,
            },
            {
              role: 'user',
              content: formattedContent,
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

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle legacy content-based translation
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Missing content or segments' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translating page ${pageId} to ${languageName}, content length: ${content.length}`);

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
