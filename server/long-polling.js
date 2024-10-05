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

//5. endpoints
app.get('get-messages',(req,res)=>{
    emitter.once('new-messages',message => { //Подписываемся на событие
        res.json({message}) //Возвращаем сообщение
    })
})

app.post('new-messages',(req,res)=>{
    const {message} = req.body; //Достаем сообщение из тела запроса
    emitter.emit('new-messages',message) //Вызываем событие и передаем ему сообщение
    res.status(200) //Возвращаем статус 200
})

//3. Создаем экземпляр приложения и скажем ему прослушивать порт 5000
app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));