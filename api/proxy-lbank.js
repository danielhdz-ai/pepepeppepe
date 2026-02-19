// Vercel Serverless Function para LBank Proxy con soporte RSA
// Maneja: POST /api/proxy-lbank
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, LBank-API-Key, LBank-Timestamp');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    try {
        const { apiKey, privateKey, endpoint, params = {}, timestamp } = req.body;

        if (!apiKey || !privateKey || !endpoint) {
            return res.status(400).json({
                success: false,
                error: 'Faltan apiKey, privateKey o endpoint en el body'
            });
        }

        const lbankTimestamp = timestamp || Date.now().toString();
        
        // 1. Preparar parámetros incluyendo API Key y Timestamp
        const finalParams = {
            ...params,
            api_key: apiKey,
            timestamp: lbankTimestamp,
            sign_type: 'RSA'
        };

        // 2. Ordenar parámetros alfabéticamente por clave
        const sortedKeys = Object.keys(finalParams).sort();
        const signString = sortedKeys
            .map(key => `${key}=${finalParams[key]}`)
            .join('&');

        console.log('📄 String para firmar LBank:', signString);

        // 3. Generar MD5 del string (uppercase)
        const md5Hash = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
        console.log('🔐 MD5 Hash:', md5Hash);

        // 4. Generar firma RSA-SHA256 del MD5
        let signature = '';
        try {
            const signer = crypto.createSign('RSA-SHA256');
            signer.update(md5Hash);
            // Asegurarse de que la clave privada tenga el formato correcto
            let formattedKey = privateKey;
            if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
                // Si viene sin cabeceras, intentamos envolverla (aunque se recomienda pegarla entera)
                formattedKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
            }
            
            signature = signer.sign(formattedKey, 'base64');
        } catch (keyError) {
            console.error('❌ Error en el formato de la Clave Privada RSA:', keyError);
            return res.status(400).json({
                success: false, 
                error: 'Formato de clave privada RSA inválido. Asegúrate de incluir -----BEGIN PRIVATE KEY-----'
            });
        }

        console.log('✅ Firma RSA generada:', signature.substring(0, 20) + '...');

        // 5. Agregar firma a los parámetros
        finalParams.sign = signature;

        // 6. Realizar la petición a LBank
        // LBank v2 suele usar POST para endpoints públicos y privados
        const url = `https://api.lbank.info${endpoint}`;
        
        console.log('📡 Petición a LBank:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(finalParams).toString()
        });

        const data = await response.json();
        return res.json(data);

    } catch (error) {
        console.error('❌ LBank Proxy Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
