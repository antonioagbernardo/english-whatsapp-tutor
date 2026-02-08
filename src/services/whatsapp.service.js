const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
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

    // remove blocos de código
    .replace(/```/g, "")
    .replace(/`/g, "")

    // listas markdown → bullets
    .replace(/^- /gm, "• ")
    .replace(/^\* /gm, "• ")

    // remove títulos ### 
    .replace(/^#+\s?/gm, "")

    // evita muitos espaços
    .replace(/\n{3,}/g, "\n\n")

    .trim();
}

//
// 📩 enviar TEXTO
//
async function enviarMensagem(texto, numeroDestino) {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

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

//
// 🎧 enviar AUDIO
//
async function enviarAudio(caminho, numeroDestino) {
  try {
    const uploadUrl = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/media`;

    const form = new FormData();
    form.append("file", fs.createReadStream(caminho));
    form.append("type", "audio/mpeg");
    form.append("messaging_product", "whatsapp");

    // upload mídia
    const upload = await axios.post(uploadUrl, form, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        ...form.getHeaders(),
      },
    });

    const mediaId = upload.data.id;

    // enviar áudio
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: numeroDestino,
        type: "audio",
        audio: { id: mediaId },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {
    console.error("Erro ao enviar áudio:", err.response?.data || err);
  }
}

module.exports = { enviarMensagem, enviarAudio };
