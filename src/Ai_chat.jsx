import React, { useState, useEffect } from 'react';
import { db } from './Firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import './App.css'; // Your existing CSS file
import { useAuth } from "./AuthContext.jsx";
import styles from './Ai_chat.module.css';

function Ai_chat({ currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Load chat history
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'teamChats'), (snapshot) => {
            const chatMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(chatMessages);
        });
        return () => unsubscribe();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await addDoc(collection(db, 'teamChats'), {
            text: newMessage,
            sender: currentUser.email,
            team: currentUser.teamName,
            timestamp: serverTimestamp()
        });
        setNewMessage('');
    };

    return (
        <div className="chat-container">
            <h3>Team Chat</h3>
            <div className="messages-container">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === currentUser.email ? 'sent' : 'received'}`}>
                        <span className="sender">{msg.sender}:</span>
                        <p>{msg.text}</p>
                        <small>{new Date(msg.timestamp?.toDate()).toLocaleTimeString()}</small>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="chat-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
           <div className={styles.chatContainer}></div>
        <div className={styles.messagesContainer}></div>
        <div className={`${styles.message} ${msg.sender === currentUser.email ? styles.sent : styles.received}`}></div>
        </div>
    );
}

export default Ai_chat;