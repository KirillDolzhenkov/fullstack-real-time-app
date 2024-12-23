import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';

interface iMessage {
  id: number;
  message: string;
}

type Messages = iMessage[];

const RETRY_DELAY = 5000;
const API_URL = 'http://localhost:5000';

export const EventSourcing = () => {
  const [messages, setMessages] = useState<Messages>([]);
  const [messageValue, setMessageValue] = useState<string>('');

  // При монтировании компонента подключаемся к серверу
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/connect`);
    const connect = () => {
      eventSource.onmessage = (event) => {
        const newMessage: iMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };

      eventSource.onerror = () => {
        console.error('EventSource connection error, retrying...');
        eventSource.close();

        // Пытаемся переподключиться с задержкой
        setTimeout(() => connect(), RETRY_DELAY);
      };
    };
    connect();

    // При размонтировании компонента закрываем подключение к серверу
    return () => {
      eventSource.close();
    };
  }, []);

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
