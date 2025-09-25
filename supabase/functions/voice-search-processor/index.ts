import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, audioData, searchQuery, userId, searchType = 'voice' } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Voice search request:', { action, searchType, hasAudio: !!audioData });

    switch (action) {
      case 'transcribe_audio': {
        if (!audioData) {
          throw new Error('Audio data is required for transcription');
        }

        // Convert base64 audio to binary
        const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));

        // Create form data for OpenAI Whisper API
        const formData = new FormData();
        formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');

        const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
          },
          body: formData,
        });

        if (!transcriptionResponse.ok) {
          throw new Error('Failed to transcribe audio');
        }

        const transcriptionResult = await transcriptionResponse.json();
        const transcribedText = transcriptionResult.text;

        // Process the transcribed text through search
        const searchResults = await performIntelligentSearch(supabase, transcribedText);

        // Log the voice search
        await supabase
          .from('voice_search_logs')
          .insert({
            user_id: userId,
            search_query: transcribedText,
            audio_duration_ms: audioData.length * 0.1, // Rough estimate
            search_results: searchResults,
            search_type: 'voice'
          });

        return new Response(JSON.stringify({
          success: true,
          transcription: transcribedText,
          searchResults
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'text_search': {
        if (!searchQuery) {
          throw new Error('Search query is required');
        }

        const searchResults = await performIntelligentSearch(supabase, searchQuery);

        // Log the text search
        await supabase
          .from('voice_search_logs')
          .insert({
            user_id: userId,
            search_query: searchQuery,
            search_results: searchResults,
            search_type: 'text'
          });

        return new Response(JSON.stringify({
          success: true,
          searchResults
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'natural_language_query': {
        // Use OpenAI to interpret natural language and convert to structured search
        const interpretation = await interpretNaturalLanguageQuery(searchQuery, openAIApiKey);
        const searchResults = await performStructuredSearch(supabase, interpretation);

        await supabase
          .from('voice_search_logs')
          .insert({
            user_id: userId,
            search_query: searchQuery,
            search_results: { interpretation, results: searchResults },
            search_type: 'natural_language'
          });

        return new Response(JSON.stringify({
          success: true,
          interpretation,
          searchResults
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_search_history': {
        const { data: searchHistory } = await supabase
          .from('voice_search_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        return new Response(JSON.stringify({
          success: true,
          searchHistory: searchHistory || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in voice search processor:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function performIntelligentSearch(supabase: any, query: string) {
  const results: any = {
    properties: [],
    companies: [],
    energyRates: [],
    listings: [],
    summary: ''
  };

  const searchTerms = query.toLowerCase();

  // Search properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .or(`description.ilike.%${searchTerms}%,address.ilike.%${searchTerms}%,city.ilike.%${searchTerms}%`)
    .limit(10);

  results.properties = properties || [];

  // Search companies
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .or(`name.ilike.%${searchTerms}%,industry.ilike.%${searchTerms}%,sector.ilike.%${searchTerms}%`)
    .limit(10);

  results.companies = companies || [];

  // Search VoltMarket listings if query mentions power or energy
  if (searchTerms.includes('power') || searchTerms.includes('energy') || searchTerms.includes('mw')) {
    const { data: energyRates } = await supabase
      .from('energy_rates')
      .select('*, energy_markets(*)')
      .order('timestamp', { ascending: false })
      .limit(10);

    results.energyRates = energyRates || [];
  }

  // Generate AI summary
  results.summary = `Found ${results.properties.length} properties, ${results.companies.length} companies, and ${results.energyRates.length} energy data points related to "${query}".`;

  return results;
}

async function interpretNaturalLanguageQuery(query: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an energy market and real estate search assistant. Convert natural language queries into structured search parameters. 

          Return a JSON object with these fields:
          - searchType: 'property', 'company', 'energy', 'investment', 'due_diligence'
          - filters: object with relevant search filters
          - intent: brief description of what the user is looking for
          - keywords: array of key search terms`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to interpret query');
  }

  const result = await response.json();
  
  try {
    return JSON.parse(result.choices[0].message.content);
  } catch {
    return {
      searchType: 'general',
      filters: {},
      intent: query,
      keywords: query.split(' ').filter(word => word.length > 3)
    };
  }
}

async function performStructuredSearch(supabase: any, interpretation: any) {
  const { searchType, filters, keywords } = interpretation;
  
  switch (searchType) {
    case 'property':
      return await searchProperties(supabase, filters, keywords);
    case 'company':
      return await searchCompanies(supabase, filters, keywords);
    case 'energy':
      return await searchEnergyData(supabase, filters, keywords);
    case 'investment':
      return await searchInvestmentOpportunities(supabase, filters, keywords);
    default:
      return await performIntelligentSearch(supabase, keywords.join(' '));
  }
}

async function searchProperties(supabase: any, filters: any, keywords: string[]) {
  let query = supabase.from('properties').select('*');
  
  if (filters.priceRange) {
    if (filters.priceRange.min) query = query.gte('asking_price', filters.priceRange.min);
    if (filters.priceRange.max) query = query.lte('asking_price', filters.priceRange.max);
  }
  
  if (filters.powerCapacity) {
    if (filters.powerCapacity.min) query = query.gte('power_capacity_mw', filters.powerCapacity.min);
  }
  
  if (filters.location) {
    query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
  }
  
  const { data } = await query.limit(20);
  return data || [];
}

async function searchCompanies(supabase: any, filters: any, keywords: string[]) {
  let query = supabase.from('companies').select('*');
  
  if (filters.industry) {
    query = query.ilike('industry', `%${filters.industry}%`);
  }
  
  if (filters.marketCap) {
    if (filters.marketCap.min) query = query.gte('market_cap', filters.marketCap.min);
    if (filters.marketCap.max) query = query.lte('market_cap', filters.marketCap.max);
  }
  
  const { data } = await query.limit(20);
  return data || [];
}

async function searchEnergyData(supabase: any, filters: any, keywords: string[]) {
  const { data } = await supabase
    .from('energy_rates')
    .select('*, energy_markets(*)')
    .order('timestamp', { ascending: false })
    .limit(50);
  
  return data || [];
}

async function searchInvestmentOpportunities(supabase: any, filters: any, keywords: string[]) {
  const results: any = {};
  
  // Get distress alerts
  const { data: distressAlerts } = await supabase
    .from('distress_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  // Get investment scores
  const { data: investmentScores } = await supabase
    .from('investment_scores')
    .select('*, companies(*)')
    .order('overall_score', { ascending: false })
    .limit(10);
  
  results.distressAlerts = distressAlerts || [];
  results.investmentScores = investmentScores || [];
  
  return results;
}