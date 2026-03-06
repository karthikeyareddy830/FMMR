/**
 * SourceBadge.jsx — displays a single source document with trust score
 */
export default function SourceBadge({ source }) {
    const { id, text, score, source: sourceName, trust_score } = source;

    const trustColor =
        trust_score >= 0.8
            ? "#22c55e"   // green
            : trust_score >= 0.6
                ? "#f59e0b"   // amber
                : "#ef4444";  // red

    return (
        <div className="source-badge">
            <div className="source-badge-header">
                <span className="source-name">📄 {sourceName}</span>
                <span className="trust-pill" style={{ background: trustColor }}>
                    Trust {Math.round(trust_score * 100)}%
                </span>
                <span className="sim-score">sim {score.toFixed(3)}</span>
            </div>
            <p className="source-text">{text.length > 240 ? text.slice(0, 240) + "…" : text}</p>
        </div>
    );
}
