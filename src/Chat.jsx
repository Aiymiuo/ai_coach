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

    // Debug: Log current user
    useEffect(() => {
        console.log("Current user:", currentUser);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) {
            console.log("No current user, skipping chat init");
            return;
        }

        console.log("Initializing chat listener...");
        const q = query(
            collection(db, 'teamChats'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                console.log(`Received ${snapshot.docs.length} messages`);
                const chatMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                }));
                setMessages(chatMessages);
                scrollToBottom();
            },
            (error) => {
                console.error("Snapshot error:", error);
                toast.error("Failed to load messages");
            }
        );

        return () => {
            console.log("Cleaning up chat listener");
            unsubscribe();
        };
    }, [currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        console.log("Attempting to send message:", newMessage);
        
        if (!newMessage.trim()) {
            toast.warning("Message cannot be empty");
            return;
        }

        if (!currentUser?.email) {
            toast.error("You must be logged in");
            return;
        }

        try {
            console.log("Creating message document...");
            const messageData = {
                text: newMessage,
                sender: currentUser.email,
                team: currentUser.teamName || 'general',
                timestamp: serverTimestamp()
            };
            
            console.log("Message data:", messageData);
            
            const docRef = await addDoc(collection(db, 'teamChats'), messageData);
            console.log("Message sent with ID:", docRef.id);
            
            const sendMessage = async (e) => {
  e.preventDefault();
  
  console.log("Firestore instance:", db); // Should show Firestore object
  console.log("Current user:", auth.currentUser); // Should show user object
  
  try {
    const testRef = await addDoc(collection(db, 'test_collection'), {
      test: "Connection test",
      timestamp: serverTimestamp()
    });
    console.log("Test write successful!", testRef.id);
  } catch (error) {
    console.error("Test write failed:", error);
  }
};

            setNewMessage('');
        } catch (error) {
            console.error("Full send error:", {
                code: error.code,
                message: error.message,
                stack: error.stack,
                user: currentUser,
                time: new Date().toISOString()
            });
            toast.error(`Send failed: ${error.message}`);
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