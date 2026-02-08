const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function gerarAudio(texto) {
  const caminho = `./uploads/resposta_${Date.now()}.mp3`;

  // 🧹 remover markdown que fica feio em voz
  const textoLimpo = texto
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/`/g, "")
    .replace(/•/g, "-")
    .replace(/\n{2,}/g, "\n");

  // 🎭 instrução de atuação da voz
  const textoVoz = `
Fale como uma professora de inglês simpática, jovem e paciente.
Tom humano, natural e encorajador.
Estilo WhatsApp, informal e amigável.
Nunca soe robótica.

Mensagem:
${textoLimpo}
`;

  const mp3 = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "nova", 
    input: textoVoz,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(caminho, buffer);

  return caminho;
}

module.exports = { gerarAudio };
