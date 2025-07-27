// src/Planning.jsx
import React, { useEffect, useState } from "react";
import { db } from './Firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    doc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext"; // if you're using AuthContext

function Planning() {
    const { currentUser } = useAuth(); // Make sure you're logged in
    const [taskInput, setTaskInput] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const tasksRef = collection(db, "Tasks");
        const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
            const tasksData = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter(task => task.userId === currentUser.uid); // show only user's tasks

            setTasks(tasksData);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addTask = async () => {
        if (!taskInput.trim()) return;

        try {
            const userId = currentUser.uid;
            const taskCollection = collection (db, "Participants", userId, "Tasks");
            await addDoc(collection(db, "Tasks"), {
                text: taskInput,
                difficulty: difficulty,
                status: "Not Started",
                userId: currentUser.uid,
                createdAt: new Date(),
            });

            setTaskInput("");
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task.")
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            const taskRef = doc(db, "Tasks", taskId);
            await updateDoc(taskRef, {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    return (
        <div className="planning-container">
            <h2>Planning</h2>

            <div className="task-input-container">
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
                    <option value="medium">Medium ⭐⭐</option>
                    <option value="hard">Hard ⭐⭐⭐</option>
                </select>

                <button onClick={addTask} className="add-button">Add Task</button>
            </div>

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
