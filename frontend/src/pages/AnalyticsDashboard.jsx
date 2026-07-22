import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SummaryCard from "../components/Analytics/SummaryCard";
import ProviderPieChart from "../components/Analytics/ProviderPieChart";
import DailyActivityChart from "../components/Analytics/DailyActivityChart";
import ConversationBarChart from "../components/Analytics/ConversationBarChart";
import RecentActivityTable from "../components/Analytics/RecentActivityTable";
import AnalyticsSkeleton from "../components/Analytics/AnalyticsSkeleton";
import AnalyticsErrorCard from "../components/Analytics/AnalyticsErrorCard";
import { fetchAnalyticsDashboardData } from "../services/analyticsService";

function formatDisplayDate(value) {
    if (!value) {
        return "N/A";
    }

    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
        return value;
    }

    return dateValue.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDisplayDateTime(value) {
    if (!value) {
        return "N/A";
    }

    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
        return value;
    }

    return dateValue.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AnalyticsDashboard() {
    const navigate = useNavigate();

    const [preferences, setPreferences] = useState({ theme: "dark" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        mySummary: null,
        providerUsage: [],
        dailyActivity: [],
        conversationStatistics: null,
        recentActivity: [],
    });

    const fetchPreferences = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            return;
        }

        const response = await fetch("http://127.0.0.1:8000/preferences", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        setPreferences(data);
    };

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            await fetchPreferences();
            const data = await fetchAnalyticsDashboardData();
            setAnalytics(data);
        } catch (loadError) {
            setError(loadError.message || "Failed to load analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const isLight = preferences?.theme === "light";

    const colors = useMemo(() => ({
        pageBg: isLight ? "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" : "linear-gradient(180deg, #111318 0%, #171717 60%, #101010 100%)",
        cardBg: isLight ? "rgba(255,255,255,0.92)" : "rgba(23,23,23,0.94)",
        border: isLight ? "#e5e7eb" : "#2f2f2f",
        softBorder: isLight ? "#f1f5f9" : "#242424",
        titleText: isLight ? "#0f172a" : "#f8fafc",
        valueText: isLight ? "#111827" : "#f3f4f6",
        mutedText: isLight ? "#64748b" : "#9ca3af",
        iconBg: isLight ? "#e0e7ff" : "#202020",
        iconColor: isLight ? "#1d4ed8" : "#93c5fd",
        primary: isLight ? "#2563eb" : "#60a5fa",
        rowHover: isLight ? "#f8fafc" : "#1f1f1f",
        grid: isLight ? "#e5e7eb" : "#303030",
        axisText: isLight ? "#64748b" : "#94a3b8",
        tooltipBg: isLight ? "#ffffff" : "#181818",
        line: isLight ? "#2563eb" : "#60a5fa",
        bar: isLight ? "#10b981" : "#34d399",
        errorBorder: isLight ? "#fca5a5" : "#7f1d1d",
        cardShadow: isLight ? "0 18px 40px rgba(15, 23, 42, 0.08)" : "0 20px 45px rgba(0, 0, 0, 0.35)",
        cardHoverShadow: isLight ? "0 24px 50px rgba(15, 23, 42, 0.12)" : "0 24px 55px rgba(0, 0, 0, 0.45)",
        skeletonBase: isLight ? "#e2e8f0" : "#232323",
        skeletonHighlight: isLight ? "#f8fafc" : "#2c2c2c",
        palette: isLight
            ? ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]
            : ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"],
    }), [isLight]);

    const summaryCards = useMemo(() => {
        const mySummary = analytics.mySummary || {};
        return [
            {
                icon: "🗂️",
                title: "Total Sessions",
                value: mySummary.total_sessions ?? 0,
                subtitle: "Sessions created on this account",
            },
            {
                icon: "💬",
                title: "Total Messages",
                value: mySummary.total_messages ?? 0,
                subtitle: "All user and assistant messages",
            },
            {
                icon: "📈",
                title: "Avg. Messages / Session",
                value: Number(mySummary.average_messages_per_session || 0).toFixed(1),
                subtitle: "Conversation density across sessions",
            },
            {
                icon: "⚡",
                title: "Favorite Provider",
                value: mySummary.favorite_provider || "N/A",
                subtitle: "Most used model provider",
            },
            {
                icon: "🕒",
                title: "Last Active",
                value: formatDisplayDate(mySummary.last_chat_at),
                subtitle: "Most recent message activity",
            },
        ];
    }, [analytics.mySummary]);

    const dailyActivity = (analytics.dailyActivity || []).map((item) => ({
        date: formatDisplayDate(item.date),
        messages: item.messages,
    }));

    const messageBars = analytics.recentActivity.map((item) => ({
        session: item.session_title.length > 12 ? `${item.session_title.slice(0, 12)}…` : item.session_title,
        messages: item.total_messages,
    }));

    const tokenBars = analytics.recentActivity
        .filter((item) => Number(item.token_count || 0) > 0)
        .map((item) => ({
            session: item.session_title.length > 12 ? `${item.session_title.slice(0, 12)}…` : item.session_title,
            tokens: item.token_count,
        }));

    const recentRows = analytics.recentActivity.map((item) => ({
        ...item,
        created_at_label: formatDisplayDateTime(item.created_at),
    }));

    return (
        <div style={{ minHeight: "100svh", background: colors.pageBg, color: colors.valueText }}>
            <div style={{
                maxWidth: "1440px",
                margin: "0 auto",
                padding: "24px clamp(16px, 4vw, 32px) 36px",
                boxSizing: "border-box",
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "22px",
                }}>
                    <div>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "999px",
                            backgroundColor: colors.cardBg,
                            border: `1px solid ${colors.border}`,
                            color: colors.mutedText,
                            fontSize: "12px",
                            fontWeight: 600,
                            marginBottom: "14px",
                            boxShadow: colors.cardShadow,
                        }}>
                            <span style={{ color: colors.primary }}>●</span> Analytics
                        </div>
                        <h1 style={{ margin: 0, color: colors.titleText, fontSize: "clamp(28px, 5vw, 46px)", lineHeight: 1.05 }}>Analytics Dashboard</h1>
                        <p style={{ marginTop: "10px", color: colors.mutedText, maxWidth: "760px", lineHeight: 1.6 }}>
                            Track conversation volume, provider usage, and recent session activity across your AI Orchestrator workspace.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.cardBg,
                                color: colors.valueText,
                                borderRadius: "14px",
                                padding: "11px 16px",
                                cursor: "pointer",
                                fontWeight: 600,
                                boxShadow: colors.cardShadow,
                            }}
                        >
                            ← Back to Chat
                        </button>
                        <button
                            onClick={loadAnalytics}
                            style={{
                                border: "none",
                                backgroundColor: colors.primary,
                                color: "white",
                                borderRadius: "14px",
                                padding: "11px 16px",
                                cursor: "pointer",
                                fontWeight: 700,
                                boxShadow: colors.cardShadow,
                            }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <AnalyticsSkeleton colors={colors} />
                ) : error ? (
                    <AnalyticsErrorCard message={error} onRetry={loadAnalytics} colors={colors} />
                ) : (
                    <div style={{ display: "grid", gap: "20px" }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                            gap: "16px",
                        }}>
                            {summaryCards.map((card) => (
                                <SummaryCard key={card.title} {...card} colors={colors} />
                            ))}
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                            gap: "16px",
                            alignItems: "stretch",
                        }}>
                            <ProviderPieChart data={analytics.providerUsage || []} colors={colors} />
                            <DailyActivityChart data={dailyActivity} colors={colors} />
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                            gap: "16px",
                            alignItems: "stretch",
                        }}>
                            <ConversationBarChart
                                title="Messages per Session"
                                subtitle="Recent session volume"
                                data={messageBars}
                                dataKey="messages"
                                valueLabel="Messages"
                                colors={colors}
                                emptyMessage="No session volume data available yet."
                            />

                            <ConversationBarChart
                                title="Tokens per Session"
                                subtitle="Assistant token consumption"
                                data={tokenBars}
                                dataKey="tokens"
                                valueLabel="Tokens"
                                colors={colors}
                                emptyMessage="Token usage is not available for the recent sessions yet."
                            />
                        </div>

                        <RecentActivityTable
                            rows={recentRows}
                            colors={colors}
                            onRowClick={(sessionId) => navigate(`/dashboard?session=${sessionId}`)}
                        />

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "16px",
                        }}>
                            <div style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: "20px", padding: "18px", boxShadow: colors.cardShadow }}>
                                <div style={{ color: colors.mutedText, fontSize: "12px", marginBottom: "8px" }}>Average Messages</div>
                                <div style={{ color: colors.valueText, fontSize: "28px", fontWeight: 700 }}>{Number(analytics.conversationStatistics?.average_messages_per_session || 0).toFixed(1)}</div>
                            </div>
                            <div style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: "20px", padding: "18px", boxShadow: colors.cardShadow }}>
                                <div style={{ color: colors.mutedText, fontSize: "12px", marginBottom: "8px" }}>Longest Session</div>
                                <div style={{ color: colors.valueText, fontSize: "28px", fontWeight: 700 }}>{analytics.conversationStatistics?.longest_session || 0}</div>
                            </div>
                            <div style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: "20px", padding: "18px", boxShadow: colors.cardShadow }}>
                                <div style={{ color: colors.mutedText, fontSize: "12px", marginBottom: "8px" }}>Shortest Session</div>
                                <div style={{ color: colors.valueText, fontSize: "28px", fontWeight: 700 }}>{analytics.conversationStatistics?.shortest_session || 0}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
