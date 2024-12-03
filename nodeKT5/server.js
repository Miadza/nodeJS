const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database("./notes.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err);
  } else {
    console.log("Подключено к базе данных SQLite.");
    db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            created TEXT NOT NULL,
            changed TEXT NOT NULL
        )`);
  }
});

app.get("/notes", (req, res) => {
  db.all("SELECT * FROM notes", (err, rows) => {
    if (err) {
      res.status(500).send("Ошибка базы данных.");
    } else if (rows.length === 0) {
      res.status(404).send("Заметки не найдены.");
    } else {
      res.status(200).json(rows);
    }
  });
});

app.get("/note/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM notes WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).send("Ошибка базы данных.");
    } else if (!row) {
      res.status(404).send("Заметка не найдена.");
    } else {
      res.status(200).json(row);
    }
  });
});

app.get("/note/read/:title", (req, res) => {
  const { title } = req.params;
  db.get("SELECT * FROM notes WHERE title = ?", [title], (err, row) => {
    if (err) {
      res.status(500).send("Ошибка базы данных.");
    } else if (!row) {
      res.status(404).send("Заметка не найдена.");
    } else {
      res.status(200).json(row);
    }
  });
});

app.post("/note", (req, res) => {
  const { title, content } = req.body;
  const created = new Date().toISOString();
  const changed = created;

  if (!title || !content) {
    return res.status(400).send("Поля title и content обязательны.");
  }

  db.run(
    "INSERT INTO notes (title, content, created, changed) VALUES (?, ?, ?, ?)",
    [title, content, created, changed],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res
            .status(409)
            .send("Заметка с таким названием уже существует.");
        }
        return res.status(500).send("Ошибка базы данных.");
      }

      res
        .status(201)
        .json({ id: this.lastID, title, content, created, changed });
    }
  );
});

app.delete("/note/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM notes WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).send("Ошибка базы данных.");
    }

    if (this.changes === 0) {
      return res.status(404).send("Заметка не найдена.");
    }

    res.status(204).send();
  });
});

app.put("/note/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const changed = new Date().toISOString();

  if (!title || !content) {
    return res.status(400).send("Поля title и content обязательны.");
  }

  db.run(
    "UPDATE notes SET title = ?, content = ?, changed = ? WHERE id = ?",
    [title, content, changed, id],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res
            .status(409)
            .send("Заметка с таким названием уже существует.");
        }
        return res.status(500).send("Ошибка базы данных.");
      }

      if (this.changes === 0) {
        return res.status(404).send("Заметка не найдена.");
      }

      res.status(204).send();
    }
  );
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
