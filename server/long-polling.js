//1. Импортируем express и cors
const express = require('express');
const cors = require('cors');
//6. Импортируем библиотеку для работы с событиями
const events = require('events');

//2. Создаем переменную которая будет содержать значение порта
const PORT = 5000;

//7. Создаем экземпляр события
const emitter = new events.EventEmitter();

const app = express();

//4. Добавляем cors middleware
app.use(cors());
//подключаем парсер json
app.use(express.json());

//5. endpoints
// Получение сообщений через long-polling
app.get('/get-messages', (req, res) => {
    const messageListener = (message) => {
        res.json(message); // Возвращаем сообщение
        res.end();
    };

    // Подписываемся на событие
    emitter.once('new-messages', messageListener);

    // Если соединение завершено до того, как отправлено сообщение
    req.on('close', () => {
        emitter.removeListener('new-messages', messageListener); // Удаляем слушатель
    });
});

// Отправка нового сообщения
app.post('/new-messages', (req, res) => {
    const { message, id } = req.body; // Достаем сообщение и id из тела запроса
    const newMessage = { message, id }; // Формируем объект нового сообщения
    emitter.emit('new-messages', newMessage); // Эмитим событие с новым сообщением
    res.sendStatus(200) //Возвращаем статус 200
    res.end()
})

//3. Создаем экземпляр приложения и скажем ему прослушивать порт 5000
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));