// Vercel Serverless Function para BingX Proxy
// Maneja rutas: /api/bingx/*
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-API-KEY, X-SECRET-KEY, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // En Vercel, req.url ya viene sin /api/proxy-bingx
        // Ejemplo: req.url = "/openApi/swap/v2/user/balance?param=value"
        const [endpoint, queryPart] = req.url.split('?');
        
        const apiKey = req.headers['x-api-key'];
        const secretKey = req.headers['x-secret-key'];

        // Si no hay credenciales, puede ser una llamada pública
        if (!apiKey || !secretKey) {
            // Endpoint público
            const url = `https://open-api.bingx.com${endpoint}${queryPart ? '?' + queryPart : ''}`;
            const response = await fetch(url, {
                method: req.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return res.json(data);
        }

        // Request autenticada - BingX requiere firma específica
        const timestamp = Date.now().toString();
        
        // Parsear parámetros existentes
        const existingParams = queryPart ? Object.fromEntries(new URLSearchParams(queryPart)) : {};
        
        // Agregar timestamp a los parámetros
        const allParams = {
            ...existingParams,
            timestamp: timestamp
        };

        // Ordenar parámetros alfabéticamente y construir query string
        const sortedKeys = Object.keys(allParams).sort();
        const queryParams = sortedKeys
            .map(key => `${key}=${allParams[key]}`)
            .join('&');

        // Generar firma BingX: HMAC SHA256 del query string ordenado
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(queryParams)
            .digest('hex');

        // URL final con firma
        const url = `https://open-api.bingx.com${endpoint}?${queryParams}&signature=${signature}`;

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'X-BX-APIKEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: req.method === 'POST' && req.body ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error('❌ BingX Proxy Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
