const API_BASE_URL = "http://127.0.0.1:8000";

async function fetchWithAuth(path, token) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed for ${path}`);
    }

    return response.json();
}

function getDominantProvider(providerUsage = []) {
    if (!providerUsage.length) {
        return null;
    }

    const sortedUsage = [...providerUsage].sort((left, right) => right.count - left.count);
    return sortedUsage[0]?.provider || null;
}

function calculateTokenCount(messages = []) {
    return messages.reduce((total, message) => {
        if (message.role !== "assistant") {
            return total;
        }

        return total + Number(message.token_count || 0);
    }, 0);
}

export async function fetchAnalyticsDashboardData() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("You must be signed in to view analytics.");
    }

    const [mySummary, providerUsage, dailyActivity, conversationStatistics, recentActivity] = await Promise.all([
        fetchWithAuth("/analytics/my_summary", token),
        fetchWithAuth("/analytics/provider_usage", token),
        fetchWithAuth("/analytics/daily_activity", token),
        fetchWithAuth("/analytics/conversation_statistics", token),
        fetchWithAuth("/analytics/recent_activity", token),
    ]);

    const enrichedRecentActivity = await Promise.all(
        recentActivity.slice(0, 8).map(async (item) => {
            const [sessionSummary, sessionMessages] = await Promise.all([
                fetchWithAuth(`/analytics/session_summary/${item.session_id}`, token),
                fetchWithAuth(`/session/${item.session_id}`, token),
            ]);

            return {
                ...item,
                total_messages: sessionSummary.total_messages,
                provider_used: getDominantProvider(sessionSummary.provider_usage),
                token_count: calculateTokenCount(sessionMessages),
            };
        })
    );

    return {
        mySummary,
        providerUsage,
        dailyActivity,
        conversationStatistics,
        recentActivity: enrichedRecentActivity,
    };
}
