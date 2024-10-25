// Импортируем express и cors
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Хранилище для сообщений
let messages = [];

// Endpoint для получения всех сообщений
app.get('/get-messages', (req, res) => {
    res.json(messages);
});

// Endpoint для добавления нового сообщения
app.post('/new-messages', (req, res) => {
    const { message, id } = req.body;
    const newMessage = { message, id };
    messages.push(newMessage);
    res.sendStatus(200);
});

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
