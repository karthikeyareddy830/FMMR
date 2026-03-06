/**
 * ResponseCard.jsx — displays the LLM answer + source list + confidence bar
 */
import SourceBadge from "./SourceBadge";

export default function ResponseCard({ data }) {
    const { answer, sources, trust_score } = data;

    // We now receive trust_score as a percentage (e.g. 87.5) instead of a decimal confidence
    const confPercent = Math.round(trust_score || 0);
    const confColor =
        confPercent >= 80 ? "#22c55e" : confPercent >= 55 ? "#f59e0b" : "#ef4444";

    return (
        <div className="response-card">
            {/* ── Header ── */}
            <div className="response-header">
                <div className="confidence-bar-wrap">
                    <span className="confidence-label">Confidence</span>
                    <div className="confidence-bar">
                        <div
                            className="confidence-fill"
                            style={{ width: `${confPercent}%`, background: confColor }}
                        />
                    </div>
                    <span className="confidence-value" style={{ color: confColor }}>
                        {confPercent}%
                    </span>
                </div>
            </div>

            {/* ── Answer ── */}
            <div className="answer-block">
                <h3 className="answer-title">🤖 AI Answer</h3>
                <p className="answer-text">{answer}</p>
            </div>

            {/* ── Safety disclaimer ── */}
            <div className="disclaimer">
                ⚕️ <em>This is AI-generated information. Always consult a qualified healthcare professional for medical advice.</em>
            </div>

            {/* ── Sources ── */}
            {sources?.length > 0 && (
                <div className="sources-block">
                    <h4 className="sources-title">📚 Retrieved Medical Evidence ({sources.length} sources)</h4>
                    <div className="sources-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        {sources.map((src, idx) => (
                            <SourceBadge key={idx} source={src} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
