const db = require("../database/db");

function salvarMensagem(phone, role, message) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO history (phone, role, message) VALUES (?, ?, ?)",
      [phone, role, message],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

function pegarHistorico(phone) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT role, message FROM history WHERE phone = ? ORDER BY id DESC LIMIT 10",
      [phone],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows.reverse());
      }
    );
  });
}

module.exports = { salvarMensagem, pegarHistorico };
