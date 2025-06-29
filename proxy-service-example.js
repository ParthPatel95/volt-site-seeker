
// Enhanced proxy service for ERCOT and AESO APIs
// Deploy this to Vercel, Netlify, Cloudflare Workers, or any Node.js server

// ERCOT Proxy - For Vercel: /api/proxy-ercot.js
export default async function ercotHandler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Proxy-Source');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract endpoint from URL path or query
    const endpoint = req.query.endpoint || req.url.replace('/api/proxy-ercot', '');
    const fullUrl = `https://www.ercot.com/api/1/services/read/dashboards${endpoint}`;
    
    console.log('ERCOT Proxy Request:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ERCOT API error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('ERCOT Proxy Success');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('ERCOT Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ERCOT data', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// AESO Proxy - For Vercel: /api/proxy-aeso.js
export async function aesoHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-AESO-Sub-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get subscription key from headers or query
  const subscriptionKey = req.headers['x-aeso-sub-key'] || req.query.key;
  const endpoint = req.query.endpoint;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  if (!subscriptionKey) {
    return res.status(400).json({ error: 'Missing AESO subscription key' });
  }

  try {
    const url = new URL(`https://api.aeso.ca/report/v1.1${endpoint}`);
    
    // Add query parameters from request
    Object.keys(req.query).forEach(key => {
      if (key !== 'endpoint' && key !== 'key') {
        url.searchParams.append(key, req.query[key]);
      }
    });

    console.log('AESO Proxy Request:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'User-Agent': 'VoltScout-Proxy/1.0',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AESO API error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('AESO Proxy Success');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('AESO Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AESO data', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Cloudflare Workers version
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-AESO-Sub-Key, X-Proxy-Source',
        },
      });
    }

    try {
      if (url.pathname.startsWith('/ercot')) {
        return await handleERCOT(request, url);
      } else if (url.pathname.startsWith('/aeso')) {
        return await handleAESO(request, url, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

async function handleERCOT(request, url) {
  const endpoint = url.pathname.replace('/ercot', '') || '/todays-outlook.json';
  const ercotUrl = `https://www.ercot.com/api/1/services/read/dashboards${endpoint}`;
  
  const response = await fetch(ercotUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleAESO(request, url, env) {
  const subscriptionKey = request.headers.get('X-AESO-Sub-Key') || env.AESO_SUB_KEY;
  
  if (!subscriptionKey) {
    return new Response(JSON.stringify({ error: 'Missing AESO subscription key' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const endpoint = url.pathname.replace('/aeso', '');
  const aesoUrl = `https://api.aeso.ca/report/v1.1${endpoint}${url.search}`;
  
  const response = await fetch(aesoUrl, {
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'User-Agent': 'VoltScout-Proxy/1.0',
    },
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Instructions for deployment:
// 1. For Vercel: Deploy the individual handler functions as separate API routes
// 2. For Cloudflare Workers: Deploy the unified handler
// 3. Update the proxy URLs in the edge functions to point to your deployed proxy
// 4. Ensure environment variables are set correctly in your deployment platform

// Usage Examples:
// ERCOT: https://your-proxy.vercel.app/api/proxy-ercot?endpoint=/todays-outlook.json
// AESO: https://your-proxy.vercel.app/api/proxy-aeso?endpoint=/price/poolPrice&startDate=2025-06-29&endDate=2025-06-29&key=YOUR_KEY
