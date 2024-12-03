const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on("connection", (ws) => {
  ws.send("Введите ваше имя:");

  ws.on("message", (data) => {
    // Преобразуем данные в строку, если это Buffer или ArrayBuffer
    const message = data.toString();

    if (!clients.has(ws)) {
      const name = message.trim();
      if (!name) {
        ws.send("Имя не может быть пустым. Пожалуйста, введите имя:");
        return;
      }

      clients.set(ws, { name });
      const users = Array.from(clients.values())
        .map((c) => c.name)
        .join(", ");
      ws.send(
        `Добро пожаловать. В чате уже присутствуют: ${
          users || "Вы первый в чате."
        }`
      );
      broadcast(`${name} присоединился к чату.`, ws);
    } else {
      const { name } = clients.get(ws);
      broadcast(`${name}: ${message}`, ws);
    }
  });

  ws.on("close", () => {
    if (clients.has(ws)) {
      const { name } = clients.get(ws);
      clients.delete(ws);
      broadcast(`${name} покинул чат.`);
    }
  });
});

function broadcast(message, except) {
  for (const [client] of clients) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

console.log("WebSocket сервер запущен на ws://localhost:8080");
