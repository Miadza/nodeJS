const zmq = require('zeromq');
const readline = require('readline');

// Настраиваем ввод от пользователя
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const sock = new zmq.Request();

  // Подключаемся к клиенту
  sock.connect("tcp://127.0.0.1:5555");

  console.log("Game-Server запущен. Введите числа для угадывания.");

  let guessed = false;

  const makeGuess = async () => {
    if (guessed) return; // Если игра окончена, выход из функции

    rl.question("Ваше предположение: ", async (guess) => {
      if (isNaN(guess)) {
        console.log("Введите корректное число!");
        return makeGuess(); // Повторный запрос ввода
      }

      // Отправляем число клиенту
      await sock.send(JSON.stringify({ answer: parseInt(guess, 10) }));

      // Ждем ответ от клиента
      const [message] = await sock.receive();
      const response = JSON.parse(message.toString());

      if (response.hint === "more") {
        console.log("Загаданное число больше.");
      } else if (response.hint === "less") {
        console.log("Загаданное число меньше.");
      } else if (response.hint === "correct") {
        console.log("Вы угадали число! Игра окончена.");
        guessed = true;
        rl.close();
        return;
      } else {
        console.error("Неизвестный ответ от клиента.");
      }

      makeGuess(); // Повторяем цикл
    });
  };

  makeGuess(); // Запускаем ввод
})();
