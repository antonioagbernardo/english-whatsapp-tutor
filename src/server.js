require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { salvarMensagem, pegarHistorico } = require("./services/history.service");
const { analisarImagem } = require("./services/image.service");
const fs = require("fs");
const { getStudent, createStudent, updateStudentStats } = require("./services/memory.service");
const { transcreverAudio } = require("./services/audio.service");
const { enviarMensagem } = require("./services/whatsapp.service");
const { baixarAudio } = require("./services/whatsapp.media");
const { corrigirIngles } = require("./services/ai.service");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
// 🔵 WEBHOOK VERIFY META
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

        // 🔎 memória aluno
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

          const historico = await pegarHistorico(from);

          let contexto = "Histórico recente da conversa:\n";
          historico.forEach(m => {
            contexto += `${m.role === "user" ? "Aluno" : "Professor"}: ${m.message}\n`;
          });

          const resposta = await corrigirIngles(contexto + "\nAluno: " + texto);

          await salvarMensagem(from, "bot", resposta);
          await enviarMensagem(resposta, from);
          await updateStudentStats(from, 7);
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
          let contexto = "Histórico recente da conversa:\n";

          historico.forEach(m => {
            contexto += `${m.role === "user" ? "Aluno" : "Professor"}: ${m.message}\n`;
          });

          const resposta = await corrigirIngles(contexto + "\nAluno: " + texto);

          await salvarMensagem(from, "bot", resposta);
          await enviarMensagem(resposta, from);
          await updateStudentStats(from, 7);

          // 🧹 APAGAR ÁUDIO
          fs.unlink(caminhoAudio, (err) => {
            if (err) console.log("Erro ao apagar áudio:", err);
          });
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

          await enviarMensagem("📸 Analisando imagem...\n\n" + resposta, from);

          // 🧹 APAGAR IMAGEM
          fs.unlink(caminhoImagem, (err) => {
            if (err) console.log("Erro ao apagar imagem:", err);
          });
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
