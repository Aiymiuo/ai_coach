// src/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { db } from './Firebase';
import { collection, onSnapshot } from "firebase/firestore";

function Dashboard() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const teamScores = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const teamName = data.teamName || "No Team";
                const score = data.score || 0;

                if (!teamScores[teamName]) {
                    teamScores[teamName] = 0;
                }
                teamScores[teamName] += score;
            });

            const teamList = Object.entries(teamScores)
                .map(([teamName, score]) => ({ teamName, score }))
                .sort((a, b) => b.score - a.score);

            setTeams(teamList);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={{
            background: "#E8C9E7",
            padding: "20px",
            borderRadius: "12px",
            maxWidth: "400px",
            margin: "20px auto",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            fontFamily: "Arial"
        }}>
            <h2>🏆 Team Leaderboard</h2>
            {teams.length === 0 ? (
                <p>No team data yet. 🚀</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
            )}
        </div>
    );
}

export default Dashboard;
