const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

async function baixarAudio(mediaId) {
  try {
    // pegar URL do áudio
    const urlResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
      }
    );

    const mediaUrl = urlResponse.data.url;

    // baixar arquivo
    const audioResponse = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      responseType: "stream",
    });

    const caminho = `uploads/audio_${Date.now()}.ogg`;
    const writer = fs.createWriteStream(caminho);

    audioResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(caminho));
      writer.on("error", reject);
    });

  } catch (err) {
    console.error("Erro ao baixar áudio:", err.response?.data || err);
    throw err;
  }
}

module.exports = { baixarAudio };
