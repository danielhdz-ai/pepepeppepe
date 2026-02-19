// Vercel Serverless Function para MEXC Proxy
// Maneja: POST /api/proxy-mexc con body { apiKey, secretKey, endpoint, params }
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Aceptar tanto GET como POST
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST or GET.' });
    }

    try {
        const { apiKey, secretKey, endpoint, params = {} } = req.body;

        if (!apiKey || !secretKey || !endpoint) {
            return res.status(400).json({
                success: false,
                error: 'Faltan apiKey, secretKey o endpoint en el body'
            });
        }

        const timestamp = Date.now().toString();
        
        // Ordenar parámetros alfabéticamente para MEXC
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key];
                return acc;
            }, {});

        const queryString = new URLSearchParams(sortedParams).toString();
        
        // Firma MEXC: apiKey + timestamp + sortedParams
        const signString = `${apiKey}${timestamp}${queryString}`;
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(signString)
            .digest('hex');

        const url = `https://contract.mexc.com${endpoint}${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'ApiKey': apiKey,
                'Request-Time': timestamp,
                'Signature': signature,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error('❌ MEXC Proxy Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
