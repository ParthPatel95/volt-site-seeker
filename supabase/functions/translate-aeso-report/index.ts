import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_NAMES: Record<string, string> = {
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'hi': 'Hindi',
  'gu': 'Gujarati',
  'ja': 'Japanese',
  'ko': 'Korean',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ar': 'Arabic'
};

interface TranslateRequest {
  reportId: string;
  targetLanguage: string;
  content: {
    title?: string;
    sections: Array<{
      key: string;
      text: string;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const body: TranslateRequest = await req.json();
    console.log('[Translate AESO Report] Report ID:', body.reportId);
    console.log('[Translate AESO Report] Target language:', body.targetLanguage);

    // Check cache first
    const { data: cached } = await supabase
      .from('aeso_report_translations')
      .select('translated_content')
      .eq('report_id', body.reportId)
      .eq('target_language', body.targetLanguage)
      .single();

    if (cached) {
      console.log('[Translate AESO Report] Returning cached translation');
      return new Response(JSON.stringify({
        success: true,
        cached: true,
        translation: cached.translated_content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build translation prompt
    const languageName = LANGUAGE_NAMES[body.targetLanguage] || body.targetLanguage;
    const sectionsText = body.content.sections.map(s => `[${s.key}]\n${s.text}`).join('\n\n');

    const systemPrompt = `You are a professional translator specializing in energy market and financial documents. 
Translate the following AESO (Alberta Electric System Operator) analysis report content to ${languageName}.
Maintain all numerical values, dates, currency symbols, and technical terms as-is.
Keep the same structure with [section_key] markers.
Ensure the translation is professional and suitable for business/investor audiences.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sectionsText }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Translate AESO Report] OpenAI error:', errorData);
      throw new Error('Translation service error');
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content || '';

    // Parse translated sections
    const translatedSections: Record<string, string> = {};
    const sectionRegex = /\[([^\]]+)\]\n([\s\S]*?)(?=\n\[|$)/g;
    let match;
    while ((match = sectionRegex.exec(translatedText)) !== null) {
      translatedSections[match[1]] = match[2].trim();
    }

    // Translate title if provided
    let translatedTitle = body.content.title;
    if (body.content.title) {
      const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `Translate this report title to ${languageName}. Keep it concise.` },
            { role: 'user', content: body.content.title }
          ],
          temperature: 0.2,
          max_tokens: 100
        })
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        translatedTitle = titleData.choices[0]?.message?.content || body.content.title;
      }
    }

    const translatedContent = {
      title: translatedTitle,
      sections: translatedSections,
      language: body.targetLanguage,
      languageName
    };

    // Cache the translation
    await supabase
      .from('aeso_report_translations')
      .insert({
        report_id: body.reportId,
        target_language: body.targetLanguage,
        translated_content: translatedContent
      });

    console.log('[Translate AESO Report] Translation completed and cached');

    return new Response(JSON.stringify({
      success: true,
      cached: false,
      translation: translatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Translate AESO Report] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
