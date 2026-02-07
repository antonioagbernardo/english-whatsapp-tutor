const db = require("../database/db");

//
// 🔎 buscar aluno
//
function getStudent(phone) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM students WHERE phone = ?", [phone], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

//
// 👤 criar aluno novo
//
function createStudent(phone) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO students 
      (phone, level, total_audios, last_score, last_seen)
      VALUES (?, 'iniciante', 0, 0, datetime('now'))`,
      [phone],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

//
// 🧠 salvar nome do aluno
//
function salvarNome(phone, nome) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE students SET name = ? WHERE phone = ?`,
      [nome, phone],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

//
// 🧠 salvar apelido
//
function salvarApelido(phone, nick) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE students SET nickname = ? WHERE phone = ?`,
      [nick, phone],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

//
// 📊 atualizar stats
//
function updateStudentStats(phone, score) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE students 
       SET total_audios = total_audios + 1,
           last_score = ?,
           last_seen = datetime('now')
       WHERE phone = ?`,
      [score, phone],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

module.exports = {
  getStudent,
  createStudent,
  updateStudentStats,
  salvarNome,
  salvarApelido
};
