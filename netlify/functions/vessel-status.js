const https = require('https');

exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const apiKey = process.env.VESSELFINDER_API_KEY;
  if (!apiKey) {
    console.error('[vessel-status] VESSELFINDER_API_KEY environment variable is not set');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const url = `https://api.vesselfinder.com/status?userkey=${apiKey}`;

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          console.log('[vessel-status] Response status:', res.statusCode, '— Body:', body.slice(0, 500));
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
    console.error('[vessel-status] Error:', err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
