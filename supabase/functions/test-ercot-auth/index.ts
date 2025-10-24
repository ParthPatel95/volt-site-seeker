import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ERCOT_API_KEY') || '';
    const apiKeySecondary = Deno.env.get('ERCOT_API_KEY_SECONDARY') || '';
    
    console.log('Testing ERCOT API authentication...');
    console.log('Primary key present:', !!apiKey);
    console.log('Secondary key present:', !!apiKeySecondary);
    
    const results: any = {
      apiKeyConfigured: !!apiKey,
      secondaryKeyConfigured: !!apiKeySecondary,
      tests: []
    };

    // Test 1: List all products (should work with just subscription key)
    const test1 = await testEndpoint(
      'https://api.ercot.com/api/public-reports',
      apiKey,
      'List Products'
    );
    results.tests.push(test1);

    // Test 2: Get specific product metadata
    const test2 = await testEndpoint(
      'https://api.ercot.com/api/public-reports/np6-788-cd',
      apiKey,
      'Get Product NP6-788-CD'
    );
    results.tests.push(test2);

    // Test 3: Try to access data endpoint
    const test3 = await testEndpoint(
      'https://api.ercot.com/api/public-reports/np6-788-cd/spp_hrly_avrg_agg',
      apiKey,
      'Access Data Endpoint'
    );
    results.tests.push(test3);

    // Test 4: Check if public-data endpoint exists
    const test4 = await testEndpoint(
      'https://api.ercot.com/api/public-data',
      apiKey,
      'Public Data Endpoint'
    );
    results.tests.push(test4);

    return new Response(
      JSON.stringify(results, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Test error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})

async function testEndpoint(url: string, apiKey: string, testName: string) {
  console.log(`\n=== Testing: ${testName} ===`);
  console.log(`URL: ${url}`);
  
  const result: any = {
    name: testName,
    url: url,
    status: 0,
    statusText: '',
    requiresAuth: false,
    responsePreview: ''
  };

  try {
    // Test without auth first
    const res1 = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LovableEnergy/1.0'
      }
    });
    
    const text1 = await res1.text();
    console.log(`Without auth: ${res1.status} ${res1.statusText}`);
    console.log(`Response preview:`, text1.slice(0, 200));

    if (res1.status === 401) {
      result.requiresAuth = true;
      console.log('401 - Testing with subscription key...');
      
      // Test with subscription key
      const res2 = await fetch(url, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'LovableEnergy/1.0'
        }
      });
      
      const text2 = await res2.text();
      console.log(`With subscription key: ${res2.status} ${res2.statusText}`);
      console.log(`Response preview:`, text2.slice(0, 200));
      
      result.status = res2.status;
      result.statusText = res2.statusText;
      result.responsePreview = text2.slice(0, 300);
      
      if (res2.status === 401) {
        result.message = 'Requires OAuth Bearer token (ID token) in addition to subscription key';
      }
    } else {
      result.status = res1.status;
      result.statusText = res1.statusText;
      result.responsePreview = text1.slice(0, 300);
    }
  } catch (error: any) {
    console.error(`Test failed:`, error);
    result.error = error.message;
  }

  return result;
}
