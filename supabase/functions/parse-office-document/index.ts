import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentUrl, documentType, documentId } = await req.json();

    if (!documentUrl) {
      return new Response(
        JSON.stringify({ error: 'documentUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Office Parser] Processing document', { documentType, documentUrl: documentUrl.substring(0, 100) });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first
    if (documentId) {
      const { data: cached, error: cacheError } = await supabase
        .from('ocr_extractions')
        .select('extracted_text')
        .eq('document_id', documentId)
        .eq('page_number', 1)
        .eq('ocr_method', 'office_parser')
        .maybeSingle();
      
      if (cached && !cacheError) {
        console.log(`[Office Parser] Cache hit for ${documentId}`);
        return new Response(
          JSON.stringify({ 
            text: cached.extracted_text,
            cached: true,
            success: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch the document
    const docResponse = await fetch(documentUrl);
    if (!docResponse.ok) {
      throw new Error(`Failed to fetch document: ${docResponse.status}`);
    }

    const arrayBuffer = await docResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let extractedText = '';
    const startTime = Date.now();

    // Parse based on document type
    if (documentType?.includes('word') || documentType?.includes('document') || documentUrl.match(/\.docx?$/i)) {
      // DOCX parsing using basic XML extraction
      console.log('[Office Parser] Parsing DOCX');
      extractedText = await parseDocx(uint8Array);
    } else if (documentType?.includes('sheet') || documentUrl.match(/\.xlsx?$/i)) {
      // XLSX parsing
      console.log('[Office Parser] Parsing XLSX');
      extractedText = await parseXlsx(uint8Array);
    } else if (documentType?.includes('presentation') || documentUrl.match(/\.pptx?$/i)) {
      // PPTX parsing
      console.log('[Office Parser] Parsing PPTX');
      extractedText = await parsePptx(uint8Array);
    } else {
      // Fallback: try to extract as text
      console.log('[Office Parser] Unknown type, attempting text extraction');
      const decoder = new TextDecoder('utf-8', { fatal: false });
      extractedText = decoder.decode(uint8Array);
      
      // Clean up binary artifacts
      extractedText = extractedText
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error('Unable to extract meaningful text from document. The document may be protected, corrupted, or in an unsupported format.');
    }

    const processingTime = Date.now() - startTime;
    console.log('[Office Parser] Extraction complete', { 
      textLength: extractedText.length,
      processingTime
    });

    // Cache the result
    if (documentId) {
      const { error: insertError } = await supabase
        .from('ocr_extractions')
        .insert({
          document_id: documentId,
          page_number: 1,
          extracted_text: extractedText,
          ocr_method: 'office_parser',
          processing_time_ms: processingTime
        });
      
      if (insertError) {
        console.error('[Office Parser] Failed to cache result:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        text: extractedText,
        cached: false,
        success: true,
        processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Office Parser] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Document parsing failed',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function parseDocx(data: Uint8Array): Promise<string> {
  try {
    console.log('[DOCX Parser] Using AI vision to extract text from Office document');
    
    // Use AI vision to extract text (more reliable than XML parsing)
    const base64Data = btoa(String.fromCharCode(...data));
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text content from this document. Return only the extracted text without any commentary or formatting.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64Data}`
              }
            }
          ]
        }]
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';

    if (extractedText.length < 10) {
      throw new Error('No readable text found in DOCX');
    }

    return extractedText;
  } catch (error) {
    console.error('[DOCX Parser] Error:', error);
    throw new Error('Failed to parse DOCX document. The file may be corrupted or password-protected.');
  }
}

async function parseXlsx(data: Uint8Array): Promise<string> {
  try {
    console.log('[XLSX Parser] Using AI vision to extract text from spreadsheet');
    
    const base64Data = btoa(String.fromCharCode(...data));
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text and data from this spreadsheet. Return the data in a readable format, preserving rows and columns.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`
              }
            }
          ]
        }]
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';

    if (extractedText.length < 5) {
      throw new Error('No readable data found in XLSX');
    }

    return extractedText;
  } catch (error) {
    console.error('[XLSX Parser] Error:', error);
    throw new Error('Failed to parse XLSX spreadsheet. The file may be corrupted or password-protected.');
  }
}

async function parsePptx(data: Uint8Array): Promise<string> {
  try {
    console.log('[PPTX Parser] Using AI vision to extract text from presentation');
    
    const base64Data = btoa(String.fromCharCode(...data));
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text content from this presentation. Include slide titles and body text. Return only the extracted text.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64Data}`
              }
            }
          ]
        }]
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';

    if (extractedText.length < 10) {
      throw new Error('No readable text found in PPTX');
    }

    return extractedText;
  } catch (error) {
    console.error('[PPTX Parser] Error:', error);
    throw new Error('Failed to parse PPTX presentation. The file may be corrupted or password-protected.');
  }
}
