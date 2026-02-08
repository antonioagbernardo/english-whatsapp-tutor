require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require("fs");

const { salvarMensagem, pegarHistorico } = require("./services/history.service");
const { analisarImagem } = require("./services/image.service");
const { getStudent, createStudent, updateStudentStats, salvarNome } = require("./services/memory.service");
const { transcreverAudio } = require("./services/audio.service");
const { enviarMensagem, enviarAudio } = require("./services/whatsapp.service");
const { gerarAudio } = require("./services/voice.service");
const { baixarAudio } = require("./services/whatsapp.media");
const { corrigirIngles } = require("./services/ai.service");

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('English AI Tutor rodando 🚀');
});

const PORT = process.env.PORT || 3000;

//
// 🔵 TESTE IA
//
app.get("/teste", async (req, res) => {
  try {
    const resposta = await corrigirIngles("I did a travel last year");
    res.send(resposta);
  } catch (err) {
    res.send("Erro IA");
  }
});

//
// 🔵 VERIFY WEBHOOK META
//
app.get("/webhook", (req, res) => {
  const verify_token = "meubot123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verify_token) {
    console.log("Webhook verificado!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

//
// 🔵 RECEBER MENSAGENS WHATSAPP
//
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.entry) {
      const msg = body.entry[0].changes[0].value.messages?.[0];

      if (msg) {
        const from = msg.from;
        console.log("Mensagem de:", from);

        // 🔎 buscar ou criar aluno
        let student = await getStudent(from);
        if (!student) {
          await createStudent(from);
          student = await getStudent(from);
          console.log("Novo aluno criado");
        }

        //
        // 🟢 TEXTO
        //
        if (msg.text) {
          const texto = msg.text.body;
          console.log("Texto:", texto);

          await salvarMensagem(from, "user", texto);

          // detectar nome
          if (/meu nome é|my name is|i am/i.test(texto.toLowerCase())) {
            const nome = texto.split(" ").pop();
            await salvarNome(from, nome);
            await enviarMensagem(`Prazer em te conhecer, ${nome} 😄`, from);
          }

          const historico = await pegarHistorico(from);

          let contexto = `
Você é Miss Jane, professora particular de inglês da Maria Eugênia.

Fale de forma humana, natural e curta (estilo WhatsApp).
Seja simpática e próxima.
Nunca pareça robô.

Se aluno falar português → responda normal.
Se falar inglês → ajude naturalmente.
Não corrija sempre.
Converse.

Nome do aluno: ${student?.name || "não informado"}

Histórico recente:
`;

          historico.slice(-10).forEach(m => {
            contexto += `${m.role === "user" ? "Aluno" : "Jane"}: ${m.message}\n`;
          });

          contexto += `\nAluno: ${texto}`;

          const resposta = await corrigirIngles(contexto);

          await salvarMensagem(from, "bot", resposta);
          await enviarMensagem(resposta, from);
        }

        //
        // 🎧 ÁUDIO
        //
        if (msg.audio) {
          console.log("Áudio recebido");

          const mediaId = msg.audio.id;
          const caminhoAudio = await baixarAudio(mediaId);

          console.log("Áudio salvo:", caminhoAudio);

          const texto = await transcreverAudio({
            path: caminhoAudio,
            originalname: "audio.ogg",
          });

          console.log("Transcrição:", texto);

          await salvarMensagem(from, "user", texto);

          const historico = await pegarHistorico(from);

          let contexto = `
Você é Miss Jane, professora de inglês pessoal no WhatsApp.
Responda de forma natural, curta e humana.

Nome do aluno: ${student?.name || "não informado"}

Histórico:
`;

          historico.slice(-10).forEach(m => {
            contexto += `${m.role === "user" ? "Aluno" : "Jane"}: ${m.message}\n`;
          });

          contexto += `\nAluno (áudio): ${texto}`;

          const resposta = await corrigirIngles(contexto);

          await salvarMensagem(from, "bot", resposta);

          // 🎙️ gerar voz da resposta
          const caminhoVoz = await gerarAudio(resposta);

          // enviar áudio
          await enviarAudio(caminhoVoz, from);

          await updateStudentStats(from, 7);

          // limpar arquivos
          fs.unlink(caminhoAudio, () => {});
          fs.unlink(caminhoVoz, () => {});
        }

        //
        // 🖼️ IMAGEM
        //
        if (msg.image) {
          console.log("Imagem recebida");

          const mediaId = msg.image.id;
          const caminhoImagem = await baixarAudio(mediaId);

          console.log("Imagem salva:", caminhoImagem);

          const resposta = await analisarImagem(caminhoImagem);

          await enviarMensagem(resposta, from);

          fs.unlink(caminhoImagem, () => {});
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("ERRO WEBHOOK:", err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
