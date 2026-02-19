// Vercel Serverless Function para Bitunix Proxy
// Maneja rutas: /api/bitunix/*
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
        // Extraer el endpoint de la URL: /api/bitunix/api/v1/account/balance -> /api/v1/account/balance
        const fullPath = req.url.replace(/^\/api\/bitunix/, '') || req.url;
        const [endpoint, queryPart] = fullPath.split('?');
        
        const apiKey = req.headers['x-api-key'];
        const secretKey = req.headers['x-secret-key'];

        // Si no hay credenciales, puede ser una llamada pública
        if (!apiKey || !secretKey) {
            // Endpoint público
            const url = `https://api.bitunix.com${endpoint}${queryPart ? '?' + queryPart : ''}`;
            const response = await fetch(url, {
                method: req.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return res.json(data);
        }

        // Request autenticada - Bitunix usa firma HMAC SHA256
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

        // Generar firma Bitunix: HMAC SHA256 del query string ordenado
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(queryParams)
            .digest('hex');

        // URL final con firma
        const url = `https://api.bitunix.com${endpoint}?${queryParams}&signature=${signature}`;

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'X-BX-APIKEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        
        // Si Bitunix responde con error, retornar con status original
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        return res.json(data);
    } catch (error) {
        console.error('❌ Bitunix Proxy Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
