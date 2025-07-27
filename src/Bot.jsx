// src/Bot.jsx
import React, { useState, useEffect } from 'react';
import { db } from './Firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { useAuth } from './AuthContext';


const Bot = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'ai-messages'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      text: input,
      sender: 'user',
      createdAt: serverTimestamp(),
      userId: currentUser.uid
    };

    const aiMsg = {
      text: generateAIResponse(input),
      sender: 'ai',
      createdAt: serverTimestamp(),
      userId: currentUser.uid
    };

    await addDoc(collection(db, 'ai-messages'), userMsg);
    await addDoc(collection(db, 'ai-messages'), aiMsg);

    setInput('');
  };

  const generateAIResponse = (userInput) => {
    if (userInput.toLowerCase().includes('deadline')) {
      return "Don't worry, you still have time!";
    }
    return "Got it! Let me think...";
  };

  return (
    <div className="ai-container">
      <div className="ai-chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.sender === 'user' ? 'user-message' : 'ai-message'}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="ai-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="ai-input"
        />
        <button onClick={sendMessage} className="ai-send-btn">Send</button>
      </div>
    </div>
  );
};

export default Bot;