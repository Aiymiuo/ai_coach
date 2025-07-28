// src/Signup.jsx

import React, { useState } from 'react';
import { auth, db } from './Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!teamName.trim()) {
            setError("Please enter your team name.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                teamName: teamName.trim(),
                score: 0,
                createdAt: new Date()
            });

            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                placeholder="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
            /><br/>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /><br/>
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br/>
            <button onClick={handleSignup}>Signup</button>
        </div>
    );
}

export default Signup;