const axios = require("axios");
require("dotenv").config();

//
// 🧠 converter markdown da IA para WhatsApp
//
function formatarParaWhatsApp(texto) {
  if (!texto) return "";

  return texto
    // **negrito** -> *negrito*
    .replace(/\*\*(.*?)\*\*/g, "*$1*")

    // __negrito__ -> *negrito*
    .replace(/__(.*?)__/g, "*$1*")

    // remove crases de código
    .replace(/```/g, "")
    .replace(/`/g, "")

    // listas markdown → bullets WhatsApp
    .replace(/^- /gm, "• ")
    .replace(/^\* /gm, "• ")

    // remove ### títulos
    .replace(/^#+\s?/gm, "")

    // evita muitos \n
    .replace(/\n{3,}/g, "\n\n");
}

async function enviarMensagem(texto, numeroDestino) {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

  // 🔵 formata antes de enviar
  const textoFormatado = formatarParaWhatsApp(texto);

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: numeroDestino,
      type: "text",
      text: { body: textoFormatado }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

module.exports = { enviarMensagem };
