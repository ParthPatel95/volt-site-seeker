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
    // DOCX files are ZIP archives containing XML files
    // We'll extract text from document.xml using basic pattern matching
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(data);
    
    // Look for XML text content between <w:t> tags (Word text elements)
    const textMatches = content.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    const paragraphs: string[] = [];
    
    for (const match of textMatches) {
      if (match[1]) {
        paragraphs.push(match[1].trim());
      }
    }
    
    // Also try to extract any readable text
    let fallbackText = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const extractedText = paragraphs.length > 0 ? paragraphs.join('\n\n') : fallbackText;
    
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
    // XLSX files are also ZIP archives with XML worksheets
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(data);
    
    // Extract cell values from <v> or <t> tags (value/text elements)
    const cellMatches = content.matchAll(/<(?:v|t)[^>]*>([^<]+)<\/(?:v|t)>/g);
    const cells: string[] = [];
    
    for (const match of cellMatches) {
      if (match[1] && match[1].trim()) {
        cells.push(match[1].trim());
      }
    }
    
    const extractedText = cells.join('\n');
    
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
    // PPTX files contain slides as XML files
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(data);
    
    // Extract text from <a:t> tags (text elements in slides)
    const textMatches = content.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g);
    const slides: string[] = [];
    
    for (const match of textMatches) {
      if (match[1] && match[1].trim()) {
        slides.push(match[1].trim());
      }
    }
    
    const extractedText = slides.join('\n\n');
    
    if (extractedText.length < 10) {
      throw new Error('No readable text found in PPTX');
    }
    
    return extractedText;
  } catch (error) {
    console.error('[PPTX Parser] Error:', error);
    throw new Error('Failed to parse PPTX presentation. The file may be corrupted or password-protected.');
  }
}
