const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function gerarAudio(texto) {
  const caminho = `./uploads/resposta_${Date.now()}.mp3`;

  const mp3 = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy", // depois podemos clonar voz da sua irmã 😏
    input: texto,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(caminho, buffer);

  return caminho;
}

module.exports = { gerarAudio };
