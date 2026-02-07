const OpenAI = require("openai");
require("dotenv").config();
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analisarImagem(caminhoImagem) {
  const base64 = fs.readFileSync(caminhoImagem, { encoding: "base64" });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Você é um professor de inglês que analisa imagens enviadas por alunos e ajuda com exercícios, redações ou dúvidas."
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analise a imagem enviada pelo aluno e ajude em inglês." },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}

module.exports = { analisarImagem };
