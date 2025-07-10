// src/Risk.jsx
import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext.jsx";
import './App.css';

function Risk() {
    const { currentUser } = useAuth();
    const [riskReport, setRiskReport] = useState("Analyzing your risks...");

    useEffect(() => {
        if (!currentUser) {
            setRiskReport("Please log in to view your risk analysis.");
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

            // Dynamic risk analysis
            if (inProgress >= 5) {
                setRiskReport("⚠️ Risk: You have many tasks in progress. This could lead to overwhelm. Try completing some before adding new ones.");
            } else if (notStarted >= 5) {
                setRiskReport("⚠️ Risk: You have many tasks not started. Prioritize and start small to avoid bottlenecks.");
            } else if (completed === 0 && (inProgress + notStarted) > 0) {
                setRiskReport("⚠️ Risk: Tasks are added but none completed. Focus on completing at least one task.");
            } else {
                setRiskReport("✅ No significant risks detected! Keep maintaining your momentum.");
            }
        };

        fetchData();
    }, [currentUser]);

    return (
        <div style={{
            padding: "20px",
            maxWidth: "400px",
            margin: "20px auto",
            background: "#CBDEEE",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            fontFamily: "Arial",
            textAlign: "center"
        }}>
            <h2>⚡ Risk Analysis ⚡</h2>
            <p>{riskReport}</p>
        </div>
    );
}

export default Risk;

