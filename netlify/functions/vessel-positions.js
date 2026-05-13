const https = require('https');

const API_KEY = 'WS-1C71E780-B9542D';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const mmsi = event.queryStringParameters?.mmsi;
  if (!mmsi) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'mmsi parameter required' }) };
  }

  const url = `https://api.vesselfinder.com/vessels?userkey=${API_KEY}&mmsi=${encodeURIComponent(mmsi)}`;
  console.log('[vessel-positions] Fetching:', url.replace(API_KEY, '***'));

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          console.log('[vessel-positions] Status:', res.statusCode, '— Body:', body.slice(0, 500));
          try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
          catch (e) { reject(new Error(`Non-JSON response (${res.statusCode}): ${body.slice(0, 300)}`)); }
        });
      }).on('error', reject);
    });

    return {
      statusCode: data.status,
      headers,
      body: JSON.stringify(data.body),
    };
  } catch (err) {
    console.error('[vessel-positions] Error:', err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
