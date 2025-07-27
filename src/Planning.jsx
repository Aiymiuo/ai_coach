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
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

function Planning() {
    const { currentUser } = useAuth();
    const [taskInput, setTaskInput] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [tasks, setTasks] = useState([]);
    const [teamId, setTeamId] = useState(null);
    const [responsible, setResponsible] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();
    const tasksRef = collection(db, "Teams", teamName, "Tasks");

    const difficultyPoints = {
        Easy: 5,
        Medium: 10,
        Hard: 20,
    };

    const playSuccessSound = () => {
        const audio = new Audio("/coin-sound.wav");
        audio.play();
    };

    // Get user's teamId from Firestore
    useEffect(() => {
        const fetchTeamId = async () => {
            if (!currentUser) return;
            const userRef = doc(db, "Participants", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setTeamId(data.teamId);
            }
        };
        fetchTeamId();
    }, [currentUser]);

    // Load tasks from team's collection
    useEffect(() => {
        if (!teamId) return;

        const tasksCollection = collection(db, "Teams", teamId, "Tasks");
        const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
            const loadedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(loadedTasks);
        });

        return () => unsubscribe();
    }, [teamId]);

    const addTask = async () => {
        if (!taskInput.trim()  
        )!responsible.trim()  
        !teamId?.trim() 
        return;

        try {
            const tasksCollection = collection(db, "Teams", teamId, "Tasks");
            await addDoc(tasksCollection, {
                text: taskInput.trim(),
                difficulty,
                responsible: responsible.trim(),
                status: "Not Started",
            });
            setTaskInput("");
            setResponsible("");
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        if (!teamId) return;

        try {
            const taskRef = doc(db, "Teams", teamId, "Tasks", taskId);
            await updateDoc(taskRef, { status: newStatus });

            if (newStatus === "Completed") {
                playSuccessSound();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

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
                <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Responsible person"
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

            {showConfetti && <Confetti width={width} height={height} />}

            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <span>{task.text}</span> — <strong>{task.difficulty}</strong> — 
                        <em>{task.responsible}</em>
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