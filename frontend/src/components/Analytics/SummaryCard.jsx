import { useState } from "react";

function SummaryCard({ icon, title, value, subtitle, colors }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: "20px",
                padding: "18px 18px 16px 18px",
                boxShadow: isHovered ? colors.cardHoverShadow : colors.cardShadow,
                transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                transition: "all 0.22s ease",
                minHeight: "132px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div
                    style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "14px",
                        display: "grid",
                        placeItems: "center",
                        background: colors.iconBg,
                        color: colors.iconColor,
                        fontSize: "18px",
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
                <span style={{ color: colors.mutedText, fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Overview
                </span>
            </div>

            <div style={{ marginTop: "14px" }}>
                <div style={{ color: colors.titleText, fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>{title}</div>
                <div style={{ color: colors.valueText, fontSize: "31px", fontWeight: 700, lineHeight: 1.05 }}>{value}</div>
                {subtitle ? <div style={{ color: colors.mutedText, fontSize: "12px", marginTop: "8px", lineHeight: 1.4 }}>{subtitle}</div> : null}
            </div>
        </div>
    );
}

export default SummaryCard;
