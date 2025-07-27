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
    const [showConfetti, setShowConfetti] = useState(false);


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
// Play coin sound
    const playCoinSound = () => {
        const audio = new Audio('/coin-sound.wav'); // Ensure this file is in your public directory
        audio.play().catch(err => console.error("Sound error:", err));
    };


    const updateStatus = async (taskId, newStatus) => {
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
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
            {showConfetti && <Confetti width={width} height={height} />}
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
