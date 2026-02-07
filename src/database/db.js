const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./students.db", (err) => {
  if (err) {
    console.error("Erro ao abrir banco", err);
  } else {
    console.log("Banco conectado 🚀");
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE,
  name TEXT,
  nickname TEXT,
  level TEXT DEFAULT 'A2',
  total_audios INTEGER DEFAULT 0,
  last_score INTEGER DEFAULT 0,
  common_errors TEXT DEFAULT '',
  last_seen DATETIME
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  role TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

module.exports = db;
