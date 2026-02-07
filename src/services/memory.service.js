const db = require("../database/db");

function getStudent(phone) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM students WHERE phone = ?", [phone], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

function createStudent(phone) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO students (phone) VALUES (?)",
      [phone],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

function updateStudentStats(phone, score) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE students 
       SET total_audios = total_audios + 1,
           last_score = ?
       WHERE phone = ?`,
      [score, phone],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

module.exports = { getStudent, createStudent, updateStudentStats };
