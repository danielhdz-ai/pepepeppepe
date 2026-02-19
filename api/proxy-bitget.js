// Vercel Serverless Function para Bitget Proxy
// Maneja rutas: /api/proxy-bitget/*
// El frontend envía los headers de autenticación ya calculados

export default async function handler(req, res) {
    // CORS headers - permitir todos los headers personalizados de Bitget
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'ACCESS-KEY, ACCESS-SIGN, ACCESS-TIMESTAMP, ACCESS-PASSPHRASE, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // En Vercel, req.url ya viene sin /api/proxy-bitget
        // Ejemplo: req.url = "/api/v2/mix/order/fills?symbol=BTCUSDT"
        const endpoint = req.url;
        
        // Usar headers tal como vienen del cliente (ACCESS-KEY, ACCESS-SIGN, etc.)
        const apiKey = req.headers['access-key'];
        const signature = req.headers['access-sign'];
        const timestamp = req.headers['access-timestamp'];
        const passphrase = req.headers['access-passphrase'];

        if (!apiKey || !signature || !timestamp || !passphrase) {
            return res.status(400).json({
                success: false,
                error: 'Faltan headers de autenticación (ACCESS-KEY, ACCESS-SIGN, ACCESS-TIMESTAMP, ACCESS-PASSPHRASE)'
            });
        }

        const url = `https://api.bitget.com${endpoint}`;
        const method = req.method.toUpperCase();

        const fetchOptions = {
            method: method,
            headers: {
                'ACCESS-KEY': apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': passphrase,
                'Content-Type': 'application/json',
                'locale': 'en-US'
            }
        };

        // Solo incluir body si es POST y hay datos
        if (method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();
        
        // Si Bitget responde con error, retornar con status original
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        return res.json(data);
    } catch (error) {
        console.error('❌ Bitget Proxy Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
