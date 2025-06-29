
// Example proxy service for ERCOT and AESO APIs
// Deploy this to Vercel, Netlify, or any Node.js server

// For Vercel: /api/proxy-ercot.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://www.ercot.com/api/1/services/read/dashboards/todays-outlook.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.ercot.com/',
        'Origin': 'https://www.ercot.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch ERCOT data' });
  }
}

// For Vercel: /api/proxy-aeso.js
export async function aesoProxy(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, subscriptionKey } = req.query;
  
  if (!endpoint || !subscriptionKey) {
    return res.status(400).json({ error: 'Missing endpoint or subscription key' });
  }

  try {
    const response = await fetch(`https://api.aeso.ca/report/v1.1${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'User-Agent': 'VoltScout-Proxy/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('AESO Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch AESO data' });
  }
}

// Instructions for deployment:
// 1. Deploy these functions to Vercel as /api/proxy-ercot.js and /api/proxy-aeso.js
// 2. Update ERCOT_CONFIG.proxyUrl in the edge function to point to your Vercel URL
// 3. Update AESO requests to use the proxy URL when direct API fails
