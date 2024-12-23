import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

type EventType = 'connection' | 'message';

interface iMessage {
  event: EventType;
  username: string;
  id: number;
  message: string;
}

type Messages = iMessage[];

const RETRY_DELAY = 5000;
const WS_API_URL = 'ws://localhost:5000';

export const WebSockets = () => {
  const [messages, setMessages] = useState<Messages>([]);
  const [messageValue, setMessageValue] = useState<string>('');
  const socket = useRef<WebSocket>();
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // При размонтировании компонента отключаемся от сервера
    return () => {
      socket.current?.close();
    };
  }, []);

  const connect = async () => {
    socket.current = new WebSocket(`${WS_API_URL}`);

    socket.current.onopen = () => {
      onConnectUser();
    };

    socket.current.onclose = () => {
      console.log('Connection to server closed');
      setConnected(false);
    };
    socket.current.onmessage = (event: MessageEvent) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
    socket.current.onerror = () => {
      console.log('Connection failed');
      setTimeout(connect, RETRY_DELAY);
    };
  };

  const onValueChange = (e: ChangeEvent<HTMLInputElement>, fn: (value: string) => void) => {
    fn(e.target.value);
  };

  const onEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>, fn: () => void) => {
    if (e.key === 'Enter') {
      fn();
    }
  };

  const onConnectUser = () => {
    console.log('Connection to server opened');
    setConnected(true);
    const message = {
      event: 'connection',
      username,
      id: Date.now()
    } as iMessage;
    socket.current?.send(JSON.stringify(message));
  };

  const onSentMessage = async () => {
    const message = {
      username,
      message: messageValue,
      id: Date.now(),
      event: 'message'
    } as iMessage;
    socket.current?.send(JSON.stringify(message));
    setMessageValue('');
  };

  if (!connected) {
    return (
      <div className="center">
        <div className="form">
          <input
            value={username}
            onChange={(e) => onValueChange(e, setUsername)}
            onKeyDown={(e) => onEnterPressed(e, connect)}
            type="text"
            placeholder="Enter your name"
          />
          <button onClick={connect}>Connect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="center">
      <div>
        <div className="form">
          <input
            type="text"
            value={messageValue}
            onChange={(e) => onValueChange(e, setMessageValue)}
            onKeyDown={(e) => onEnterPressed(e, onSentMessage)}
          />
          <button onClick={onSentMessage}>Send</button>
        </div>
        <div className="messages">
          {messages.map((mess) => (
            <div key={mess.id}>
              {mess.event === 'connection' ? (
                <div className="connection_message">User {mess.username} joined</div>
              ) : (
                <div className="message">
                  {mess.username}. {mess.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
