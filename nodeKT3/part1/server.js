// const WebSocket = require("ws");

// const wss = new WebSocket.Server({ port: 8080 });
// const clients = new Set();

// wss.on("connection", (ws) => {
//   clients.add(ws);

//   ws.on("message", (message) => {
//     for (const client of clients) {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     }
//   });

//   ws.on("close", () => {
//     clients.delete(ws);
//   });
// });

// console.log("WebSocket сервер запущен на ws://localhost:8080");
