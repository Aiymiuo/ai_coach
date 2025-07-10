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


function App() {
    const { currentUser, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>AI Team Management App</h2>

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
            </Routes>
        </div>
    );
}

function Home() {
    return (
        <div>
            <h3>Welcome to your AI Startup Coach! 🚀</h3>
            <p>Sign up or log in to start using planning, motivation, and risk management tools.</p>
        </div>
    );
}

export default App;


