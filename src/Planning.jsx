// src/Planning.jsx
import React, { useEffect, useState } from "react";
import { db } from './Firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext.jsx";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import './App.css'; // ✅ Import custom styling

function Planning() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [points, setPoints] = useState(0);
    const [scoring, setScoring] = useState({ easy: 5, medium: 10, hard: 20 });
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    // Fetch scoring settings from Firestore
    useEffect(() => {
        const fetchScoring = async () => {
            const configDoc = await getDoc(doc(db, "config", "scoring"));
            if (configDoc.exists()) {
                setScoring(configDoc.data());
            }
        };
        fetchScoring();
    }, []);

    // Load user's tasks and points
    useEffect(() => {
        if (!currentUser) return;

        const tasksRef = collection(db, "users", currentUser.uid, "planningTasks");
        const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
            const loadedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(loadedTasks);
        });

        const fetchPoints = async () => {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                setPoints(userDoc.data().points || 0);
            }
        };
        fetchPoints();

        return () => unsubscribe();
    }, [currentUser]);

    // Add a new task
    const addTask = async () => {
        if (taskInput.trim() === "" || !currentUser) return;

        const newTask = {
            text: taskInput,
            status: "Not Started",
            difficulty: difficulty
        };

        await addDoc(collection(db, "users", currentUser.uid, "planningTasks"), newTask);
        setTaskInput("");
        setDifficulty("easy");
    };

    // Play coin sound
    const playCoinSound = () => {
        const audio = new Audio('/coin-sound.wav'); // Ensure this file is in your public directory
        audio.play().catch(err => console.error("Sound error:", err));
    };

    // Update task status
    const updateStatus = async (id, newStatus, taskDifficulty, currentStatus) => {
        if (!currentUser) return;

        const taskDoc = doc(db, "users", currentUser.uid, "planningTasks", id);

        if (currentStatus !== "Completed" && newStatus === "Completed") {
            const earnedPoints = scoring[taskDifficulty] || 0;
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            let currentPoints = 0;
            if (userDocSnap.exists()) {
                currentPoints = userDocSnap.data().points || 0;
            }

            await updateDoc(userDocRef, {
                points: currentPoints + earnedPoints
            });

            setPoints(currentPoints + earnedPoints);
            playCoinSound();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }

        await updateDoc(taskDoc, { status: newStatus });
    };

    if (!currentUser) {
        return <p>Please log in to access your planning dashboard.</p>;
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
            {showConfetti && <Confetti width={width} height={height} />}
            <h2>🌱 Planning Journal</h2>
            <h3>Points: {points} 🪙</h3>

            <div className="task-input-group">
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="What will you do today?"
                    className="task-input"
                />
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="task-select"
                >
                    <option value="easy">Easy ⭐</option>
                    <option value="medium">Medium ⭐</option>
                    <option value="hard">Hard ⭐⭐⭐</option>
                </select>
                <button onClick={addTask} className="add-button">Add Task</button>
            </div>

            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <span>{task.text}</span> - <strong>{task.difficulty}</strong>
                        <select
                            value={task.status}
                            onChange={(e) =>
                                updateStatus(task.id, e.target.value, task.difficulty, task.status)
                            }
                            className="status-select"
                        >
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Planning;
