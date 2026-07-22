import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function DailyActivityChart({ data, colors }) {
    return (
        <div style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: "20px",
            padding: "18px",
            boxShadow: colors.cardShadow,
            minHeight: "360px",
        }}>
            <div style={{ marginBottom: "14px" }}>
                <div style={{ color: colors.titleText, fontSize: "16px", fontWeight: 700 }}>Daily Activity</div>
                <div style={{ color: colors.mutedText, fontSize: "12px", marginTop: "4px" }}>Messages per day over time</div>
            </div>

            <div style={{ width: "100%", height: "280px" }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="4 4" stroke={colors.grid} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: colors.axisText, fontSize: 12 }}
                                axisLine={{ stroke: colors.grid }}
                                tickLine={{ stroke: colors.grid }}
                            />
                            <YAxis
                                tick={{ fill: colors.axisText, fontSize: 12 }}
                                axisLine={{ stroke: colors.grid }}
                                tickLine={{ stroke: colors.grid }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: colors.tooltipBg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "12px",
                                    color: colors.valueText,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="messages"
                                stroke={colors.line}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: colors.line }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ color: colors.mutedText, display: "grid", placeItems: "center", height: "100%", textAlign: "center", padding: "0 20px" }}>
                        No daily activity yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default DailyActivityChart;
