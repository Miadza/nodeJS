const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./url_shortener.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err);
  } else {
    console.log("Подключено к базе данных SQLite.");
    db.run(`CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_url TEXT NOT NULL,
            short_url TEXT NOT NULL UNIQUE
        )`);
  }
});

function generateShortURL() {
  return crypto.randomBytes(4).toString("hex"); // 8 символов
}

// http://localhost:3000/create?url=https://example.com - создание сокращенного URL

app.get("/create", (req, res) => {
  const originalURL = req.query.url;

  if (!originalURL) {
    return res.status(400).send("Ошибка: необходимо указать URL.");
  }

  db.get(
    `SELECT short_url FROM urls WHERE original_url = ?`,
    [originalURL],
    (err, row) => {
      if (err) {
        return res.status(500).send("Ошибка базы данных.");
      }

      if (row) {
        return res.send(
          `Сокращённый URL: http://localhost:${PORT}/${row.short_url}`
        );
      }

      const shortURL = generateShortURL();

      db.run(
        `INSERT INTO urls (original_url, short_url) VALUES (?, ?)`,
        [originalURL, shortURL],
        (err) => {
          if (err) {
            return res.status(500).send("Ошибка сохранения URL.");
          }

          res.send(`Сокращённый URL: http://localhost:${PORT}/${shortURL}`);
        }
      );
    }
  );
});

app.get("/:shortUrl", (req, res) => {
  const shortURL = req.params.shortUrl;

  db.get(
    `SELECT original_url FROM urls WHERE short_url = ?`,
    [shortURL],
    (err, row) => {
      if (err) {
        return res.status(500).send("Ошибка базы данных.");
      }

      if (row) {
        res.redirect(row.original_url);
      } else {
        res.status(404).send("URL не найден.");
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
