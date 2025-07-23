import React, { useEffect, useState } from "react";
import { db } from './Firebase';
import { collection, onSnapshot, doc, updateDoc, increment, getDoc } from "firebase/firestore";

function Dashboard() {
    const [teams, setTeams] = useState([]);
    const [newTaskName, setNewTaskName] = useState("");
    const [userData, setUserData] = useState([]);

    // Track all users and their completed tasks
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const users = [];
            const teamScores = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    ...data
                });

                // Calculate team scores
                const teamName = data.teamName || "No Team";
                const score = data.score || 0;

                if (!teamScores[teamName]) {
                    teamScores[teamName] = 0;
                }
                teamScores[teamName] += score;
            });

            const teamList = Object.entries(teamScores)
                .map(([teamName, score]) => ({ 
                    teamName, 
                    score,
                    members: users.filter(user => user.teamName === teamName)
                }))
                .sort((a, b) => b.score - a.score);

            setTeams(teamList);
            setUserData(users);
        });

        return () => unsubscribe();
    }, []);

    const completeTask = async (userId, taskName) => {
        const taskId = taskName.toLowerCase().replace(/\s+/g, '_');
        const userRef = doc(db, "users", userId);
        
        try {
            // Check if task already completed
            const userDoc = await getDoc(userRef);
            if (userDoc.data()?.completedTasks?.[taskId]) {
                alert("You've already completed this task!");
                return;
            }
            
            // Update Firestore
            await updateDoc(userRef, {
                score: increment(10),
                [`completedTasks.${taskId}`]: true
            });
            
            setNewTaskName("");
        } catch (error) {
            console.error("Task completion failed:", error);
        }
    };

    return (
        <div style={{
            background: "#E8C9E7",
            padding: "20px",
            borderRadius: "12px",
            maxWidth: "600px", // Slightly wider to accommodate new content
            margin: "20px auto",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            fontFamily: "Arial"
        }}>
            <h2>🏆 Team Leaderboard</h2>
            {teams.length === 0 ? (
                <p>No team data yet. 🚀</p>
            ) : (
                <>
                    <table style={{ 
                        width: "100%", 
                        borderCollapse: "collapse",
                        marginBottom: "20px"
                    }}>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team</th>
                                <th>Score 🪙</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team, index) => (
                                <tr key={index} style={{ background: index % 2 === 0 ? "#fffaf0" : "#fff" }}>
                                    <td>{index + 1}</td>
                                    <td>{team.teamName}</td>
                                    <td>{team.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{
                        background: "white",
                        padding: "15px",
                        borderRadius: "8px",
                        marginTop: "20px"
                    }}>
                        <h3>Complete Tasks</h3>
                        <div style={{ margin: "10px 0" }}>
                            <input
                                type="text"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                placeholder="Enter task name"
                                style={{
                                    padding: "8px",
                                    width: "60%",
                                    marginRight: "10px",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd"
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (!newTaskName.trim()) return;
                                    const currentUser = userData.find(user => user.email === loggedInEmail);
                                    if (currentUser) {
                                        completeTask(currentUser.id, newTaskName);
                                    }
                                }}
                                style={{
                                    padding: "8px 16px",
                                    background: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Mark Complete (+10pts)
                            </button>
                        </div>
                        <small style={{ color: "#666" }}>
                            Each task can only be completed once per user
                        </small>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;