/**
 * App.jsx — root application shell
 */
import { useEffect, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import { checkHealth } from "./services/api";
import "./App.css";

export default function App() {
    const [backendStatus, setBackendStatus] = useState("checking"); // checking | ok | error

    useEffect(() => {
        checkHealth()
            .then(() => setBackendStatus("ok"))
            .catch(() => setBackendStatus("error"));
    }, []);

    return (
        <div className="app">
            {/* ── Header ── */}
            <header className="app-header">
                <div className="header-brand">
                    <span className="brand-icon">🏥</span>
                    <div>
                        <h1 className="brand-title">Healthcare RAG</h1>
                        <p className="brand-subtitle">Federated Medical AI Assistant</p>
                    </div>
                </div>
                <div className="header-status">
                    <span
                        className={`status-dot ${backendStatus === "ok" ? "status-ok" : backendStatus === "error" ? "status-err" : "status-checking"}`}
                    />
                    <span className="status-label">
                        {backendStatus === "ok"
                            ? "Backend connected"
                            : backendStatus === "error"
                                ? "Backend offline"
                                : "Connecting…"}
                    </span>
                </div>
            </header>

            {/* ── Warning banner when backend is down ── */}
            {backendStatus === "error" && (
                <div className="offline-banner">
                    ⚠️ Cannot reach the backend at <code>localhost:8000</code>. Start the FastAPI server first.
                </div>
            )}

            {/* ── Main chat ── */}
            <main className="app-main">
                <ChatInterface />
            </main>

            <footer className="app-footer">
                <p>Federated Healthcare RAG — Hackathon 2026 · Powered by Pinecone + Gemini</p>
            </footer>
        </div>
    );
}
