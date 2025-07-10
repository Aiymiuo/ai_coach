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
import './App.css'; // ✅ Import styling

function Planning() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [points, setPoints] = useState(0);
    const [scoring, setScoring] = useState({ easy: 5, medium: 10, hard: 20 });
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    // Load scoring config from Firestore
    useEffect(() => {
        const fetchScoring = async () => {
            const configDoc = await getDoc(doc(db, "config", "scoring"));
            if (configDoc.exists()) {
                setScoring(configDoc.data());
            }
        };
        fetchScoring();
    }, []);

    // Load tasks and points from Firestore
    useEffect(() => {
        if (!currentUser) return;

        const tasksRef = collection(db, "users", currentUser.uid, "planningTasks");
        const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
            const loadedTasks = [];
            snapshot.forEach(doc => {
                loadedTasks.push({ id: doc.id, ...doc.data() });
            });
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

    const playCoinSound = () => {
        const audio = new Audio('/coin-sound.wav');
        audio.play();
    };

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
            await updateDoc(userDocRef, { points: currentPoints + earnedPoints });
            setPoints(currentPoints + earnedPoints);
            playCoinSound();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        }

        await updateDoc(taskDoc, { status: newStatus });
    };

    if (!currentUser) {
        return <p>Please log in to access Planning.</p>;
    }

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
            {showConfetti && <Confetti width={width} height={height} />}
            <h2>Planning Journal 🌱</h2>
            <h3>Points: {points} 🪙</h3>
            <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Enter your task"
            />
            <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
            >
                <option value="easy">Easy (⭐)</option>
                <option value="medium">Medium (⭐⭐)</option>
                <option value="hard">Hard (⭐⭐⭐)</option>
            </select>
            <button onClick={addTask}>Add Task</button>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {tasks.map(task => (
                    <li key={task.id} style={{ margin: "10px 0" }}>
                        {task.text} - {task.difficulty}
                        <select
                            value={task.status}
                            onChange={(e) => updateStatus(task.id, e.target.value, task.difficulty, task.status)}
                            style={{ marginLeft: "10px" }}
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

