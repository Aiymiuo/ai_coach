import React, { useState, useEffect, useRef } from 'react';
import { db } from './Firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "./AuthContext.jsx";
import './App.css';

function Chat() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Load messages from Firebase
    useEffect(() => {
        const q = query(
            collection(db, 'teamChats'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            setMessages(chatMessages);
            scrollToBottom();
            
            // Show notifications for new messages
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' && 
                    change.doc.data().sender !== currentUser.email) {
                    toast.info(`New message from ${change.doc.data().sender}`);
                }
            });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await addDoc(collection(db, 'teamChats'), {
                text: newMessage,
                sender: currentUser.email,
                team: currentUser.teamName,
                timestamp: serverTimestamp(),
                isAI: false
            });
            setNewMessage('');
        } catch (error) {
            toast.error("Failed to send message");
            console.error("Send error:", error);
        }
    };

    return (
        <div className="chat-container">
            <ToastContainer position="bottom-right" autoClose={3000} />
            
            <h3>Team Chat</h3>
            
            <div className="messages-container">
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        className={`message ${msg.sender === currentUser.email ? 'sent' : 'received'}`}
                    >
                        <span className="sender">{msg.sender}:</span>
                        <p>{msg.text}</p>
                        <small>
                            {msg.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </small>
                    </div>
                ))}
                <div ref={messagesEndRef} />
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
        </div>
    );
}

export default Chat;
