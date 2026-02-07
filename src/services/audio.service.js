const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcreverAudio(file) {
  try {
    // pega extensão original
    const ext = path.extname(file.originalname);
    const novoCaminho = file.path + ext;

    // renomeia arquivo temporário com extensão
    fs.renameSync(file.path, novoCaminho);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(novoCaminho),
      model: "gpt-4o-transcribe",
    });

    return transcription.text;

  } catch (err) {
    console.error("ERRO TRANSCRIÇÃO:", err);
    throw err;
  }
}

module.exports = { transcreverAudio };
