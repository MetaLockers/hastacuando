const axios = require('axios');

// Procesar el cuerpo de la solicitud
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
                reject(error);
            }
        });
    });
}

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

module.exports = async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Procesar el cuerpo de la solicitud
        const body = await parseBody(req);
        const { message } = body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const telegramURL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        const response = await axios.post(telegramURL, {
            chat_id: CHAT_ID,
            text: message,
        });

        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error.message);
        res.status(500).json({
            error: 'Error al enviar mensaje a Telegram',
            details: error.message,
        });
    }
};

console.log("TELEGRAM_TOKEN:", process.env.TELEGRAM_TOKEN);
console.log("CHAT_ID:", process.env.CHAT_ID);
