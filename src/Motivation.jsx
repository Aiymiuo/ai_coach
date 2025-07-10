// src/Motivation.jsx
import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext.jsx";
import './App.css';

function Motivation() {
    const { currentUser } = useAuth();
    const [message, setMessage] = useState("Loading your motivation...");

    useEffect(() => {
        if (!currentUser) {
            setMessage("Please log in to receive personalized motivation.");
            return;
        }

        const fetchData = async () => {
            const tasksSnapshot = await getDocs(collection(db, "users", currentUser.uid, "planningTasks"));
            let completed = 0;
            let inProgress = 0;
            let notStarted = 0;

            tasksSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === "Completed") completed++;
                else if (data.status === "In Progress") inProgress++;
                else if (data.status === "Not Started") notStarted++;
            });

            // Dynamic motivation logic
            if (completed >= 5) {
                setMessage("🔥 Amazing consistency! You're completing many tasks. Keep up the momentum!");
            } else if (completed >= 1) {
                setMessage("🌱 Great job on completing some tasks. Try to complete one more today!");
            } else if (inProgress > 0) {
                setMessage("👀 You have tasks in progress. Let's complete one today!");
            } else {
                setMessage("🚀 Ready to start? Add a task and get moving towards your goals!");
            }
        };

        fetchData();
    }, [currentUser]);

    return (
        <div style={{
            padding: "20px",
            maxWidth: "400px",
            margin: "20px auto",
            background: "#C2F6C5",
            borderRadius: "14px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            fontFamily: "Arial",
            textAlign: "center"
        }}>
            <h2>✨ Motivation ✨</h2>
            <p>{message}</p>
        </div>
    );
}

export default Motivation;

