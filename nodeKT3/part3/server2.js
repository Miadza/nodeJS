const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on("connection", (ws) => {
  ws.send(
    JSON.stringify({
      message:
        'Введите ваше имя и предпочитаемый цвет (например, "Олег #ff0000")',
      color: "#000000",
    })
  );

  ws.on("message", (data) => {
    const message = data.toString().trim();

    if (!clients.has(ws)) {
      const [name, color] = parseNameAndColor(message);
      if (!name || !color) {
        ws.send(
          JSON.stringify({
            message: 'Ошибка. Введите имя и цвет в формате "Имя #rrggbb".',
            color: "#ff0000",
          })
        );
        return;
      }

      clients.set(ws, { name, color });
      const users = Array.from(clients.values())
        .map((c) => c.name)
        .join(", ");

      ws.send(
        JSON.stringify({
          message: `Добро пожаловать, ${name}. В чате уже присутствуют: ${
            users || "Вы первый в чате."
          }`,
          color: "#0000ff",
        })
      );
      broadcast(`${name} присоединился к чату.`, ws);
    } else {
      const { name, color } = clients.get(ws);
      broadcast(`${name}: ${message}`, ws, color);
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

function parseNameAndColor(input) {
  const match = input.match(/^(.+?)\s+#([0-9a-fA-F]{6})$/);
  if (!match) return [null, null];
  return [match[1], `#${match[2]}`];
}

function broadcast(message, except, color = "#000000") {
  for (const [client] of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message, color }));
    }
  }
}

console.log("WebSocket сервер запущен на ws://localhost:8080");
