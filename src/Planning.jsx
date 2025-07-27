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
import './App.css';

function Planning() {
    const { currentUser } = useAuth();
    const [taskInput, setTaskInput] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [tasks, setTasks] = useState([]);
    const userId = currentUser?.uid;

    // Points per difficulty
    const difficultyPoints = {
        Easy: 5,
        Medium: 10,
        Hard: 20,
    };

    // Play success sound
    const playSuccessSound = () => {
        const audio = new Audio("/coin-sound.wav");
        audio.play();
    };

    // Add new task
    const addTask = async () => {
        if (!taskInput.trim()) return;

        try {
            const tasksCollection = collection(db, "Participants", userId, "Tasks");
            await addDoc(tasksCollection, {
                text: taskInput.trim(),
                difficulty,
                status: "Not Started",
            });
            setTaskInput("");
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

    // Load tasks in real time
    useEffect(() => {
        if (!userId) return;

        const tasksCollection = collection(db, "Participants", userId, "Tasks");
        const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
            const loadedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(loadedTasks);
        });

        return () => unsubscribe();
    }, [userId]);

    // Update status (and play sound if Completed)
    const updateStatus = async (taskId, newStatus) => {
        try {
            const taskRef = doc(db, "Participants", userId, "Tasks", taskId);
            await updateDoc(taskRef, { status: newStatus });

            if (newStatus === "Completed") {
                playSuccessSound();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    // Calculate total points
    const totalPoints = tasks.reduce((sum, task) => {
        if (task.status === "Completed") {
            return sum + (difficultyPoints[task.difficulty] || 0);
        }
        return sum;
    }, 0);

    return (
        <div className="planning-container">
            <h2>Planning Page</h2>

            <div className="input-group">
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Enter task"
                    className="task-input"
                />
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="difficulty-select"
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                <button onClick={addTask} className="add-button">Add Task</button>
            </div>

            <h3>Total Points Earned: {totalPoints}</h3>

            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <span>{task.text}</span> — <strong>{task.difficulty}</strong>
                        <select
                            value={task.status}
                            onChange={(e) => updateStatus(task.id, e.target.value)}
className="status-select"
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Planning;
