/**
 * ChatInterface.jsx — main chat input, history, language selector
 */
import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/api";
import ResponseCard from "./ResponseCard";

const LANGUAGE_OPTIONS = [
    { code: "en", label: "🇬🇧 English" },
    { code: "hi", label: "🇮🇳 Hindi" },
    { code: "te", label: "🏳 Telugu" },
];

export default function ChatInterface() {
    const [query, setQuery] = useState("");
    const [language, setLanguage] = useState("en");
    const [topK, setTopK] = useState(5);
    const [history, setHistory] = useState([]); // [{ query, response, error, loading }]
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    // Auto-scroll to latest result
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q || isLoading) return;

        const entry = { query: q, response: null, error: null, loading: true, id: Date.now() };
        setHistory((h) => [...h, entry]);
        setQuery("");
        setIsLoading(true);

        try {
            const data = await askQuestion(q, topK, language);
            setHistory((h) =>
                h.map((item) =>
                    item.id === entry.id ? { ...item, response: data, loading: false } : item
                )
            );
        } catch (err) {
            const errorMsg =
                err?.response?.data?.detail || err.message || "An unexpected error occurred.";
            setHistory((h) =>
                h.map((item) =>
                    item.id === entry.id ? { ...item, error: errorMsg, loading: false } : item
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-interface">
            {/* ── Conversation history ── */}
            <div className="chat-history">
                {history.length === 0 && (
                    <div className="empty-state">
                        <p>Ask any healthcare question to get started.</p>
                        <p className="empty-examples">
                            Try: <em>"What are symptoms of Type 2 diabetes?"</em> or{" "}
                            <em>"How does hypertension affect the heart?"</em>
                        </p>
                    </div>
                )}

                {history.map((item) => (
                    <div key={item.id} className="history-entry">
                        <div className="user-bubble">
                            <span className="bubble-icon">👤</span>
                            <p>{item.query}</p>
                        </div>

                        {item.loading && (
                            <div className="loading-bubble">
                                <span className="spinner" /> Searching knowledge base…
                            </div>
                        )}

                        {item.error && (
                            <div className="error-bubble">
                                ⚠️ {item.error}
                            </div>
                        )}

                        {item.response && <ResponseCard data={item.response} />}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* ── Input area ── */}
            <form className="chat-input-area" onSubmit={handleSubmit}>
                <div className="input-options">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="lang-select"
                        id="language-select"
                    >
                        {LANGUAGE_OPTIONS.map((l) => (
                            <option key={l.code} value={l.code}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                    <label className="topk-label" htmlFor="topk-select">
                        Sources:
                    </label>
                    <select
                        id="topk-select"
                        value={topK}
                        onChange={(e) => setTopK(Number(e.target.value))}
                        className="topk-select"
                    >
                        {[3, 5, 7, 10].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>

                <div className="input-row">
                    <textarea
                        id="query-input"
                        className="query-input"
                        rows={2}
                        placeholder="Ask a medical question…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        id="submit-btn"
                        type="submit"
                        className="submit-btn"
                        disabled={!query.trim() || isLoading}
                    >
                        {isLoading ? "…" : "Ask"}
                    </button>
                </div>
            </form>
        </div>
    );
}
