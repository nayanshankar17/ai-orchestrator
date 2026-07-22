function AnalyticsSkeleton({ colors }) {
    const shimmer = {
        background: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonHighlight} 37%, ${colors.skeletonBase} 63%)`,
        backgroundSize: "400% 100%",
        animation: "analyticsShimmer 1.3s ease-in-out infinite",
    };

    return (
        <div style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} style={{ borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "18px", backgroundColor: colors.cardBg }}>
                        <div style={{ ...shimmer, height: "12px", width: "96px", borderRadius: "999px" }} />
                        <div style={{ ...shimmer, height: "34px", width: "60%", borderRadius: "14px", marginTop: "18px" }} />
                        <div style={{ ...shimmer, height: "12px", width: "74%", borderRadius: "999px", marginTop: "14px" }} />
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} style={{ borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "18px", backgroundColor: colors.cardBg, minHeight: "320px" }}>
                        <div style={{ ...shimmer, height: "16px", width: "160px", borderRadius: "999px" }} />
                        <div style={{ ...shimmer, height: "12px", width: "210px", borderRadius: "999px", marginTop: "10px" }} />
                        <div style={{ ...shimmer, height: "240px", borderRadius: "18px", marginTop: "18px" }} />
                    </div>
                ))}
            </div>

            <div style={{ borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "18px", backgroundColor: colors.cardBg, minHeight: "240px" }}>
                <div style={{ ...shimmer, height: "16px", width: "150px", borderRadius: "999px" }} />
                <div style={{ ...shimmer, height: "12px", width: "240px", borderRadius: "999px", marginTop: "10px" }} />
                <div style={{ ...shimmer, height: "180px", borderRadius: "18px", marginTop: "18px" }} />
            </div>

            <style>{`
                @keyframes analyticsShimmer {
                    0% { background-position: 100% 0; }
                    100% { background-position: 0 0; }
                }
            `}</style>
        </div>
    );
}

export default AnalyticsSkeleton;
