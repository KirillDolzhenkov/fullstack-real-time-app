import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";

interface iMessage {
    id: number;
    message: string;
}

type Messages = iMessage[];

const RETRY_DELAY = 5000;
const API_URL = 'http://localhost:5000';

export const EventSource = () => {
    const [messages, setMessages] = useState<Messages>([]);
    const [messageValue, setMessageValue] = useState<string>("");
    const [isMounted, setIsMounted] = useState(true); //Для предотвращения обновления состояния после размонтирования компонента

    useEffect(() => {
        fetchMessages()

        return ()=> {
            setIsMounted(false)
        }
    }, []);

    const fetchMessages  = async () => {
        const eventSource = new window.EventSource(`${API_URL}/connect`);

        eventSource.onopen = () => {
            console.log('Connection to server opened');
        };

        eventSource.onmessage = (event: MessageEvent) => {
            if (!isMounted) return; // Проверка флага перед обновлением состояния
            const newMessage = JSON.parse(event.data);
            console.log('New message received:', newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        eventSource.onerror = (e: Event) => {
            console.log('Failed to fetch messages', e);
            eventSource.close(); // Закрываем соединение при ошибке

            setTimeout(fetchMessages, RETRY_DELAY); // Повторная попытка через RETRY_DELAY мс
        };
    }

    const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessageValue(e.target.value);
    };

    const onEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSentMessage();
        }
    };

    const onSentMessage = async () => {
        if (!messageValue) return;

        const newMessage = {
            message: messageValue,
            id: Date.now(),
        };

        try {
            await axios.post(`${API_URL}/new-messages`, newMessage);
            setMessageValue(""); // Очищаем input после отправки
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="center">
            <div>
                <div className="form">
                    <input
                        type="text"
                        value={messageValue}
                        onChange={onMessageChange}
                        onKeyDown={onEnterPressed}
                    />
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
