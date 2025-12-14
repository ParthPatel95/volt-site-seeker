import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Extract text from PDF using Gemini Vision
async function extractTextFromPdfWithVision(documentUrl: string, pageNumber: number, apiKey: string): Promise<string> {
  console.log('[translate-document] Extracting text from PDF via Gemini Vision:', { documentUrl: documentUrl.substring(0, 100), pageNumber });
  
  try {
    // Fetch the PDF as base64
    const pdfResponse = await fetch(documentUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
    }
    
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    
    // Chunked base64 encoding to avoid call stack overflow on large PDFs
    const uint8Array = new Uint8Array(pdfArrayBuffer);
    const chunkSize = 32768; // 32KB chunks
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    const pdfBase64 = btoa(binaryString);
    
    console.log('[translate-document] PDF fetched, size:', pdfArrayBuffer.byteLength, 'bytes');
    
    // Use Gemini Vision to extract text
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ALL text content from page ${pageNumber} of this PDF document. 
Preserve the original formatting, paragraph breaks, bullet points, and structure as much as possible.
Return ONLY the extracted text, no explanations or metadata.
If the page appears to be blank or you cannot read it, return "[Page ${pageNumber}: No text content found]".`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[translate-document] Vision API error:', response.status, errorText);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const result = await response.json();
    const extractedText = result.choices?.[0]?.message?.content || '';
    
    console.log('[translate-document] Text extracted, length:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('[translate-document] Vision extraction failed:', error);
    throw error;
  }
}

// Helper: Fetch and extract text from text-based files
async function extractTextFromUrl(documentUrl: string, documentType?: string): Promise<string> {
  console.log('[translate-document] Fetching text from URL:', documentUrl.substring(0, 100));
  
  const response = await fetch(documentUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.status}`);
  }
  
  const text = await response.text();
  console.log('[translate-document] Text fetched, length:', text.length);
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      text, 
      documentUrl, 
      targetLanguage, 
      documentId, 
      pageNumber = 1, 
      stream = true,
      extractServerSide = false,
      documentType
    } = body;
    
    console.log('[translate-document] Request received:', {
      hasText: !!text,
      hasDocumentUrl: !!documentUrl,
      targetLanguage,
      documentId,
      pageNumber,
      stream,
      extractServerSide,
      documentType
    });

    // Validate: need either text or documentUrl with extractServerSide
    if (!text && !documentUrl) {
      console.error('[translate-document] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text or documentUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!targetLanguage) {
      console.error('[translate-document] Missing targetLanguage');
      return new Response(
        JSON.stringify({ error: 'Missing required field: targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[translate-document] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Determine the text to translate
    let textToTranslate = text;
    
    // If extractServerSide is true and we have documentUrl, extract text server-side
    if (extractServerSide && documentUrl && !text) {
      console.log('[translate-document] Server-side extraction requested');
      
      const isPdf = documentType === 'application/pdf' || documentUrl?.endsWith('.pdf');
      const isText = documentType?.startsWith('text/') || /\.(txt|md|csv|log)$/i.test(documentUrl || '');
      
      try {
        if (isPdf) {
          // Use Gemini Vision for PDF extraction
          textToTranslate = await extractTextFromPdfWithVision(documentUrl, pageNumber, LOVABLE_API_KEY);
        } else if (isText) {
          // Directly fetch text content
          textToTranslate = await extractTextFromUrl(documentUrl, documentType);
        } else {
          // For other document types, try Gemini Vision
          console.log('[translate-document] Using Vision API for non-PDF document');
          textToTranslate = await extractTextFromPdfWithVision(documentUrl, pageNumber, LOVABLE_API_KEY);
        }
        
        if (!textToTranslate || textToTranslate.length < 10) {
          console.warn('[translate-document] Extracted text is empty or too short');
          return new Response(
            JSON.stringify({ error: 'Could not extract text from document. The page may be empty or contain only images.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (extractError) {
        console.error('[translate-document] Text extraction failed:', extractError);
        return new Response(
          JSON.stringify({ error: 'Failed to extract text from document. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (!textToTranslate) {
      console.error('[translate-document] No text to translate after extraction');
      return new Response(
        JSON.stringify({ error: 'No text content found to translate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate text hash for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(textToTranslate);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first (if documentId provided)
    if (documentId && pageNumber !== undefined) {
      console.log('[translate-document] Checking cache for:', { documentId, pageNumber, targetLanguage });
      const { data: cached } = await supabaseClient
        .from('document_translations')
        .select('translated_text')
        .eq('document_id', documentId)
        .eq('page_number', pageNumber)
        .eq('target_language', targetLanguage)
        .eq('text_hash', textHash)
        .maybeSingle();

      if (cached) {
        console.log('[translate-document] Cache HIT for document:', documentId, 'page:', pageNumber);
        return new Response(
          JSON.stringify({ translatedText: cached.translated_text, cached: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('[translate-document] Cache MISS, proceeding with translation');
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
      'ar': 'Arabic',
      'hi': 'Hindi',
      'gu': 'Gujarati'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    console.log('[translate-document] Translating to:', targetLangName, 'text length:', textToTranslate.length);

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
          { role: 'user', content: textToTranslate }
        ],
        stream: stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('[translate-document] Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('[translate-document] Credits exhausted');
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

    console.log('[translate-document] AI response received, streaming:', stream);

    // Handle streaming response
    if (stream && response.body) {
      const reader = response.body.getReader();
      const textEncoder = new TextEncoder();
      const textDecoder = new TextDecoder();

      const streamResponse = new ReadableStream({
        async start(controller) {
          let fullTranslation = '';
          let buffer = ''; // Buffer for incomplete lines
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Append to buffer
              buffer += textDecoder.decode(value, { stream: true });
              
              // Process complete lines
              let newlineIndex: number;
              while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);
                
                if (!line || line.startsWith(':')) continue; // Skip empty lines and comments
                
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    if (content) {
                      fullTranslation += content;
                      controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ delta: content })}\n\n`));
                    }
                  } catch (e) {
                    // Silently skip malformed JSON chunks
                    console.warn('[translate-document] Skipping malformed chunk');
                  }
                }
              }
            }

            console.log('[translate-document] Streaming complete, total length:', fullTranslation.length);

            // Cache the complete translation
            if (documentId && pageNumber !== undefined && fullTranslation) {
              try {
                await supabaseClient
                  .from('document_translations')
                  .insert({
                    document_id: documentId,
                    page_number: pageNumber,
                    source_language: 'en',
                    target_language: targetLanguage,
                    original_text: textToTranslate.substring(0, 10000), // Limit stored original
                    translated_text: fullTranslation,
                    text_hash: textHash
                  });
                console.log('[translate-document] Translation cached for document:', documentId, 'page:', pageNumber);
              } catch (cacheError) {
                console.error('[translate-document] Failed to cache translation:', cacheError);
              }
            }

            controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('[translate-document] Streaming error:', error);
            controller.error(error);
          }
        }
      });

      return new Response(streamResponse, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const aiResponse = await response.json();
    const translatedText = aiResponse.choices?.[0]?.message?.content;

    if (!translatedText) {
      console.error('[translate-document] No translation returned from AI');
      return new Response(
        JSON.stringify({ error: 'No translation returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[translate-document] Non-streaming translation complete, length:', translatedText.length);

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
            original_text: textToTranslate.substring(0, 10000),
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
    console.error('[translate-document] Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
