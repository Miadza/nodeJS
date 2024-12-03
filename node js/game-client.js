const zmq = require('zeromq');
const { randomInt } = require('crypto');

// Получаем диапазон из аргументов командной строки
const min = parseInt(process.argv[2], 10);
const max = parseInt(process.argv[3], 10);

if (isNaN(min) || isNaN(max) || min >= max) {
  console.error("Укажите корректный диапазон: node game-client.js <min> <max>");
  process.exit(1);
}

// Загадываем число
const targetNumber = randomInt(min, max + 1);
console.log(`Загадано число в диапазоне ${min}-${max}.`);

(async () => {
  const sock = new zmq.Reply();

  // Привязываем сокет к адресу
  await sock.bind("tcp://127.0.0.1:5555");

  console.log("Game-Client запущен и ждет предположений от сервера...");

  while (true) {
    // Ожидаем сообщение от сервера
    const [message] = await sock.receive();
    const request = JSON.parse(message.toString());

    if (request.answer !== undefined) {
      const guess = parseInt(request.answer, 10);
      console.log(`Получено предположение от сервера: ${guess}`);

      // Сравниваем предположение с загаданным числом
      if (guess < targetNumber) {
        await sock.send(JSON.stringify({ hint: "more" }));
        console.log("Ответ отправлен: больше");
      } else if (guess > targetNumber) {
        await sock.send(JSON.stringify({ hint: "less" }));
        console.log("Ответ отправлен: меньше");
      } else {
        console.log("Сервер угадал число! Игра окончена.");
        await sock.send(JSON.stringify({ hint: "correct" }));
        break;
      }
    }
  }
})();
