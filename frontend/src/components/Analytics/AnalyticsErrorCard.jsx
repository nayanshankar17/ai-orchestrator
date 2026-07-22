function AnalyticsErrorCard({ message, onRetry, colors }) {
    return (
        <div
            style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: "20px",
                padding: "24px",
                boxShadow: colors.cardShadow,
                color: colors.valueText,
            }}
        >
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Analytics unavailable</div>
            <p style={{ color: colors.mutedText, lineHeight: 1.6, marginBottom: "16px" }}>{message}</p>
            {onRetry ? (
                <button
                    onClick={onRetry}
                    style={{
                        border: "none",
                        backgroundColor: colors.primary,
                        color: "white",
                        borderRadius: "12px",
                        padding: "10px 16px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Retry
                </button>
            ) : null}
        </div>
    );
}

export default AnalyticsErrorCard;
