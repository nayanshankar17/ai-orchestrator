import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function ConversationBarChart({ title, subtitle, data, dataKey, valueLabel, colors, emptyMessage }) {
    return (
        <div style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: "20px",
            padding: "18px",
            boxShadow: colors.cardShadow,
            minHeight: "320px",
        }}>
            <div style={{ marginBottom: "14px" }}>
                <div style={{ color: colors.titleText, fontSize: "16px", fontWeight: 700 }}>{title}</div>
                <div style={{ color: colors.mutedText, fontSize: "12px", marginTop: "4px" }}>{subtitle}</div>
            </div>

            <div style={{ width: "100%", height: "240px" }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="4 4" stroke={colors.grid} />
                            <XAxis
                                dataKey="session"
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
                                formatter={(value) => [`${valueLabel}: ${value}`, title]}
                                contentStyle={{
                                    backgroundColor: colors.tooltipBg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "12px",
                                    color: colors.valueText,
                                }}
                            />
                            <Bar dataKey={dataKey} fill={colors.bar} radius={[8, 8, 0, 0]} maxBarSize={34} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ color: colors.mutedText, display: "grid", placeItems: "center", height: "100%", textAlign: "center", padding: "0 20px" }}>
                        {emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConversationBarChart;
