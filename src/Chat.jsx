import React, { useState, useEffect, useRef } from 'react';
import { db } from './Firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from "./AuthContext.jsx";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Chat() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!currentUser?.teamName) {
            console.log("No team name or user not logged in");
            return;
        }

        const q = query(
            collection(db, "teams", currentUser.teamName, "Chat"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            setMessages(chatMessages);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) {
            toast.warning("Message cannot be empty");
            return;
        }

        if (!currentUser?.email || !currentUser?.teamName) {
            toast.error("User or team is not set");
            return;
        }

        try {
            const messageData = {
                text: newMessage,
                sender: currentUser.email,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, "teams", currentUser.teamName, "Chat"), messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };

    return (
    <div className="chat-container">
            <h3>Team Chat</h3>
            <div className="messages-container">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === currentUser?.email ? 'sent' : 'received'}`}>
                        <span className="sender">{msg.sender.split('@')[0]}:</span>
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
                    disabled={!currentUser}
                />
                <button 
                    type="submit"
                    disabled={!currentUser || !newMessage.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;