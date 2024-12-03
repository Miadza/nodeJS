const express = require("express");
const axios = require("axios");
const app = express();

app.set("view engine", "ejs");
const BASE_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.vedomosti.ru/rss/rubric/";

// Добавляем маршрут для корня
app.get("/", (req, res) => {
  res.send(`
        <h1>Добро пожаловать!</h1>
        <p>Используйте адреса вида <code>/ЧИСЛО/news/for/CATEGORY</code>, чтобы получить новости.</p>
        <p>Доступные категории: <strong>business, economic, finances, politics</strong>.</p>
        <p>Пример: <a href="/10/news/for/business">/10/news/for/business</a></p>
    `);
});

app.get("/:count/news/for/:category", async (req, res) => {
  const { count, category } = req.params;
  const url = `${BASE_URL}${category}`;

  try {
    const response = await axios.get(url);
    const newsItems = response.data.items.slice(0, Number(count));

    res.render("news", {
      count,
      category,
      news: newsItems,
    });
  } catch (error) {
    res.status(500).send("Ошибка при получении данных.");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
