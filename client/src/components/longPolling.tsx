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

const RETRY_DELAY = 5000;
const API_URL = 'http://localhost:5000';

export const LongPolling = () => {
  const [messages, setMessages] = useState<Messages>([]);
  const [messageValue, setMessageValue] = useState<string>('');
  const [isMounted, setIsMounted] = useState(true); // Для предотвращения обновления состояния после размонтирования компонента

  // При монтировании компонента подключаемся к серверу
  useEffect(() => {
    fetchMessages();

    // Очищаем интервал при размонтировании
    return () => {
      setIsMounted(false);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/get-messages`, { headers: HEADERS });

      if (isMounted) {
        setMessages((prevMessages) => [...prevMessages, data]);
        setTimeout(fetchMessages, 0); // Повторный вызов через 0 мс
      }
    } catch (e) {
      console.log('Failed to fetch messages', e);

      if (isMounted) {
        setTimeout(fetchMessages, RETRY_DELAY); // Повторный вызов через RETRY_DELAY мс
      }
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
