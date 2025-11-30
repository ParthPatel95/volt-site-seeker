import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, documentId, pageNumber } = await req.json();
    
    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate text hash for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first (if documentId provided)
    if (documentId && pageNumber !== undefined) {
      const { data: cached } = await supabaseClient
        .from('document_translations')
        .select('translated_text')
        .eq('document_id', documentId)
        .eq('page_number', pageNumber)
        .eq('target_language', targetLanguage)
        .eq('text_hash', textHash)
        .maybeSingle();

      if (cached) {
        console.log('[translate-document] Cache hit for document:', documentId, 'page:', pageNumber);
        return new Response(
          JSON.stringify({ translatedText: cached.translated_text, cached: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Language configuration
    const languageNames: Record<string, string> = {
      'zh-CN': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'ja': 'Japanese',
      'ko': 'Korean',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Call Lovable AI for translation
    const systemPrompt = `You are a professional document translator specializing in business and investor communications. 
Translate the following English text to ${targetLangName}. 
Preserve all formatting, paragraph breaks, bullet points, and document structure. 
Maintain professional business terminology appropriate for investor communications.
If there are technical terms, numbers, or proper nouns, keep them accurate.
Return ONLY the translated text without any explanations or metadata.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Translation credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('[translate-document] AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Translation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const translatedText = aiResponse.choices?.[0]?.message?.content;

    if (!translatedText) {
      return new Response(
        JSON.stringify({ error: 'No translation returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the translation (if documentId provided)
    if (documentId && pageNumber !== undefined) {
      try {
        await supabaseClient
          .from('document_translations')
          .insert({
            document_id: documentId,
            page_number: pageNumber,
            source_language: 'en',
            target_language: targetLanguage,
            original_text: text,
            translated_text: translatedText,
            text_hash: textHash
          });
        console.log('[translate-document] Translation cached for document:', documentId, 'page:', pageNumber);
      } catch (cacheError) {
        // Non-critical error, continue
        console.error('[translate-document] Failed to cache translation:', cacheError);
      }
    }

    return new Response(
      JSON.stringify({ translatedText, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[translate-document] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
