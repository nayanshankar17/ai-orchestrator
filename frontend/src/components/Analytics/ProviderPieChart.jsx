import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function ProviderPieChart({ data, colors }) {
    const chartData = data.map((item) => ({
        name: item.provider || "Unknown",
        value: item.count,
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const renderLabel = ({ name, percent, value }) => {
        const percentage = Math.round((percent || 0) * 100);
        return `${name} ${percentage}% (${value})`;
    };

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
                <div style={{ color: colors.titleText, fontSize: "16px", fontWeight: 700 }}>Provider Usage</div>
                <div style={{ color: colors.mutedText, fontSize: "12px", marginTop: "4px" }}>Share of messages by model provider</div>
            </div>

            <div style={{ width: "100%", height: "280px" }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={55}
                                paddingAngle={3}
                                label={renderLabel}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`provider-slice-${entry.name}-${index}`} fill={colors.palette[index % colors.palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [`${value} messages`, name]}
                                contentStyle={{
                                    backgroundColor: colors.tooltipBg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "12px",
                                    color: colors.valueText,
                                }}
                                labelStyle={{ color: colors.valueText }}
                            />
                            <Legend wrapperStyle={{ color: colors.mutedText }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ color: colors.mutedText, display: "grid", placeItems: "center", height: "100%", textAlign: "center", padding: "0 20px" }}>
                        No provider usage yet.
                    </div>
                )}
            </div>

            <div style={{ display: "flex", marginTop: "8px", color: colors.mutedText, fontSize: "12px"}}>
                <span>Total messages</span>
                <span style={{ color: colors.valueText, fontWeight: 700 , padding: "0 0 0 10px"}}>{total}</span>
            </div>
        </div>
    );
}

export default ProviderPieChart;
