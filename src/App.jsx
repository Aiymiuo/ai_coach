// src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard';
import Planning from './Planning';
import Motivation from './Motivation';
import Risk from './Risk';
import Login from './Login';
import Signup from './Signup';
import './App.css';
import Chat from './Chat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Bot from './Bot';


function App() {
    const { currentUser, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>AI Team Management App</h2>
            <ToastContainer/>

            <nav style={{ marginBottom: '16px' }}>
                <button><Link to="/">Home</Link></button>
                {!currentUser && (
                    <>
                        <button><Link to="/login">Login</Link></button>
                        <button><Link to="/signup">Signup</Link></button>
                    </>
                )}
                {currentUser && (
                    <>
                        <button><Link to="/dashboard">Dashboard</Link></button>
                        <button><Link to="/planning">Planning</Link></button>
                        <button><Link to="/motivation">Motivation</Link></button>
                        <button><Link to="/risk">Risk</Link></button>
                        <button><Link to="/chat">Team Chat</Link></button>
                        <button><Link to="/bot">AI Chat Bot</Link></button>
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
                <Route path="/motivation" element={<ProtectedRoute><Motivation /></ProtectedRoute>} />
                <Route path="/risk" element={<ProtectedRoute><Risk /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/bot" element={<ProtectedRoute><Bot /></ProtectedRoute>} />
            </Routes>
        </div>
    );
}

function Home() {
    return (
        <div>
            <h3>Welcome to your AI Startup Coach! 🚀</h3>
            <h3>Sign up or log in to start using planning, motivation, and risk management tools.</h3>
        </div>
    );
}

export default App;