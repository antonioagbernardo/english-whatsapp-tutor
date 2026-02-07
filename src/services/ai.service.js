const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function corrigirIngles(contextoCompleto) {

  const promptSistema = `
Você é um professor de inglês pessoal para brasileiros no WhatsApp.

Seu objetivo:
Ajudar o aluno a melhorar o inglês conversando naturalmente.

REGRAS IMPORTANTES:

- Se o aluno falar em português → responda normal e ajude.
- Se o aluno conversar → converse naturalmente.
- Se o aluno mandar frase em inglês → corrija de forma leve.
- Se o aluno mandar áudio → trate como speaking.
- Não dê nota sempre.
- Não corrija tudo sempre.
- Soe humano e amigável.
- Seja curto (WhatsApp).
- Não pareça robô.
- Não diga que é IA.

Se o aluno errar inglês:
→ mostre forma natural
→ explique rápido
→ incentive

Você é tipo um professor particular no WhatsApp.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: promptSistema },
      { role: "user", content: contextoCompleto }
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

module.exports = { corrigirIngles };
