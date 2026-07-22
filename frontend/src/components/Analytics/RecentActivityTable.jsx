function RecentActivityTable({ rows, colors, onRowClick }) {
    return (
        <div style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: "20px",
            padding: "18px",
            boxShadow: colors.cardShadow,
        }}>
            <div style={{ marginBottom: "14px" }}>
                <div style={{ color: colors.titleText, fontSize: "16px", fontWeight: 700 }}>Recent Activity</div>
                <div style={{ color: colors.mutedText, fontSize: "12px", marginTop: "4px" }}>Jump back into any recent session</div>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", color: colors.mutedText, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            <th style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>Session Name</th>
                            <th style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>Created Time</th>
                            <th style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>Total Messages</th>
                            <th style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>Provider Used</th>
                            <th style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>Tokens</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? rows.map((row) => (
                            <tr
                                key={row.session_id}
                                onClick={() => onRowClick(row.session_id)}
                                style={{
                                    cursor: "pointer",
                                    borderBottom: `1px solid ${colors.softBorder}`,
                                    transition: "background-color 0.18s ease",
                                }}
                                onMouseEnter={(event) => {
                                    event.currentTarget.style.backgroundColor = colors.rowHover;
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                <td style={{ padding: "14px", color: colors.valueText, fontWeight: 600 }}>{row.session_title}</td>
                                <td style={{ padding: "14px", color: colors.mutedText }}>{row.created_at_label}</td>
                                <td style={{ padding: "14px", color: colors.valueText }}>{row.total_messages}</td>
                                <td style={{ padding: "14px", color: colors.valueText }}>{row.provider || "Unknown"}</td>
                                <td style={{ padding: "14px", color: colors.valueText }}>{row.token_count ?? 0}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "20px 14px", color: colors.mutedText, textAlign: "center" }}>
                                    No recent sessions yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentActivityTable;
