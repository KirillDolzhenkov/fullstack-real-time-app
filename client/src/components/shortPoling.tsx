import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';

interface iMessages {
  id: number;
  message: string;
}

type Messages = iMessages[];

const HEADERS = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Expires: '0'
};

const POLLING_INTERVAL = 5000; // Интервал в 5 секунд для short-polling
const API_URL = 'http://localhost:5000';

export const ShortPolling = () => {
  const [messages, setMessages] = useState<Messages>([]);
  const [messageValue, setMessageValue] = useState<string>('');

  useEffect(() => {
    // Устанавливаем интервал для регулярного запроса сообщений
    const interval = setInterval(fetchMessages, POLLING_INTERVAL);

    // Очищаем интервал при размонтировании
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/get-messages`, { headers: HEADERS });
      setMessages(data); // Обновляем сообщения, полученные с сервера
    } catch (e) {
      console.log('Failed to fetch messages', e);

      setTimeout(fetchMessages, POLLING_INTERVAL);
    }
  };

  const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageValue(e.target.value);
  };

  const onEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSentMessage();
    }
  };

  const onSentMessage = async () => {
    if (!messageValue) return;

    const newMessage = {
      message: messageValue,
      id: Date.now()
    };

    try {
      await axios.post(`${API_URL}/new-messages`, newMessage);
      setMessageValue(''); // Очищаем input после отправки
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="center">
      <div>
        <div className="form">
          <input type="text" value={messageValue} onChange={onMessageChange} onKeyDown={onEnterPressed} />
          <button onClick={onSentMessage}>Send</button>
        </div>
        <div className="messages">
          {messages.map((msg) => (
            <div className="message" key={msg.id}>
              {msg.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
