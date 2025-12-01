import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, documentId, pageNumber, ocrMethod = 'ai_vision' } = await req.json();
    
    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check cache first
    if (documentId && pageNumber !== undefined) {
      const { data: cached, error: cacheError } = await supabase
        .from('ocr_extractions')
        .select('extracted_text, confidence_score, ocr_method')
        .eq('document_id', documentId)
        .eq('page_number', pageNumber)
        .eq('ocr_method', ocrMethod)
        .maybeSingle();
      
      if (cached && !cacheError) {
        console.log(`[OCR] Cache hit for ${documentId} page ${pageNumber}`);
        return new Response(
          JSON.stringify({ 
            text: cached.extracted_text, 
            method: cached.ocr_method,
            confidence: cached.confidence_score,
            cached: true,
            success: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('[OCR] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OCR service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[OCR] Processing image', { documentId, pageNumber, imageSize: imageBase64.length });
    const startTime = Date.now();

    // Use Lovable AI (Gemini 2.5 Flash) with vision capability to extract text
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this document image. Preserve paragraph structure, formatting, and reading order. Return only the extracted text without any commentary or explanations.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`
              }
            }
          ]
        }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'OCR rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'OCR credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('[OCR] AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'OCR processing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';
    
    // Estimate confidence (AI models don't provide confidence, so use heuristic)
    const confidence = extractedText.length > 50 ? 0.95 : 0.75;
    const processingTime = Date.now() - startTime;

    console.log('[OCR] Text extracted successfully', {
      documentId,
      pageNumber,
      textLength: extractedText.length,
      confidence,
      processingTime
    });
    
    // Cache the result
    if (documentId && pageNumber !== undefined) {
      const { error: insertError } = await supabase
        .from('ocr_extractions')
        .insert({
          document_id: documentId,
          page_number: pageNumber,
          extracted_text: extractedText,
          ocr_method: ocrMethod,
          confidence_score: confidence,
          processing_time_ms: processingTime
        });
      
      if (insertError) {
        console.error('[OCR] Failed to cache result:', insertError);
      } else {
        console.log(`[OCR] Cached result for ${documentId} page ${pageNumber}`);
      }
    }

    return new Response(
      JSON.stringify({
        text: extractedText,
        method: ocrMethod,
        confidence,
        processingTime,
        cached: false,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[OCR] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
