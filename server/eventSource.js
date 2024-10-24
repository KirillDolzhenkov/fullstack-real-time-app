const express = require('express');
const cors = require('cors');
const events = require('events');

const PORT = 5000;
const emitter = new events.EventEmitter();

const app = express();
app.use(cors());
app.use(express.json());

let clients = []; // Список подключенных клиентов

app.get('/connect', (req, res) => {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
    });

    // Добавляем нового клиента в список
    clients.push(res);

    // Очищаем клиента при закрытии соединения
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

app.post('/new-messages', (req, res) => {
    const { message, id } = req.body;
    const newMessage = { message, id };

    // Эмитим событие с новым сообщением
    emitter.emit('new-messages', newMessage);
    res.sendStatus(200);

    // Отправляем сообщение каждому подключенному клиенту
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(newMessage)} \n\n`);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
