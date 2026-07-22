import { useState, useEffect } from "react";

const MODEL_OPTIONS = {
    groq: [
        {
            value: "llama-3.3-70b-versatile",
            label: "Llama 3.3 70B Versatile",
        },
    ],
    gemini: [
        {
            value: "gemini-2.5-flash",
            label: "Gemini 2.5 Flash",
        },
    ],
};

// Toggle Component (Custom Switch)
function Toggle({ checked, onChange }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: "44px",
                height: "24px",
                borderRadius: "999px",
                backgroundColor: checked ? "#10a37f" : "#4b5563",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s ease, transform 0.1s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            <div
                style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    position: "absolute",
                    top: "3px",
                    left: checked ? "23px" : "3px",
                    transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
            />
        </div>
    );
}

// Preferences Modal Component
function PreferencesModal({ onClose, onSaveSuccess }) {
    const [preferences, setPreferences] = useState({
        preferred_provider: "groq",
        preferred_model: "",
        response_style: "balanced",
        temperature: 0.7,
        max_tokens: 1024,
        auto_scroll: true,
        typewriter_animation: true,
        show_analytics: true,
        render_markdown: true,
        code_highlighting: true,
        theme: "dark",
        font_size: 16,
        compact_mode: false,
        sidebar_collapsed: false,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("ai"); // "ai" | "chat" | "appearance" 
    const [notification, setNotification] = useState(null); // { type: "success" | "error", message: "" }

    // Auto-clear notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Fetch user preferences on mount
    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/preferences", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load user preferences.");
            }

            const data = await response.json();
            // Ensure values aren't null/undefined
            setPreferences({
                preferred_provider: data.preferred_provider || "groq",
                preferred_model: data.preferred_model || "",
                response_style: data.response_style || "balanced",
                temperature: data.temperature !== undefined ? data.temperature : 0.7,
                max_tokens: data.max_tokens !== undefined ? data.max_tokens : 1024,
                auto_scroll: data.auto_scroll !== undefined ? data.auto_scroll : true,
                typewriter_animation: data.typewriter_animation !== undefined ? data.typewriter_animation : true,
                show_analytics: data.show_analytics !== undefined ? data.show_analytics : true,
                render_markdown: data.render_markdown !== undefined ? data.render_markdown : true,
                code_highlighting: data.code_highlighting !== undefined ? data.code_highlighting : true,
                theme: data.theme || "dark",
                font_size: data.font_size !== undefined ? data.font_size : 16,
                compact_mode: data.compact_mode !== undefined ? data.compact_mode : false,
                sidebar_collapsed: data.sidebar_collapsed !== undefined ? data.sidebar_collapsed : false,
            });
        } catch (error) {
            setNotification({ type: "error", message: error.message || "Failed to load preferences." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreferences();
    }, []);

    // Save preferences function (PUT /preferences)
    const handleSave = async () => {
        try {
            setSaving(true);
            setNotification(null);
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/preferences", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(preferences),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to save preferences.");
            }

            const updatedData = await response.json();
            setPreferences(updatedData);
            setNotification({ type: "success", message: "Preferences saved successfully!" });

            // Notify parent dashboard component to apply changes immediately
            if (onSaveSuccess) {
                onSaveSuccess(updatedData);
            }

            // Close the modal after showing the success message briefly
            setTimeout(() => {
                onClose();
            }, 400);
            
        } catch (error) {
            setNotification({ type: "error", message: error.message || "Failed to save preferences." });
        } finally {
            setSaving(false);
        }
    };

    // Design System Values mapped based on current theme preference (so the modal itself matches the dashboard)
    const isLight = preferences.theme === "light";
    const colors = {
        overlay: "rgba(0, 0, 0, 0.65)",
        modalBg: isLight ? "#ffffff" : "#171717",
        border: isLight ? "#e5e7eb" : "#2f2f2f",
        sidebarBg: isLight ? "#f9fafb" : "#121212",
        textPrimary: isLight ? "#111827" : "#f3f4f6",
        textSecondary: isLight ? "#4b5563" : "#9ca3af",
        inputBg: isLight ? "#f3f4f6" : "#212121",
        inputBorder: isLight ? "#d1d5db" : "#3a3a3a",
        tabHoverBg: isLight ? "#e5e7eb" : "#212121",
        tabActiveBg: isLight ? "#e5e7eb" : "#2f2f2f",
    };

    const styles = {
        overlay: {
            position: "fixed",
            inset: 0,
            backgroundColor: colors.overlay,
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5000,
            animation: "fadeIn 0.2s ease-out",
        },
        modal: {
            width: "740px",
            height: "560px",
            backgroundColor: colors.modalBg,
            borderRadius: "16px",
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)",
            overflow: "hidden",
            boxSizing: "border-box",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            maxWidth: "95vw",
            maxHeight: "90vh",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${colors.border}`,
        },
        title: {
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
        },
        closeButton: {
            background: "transparent",
            color: colors.textSecondary,
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            transition: "color 0.2s ease",
            padding: "4px 8px",
            borderRadius: "6px",
        },
        container: {
            display: "flex",
            flex: 1,
            overflow: "hidden",
            flexDirection: "row",
        },
        sidebar: {
            width: "200px",
            borderRight: `1px solid ${colors.border}`,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            backgroundColor: colors.sidebarBg,
            boxSizing: "border-box",
        },
        tabButton: (tabName) => {
            const isActive = activeTab === tabName;
            return {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isActive ? colors.tabActiveBg : "transparent",
                color: isActive ? colors.textPrimary : colors.textSecondary,
                fontSize: "14px",
                fontWeight: 500,
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.15s ease",
            };
        },
        content: {
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxSizing: "border-box",
        },
        sectionTitle: {
            margin: "0 0 4px 0",
            fontSize: "16px",
            fontWeight: 600,
        },
        sectionSubtitle: {
            margin: "0 0 16px 0",
            fontSize: "13px",
            color: colors.textSecondary,
        },
        field: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "14px",
        },
        label: {
            fontSize: "13.5px",
            fontWeight: 500,
            color: colors.textPrimary,
        },
        input: {
            background: colors.inputBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s ease",
        },
        select: {
            background: colors.inputBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "14px",
            outline: "none",
            cursor: "pointer",
            transition: "border-color 0.2s ease",
        },
        sliderContainer: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "4px",
        },
        slider: {
            flex: 1,
            cursor: "pointer",
            accentColor: "#10a37f",
        },
        sliderValue: {
            fontSize: "14px",
            fontWeight: 600,
            color: "#10a37f",
            minWidth: "30px",
            textAlign: "right",
        },
        toggleRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: `1px solid ${colors.border}`,
        },
        toggleInfo: {
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            paddingRight: "16px",
        },
        settingTitle: {
            color: colors.textPrimary,
            fontSize: "14px",
            fontWeight: 500,
        },
        settingDescription: {
            color: colors.textSecondary,
            fontSize: "12px",
            lineHeight: "1.4",
        },
        footer: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.sidebarBg,
        },
        notificationContainer: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            maxWidth: "350px",
        },
        cancelButton: {
            backgroundColor: "transparent",
            color: colors.textSecondary,
            border: `1px solid ${colors.inputBorder}`,
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
        },
        saveButton: {
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            opacity: saving ? 0.7 : 1,
        },
        spinner: {
            width: "16px",
            height: "16px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
        },
        skeletonLine: {
            height: "14px",
            backgroundColor: isLight ? "#e5e7eb" : "#2f2f2f",
            borderRadius: "4px",
            width: "100%",
            margin: "8px 0",
            animation: "pulse 1.5s infinite ease-in-out",
        }
    };

    if (loading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>⚙️ Preferences</h2>
                        <button style={styles.closeButton} onClick={onClose}>✕</button>
                    </div>
                    <div style={styles.container}>
                        <div style={styles.sidebar}>
                            <div style={{ ...styles.skeletonLine, width: "80%" }} />
                            <div style={{ ...styles.skeletonLine, width: "90%" }} />
                            <div style={{ ...styles.skeletonLine, width: "70%" }} />
                        </div>
                        <div style={styles.content}>
                            <div style={{ ...styles.skeletonLine, height: "24px", width: "40%", marginBottom: "16px" }} />
                            <div style={styles.skeletonLine} />
                            <div style={{ ...styles.skeletonLine, width: "85%" }} />
                            <div style={styles.skeletonLine} />
                            <div style={{ ...styles.skeletonLine, width: "90%" }} />
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes pulse {
                        0% { opacity: 0.6; }
                        50% { opacity: 0.3; }
                        100% { opacity: 0.6; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>⚙️ Preferences</h2>
                    <button style={styles.closeButton} onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Main Container */}
                <div style={styles.container}>
                    {/* Sidebar Tabs */}
                    <div style={styles.sidebar}>
                        <button
                            style={styles.tabButton("ai")}
                            onClick={() => setActiveTab("ai")}
                        >
                            🤖 AI Settings
                        </button>
                        <button
                            style={styles.tabButton("chat")}
                            onClick={() => setActiveTab("chat")}
                        >
                            💬 Chat Settings
                        </button>
                        <button
                            style={styles.tabButton("appearance")}
                            onClick={() => setActiveTab("appearance")}
                        >
                            🎨 Appearance
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div style={styles.content}>
                        {activeTab === "ai" && (
                            <div>
                                <h3 style={styles.sectionTitle}>🤖 AI Orchestration Settings</h3>
                                <p style={styles.sectionSubtitle}>Configure default models, providers and inference parameters.</p>

                                <div style={styles.field}>
                                    <label style={styles.label}>Preferred Provider</label>
                                    <select
                                        value={preferences.preferred_provider}
                                        onChange={(e) =>
                                            setPreferences({
                                                ...preferences,
                                                preferred_provider: e.target.value,
                                                preferred_model:
                                                    MODEL_OPTIONS[e.target.value]?.[0]?.value || "",
                                            })
                                        }
                                        style={styles.select}
                                    >
                                        <option value="groq">Groq</option>
                                        <option value="gemini">Gemini</option>
                                    </select>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Preferred Model</label>
                                    <select
                                        value={preferences.preferred_model}
                                        onChange={(e) =>
                                            setPreferences({
                                                ...preferences,
                                                preferred_model: e.target.value,
                                            })
                                        }
                                        style={styles.select}
                                    >
                                        <option value="">Select a model</option>
                                        {(MODEL_OPTIONS[preferences.preferred_provider] || []).map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Response Style</label>
                                    <select
                                        value={preferences.response_style}
                                        onChange={(e) =>
                                            setPreferences({
                                                ...preferences,
                                                response_style: e.target.value,
                                            })
                                        }
                                        style={styles.select}
                                    >
                                        <option value="balanced">Balanced</option>
                                        <option value="creative">Creative</option>
                                        <option value="precise">Precise</option>
                                    </select>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Temperature ({preferences.temperature})</label>
                                    <div style={styles.sliderContainer}>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={preferences.temperature}
                                            onChange={(e) =>
                                                setPreferences({
                                                    ...preferences,
                                                    temperature: parseFloat(e.target.value),
                                                })
                                            }
                                            style={styles.slider}
                                        />
                                        <span style={styles.sliderValue}>{preferences.temperature.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Max Tokens</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="8192"
                                        value={preferences.max_tokens}
                                        onChange={(e) =>
                                            setPreferences({
                                                ...preferences,
                                                max_tokens: parseInt(e.target.value) || 1024,
                                            })
                                        }
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "chat" && (
                            <div>
                                <h3 style={styles.sectionTitle}>💬 Chat Interface Settings</h3>
                                <p style={styles.sectionSubtitle}>Customize interaction behaviors and parsing controls.</p>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Auto Scroll</div>
                                        <div style={styles.settingDescription}>Automatically scroll down on incoming assistant messages.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.auto_scroll}
                                        onChange={(val) => setPreferences({ ...preferences, auto_scroll: val })}
                                    />
                                </div>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Typewriter Animation</div>
                                        <div style={styles.settingDescription}>Render text letter-by-letter to simulate real-time generation.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.typewriter_animation}
                                        onChange={(val) => setPreferences({ ...preferences, typewriter_animation: val })}
                                    />
                                </div>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Show Analytics</div>
                                        <div style={styles.settingDescription}>Display prompt latencies, token counts, and provider details.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.show_analytics}
                                        onChange={(val) => setPreferences({ ...preferences, show_analytics: val })}
                                    />
                                </div>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Render Markdown</div>
                                        <div style={styles.settingDescription}>Parse headings, bold text, lists, and formatting patterns.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.render_markdown}
                                        onChange={(val) => setPreferences({ ...preferences, render_markdown: val })}
                                    />
                                </div>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Code Highlighting</div>
                                        <div style={styles.settingDescription}>Apply colors and dark theme highlighting inside code structures.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.code_highlighting}
                                        onChange={(val) => setPreferences({ ...preferences, code_highlighting: val })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "appearance" && (
                            <div>
                                <h3 style={styles.sectionTitle}>🎨 Appearance Settings</h3>
                                <p style={styles.sectionSubtitle}>Modify theme palettes and layouts to fit your working setup.</p>

                                <div style={styles.field}>
                                    <label style={styles.label}>Theme</label>
                                    <select
                                        value={preferences.theme}
                                        onChange={(e) =>
                                            setPreferences({
                                                ...preferences,
                                                theme: e.target.value,
                                            })
                                        }
                                        style={styles.select}
                                    >
                                        <option value="dark">Dark Theme</option>
                                        <option value="light">Light Theme</option>
                                    </select>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Font Size</label>
                                    <select
                                        value={preferences.font_size}
                                        onChange={(e) =>
                                            setPreferences({
                                                ...preferences,
                                                font_size: parseInt(e.target.value),
                                            })
                                        }
                                        style={styles.select}
                                    >
                                        <option value="14">Small (14px)</option>
                                        <option value="16">Medium (16px)</option>
                                        <option value="18">Large (18px)</option>
                                        <option value="20">Extra Large (20px)</option>
                                    </select>
                                </div>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Compact Mode</div>
                                        <div style={styles.settingDescription}>Reduce gap heights and bubble padding to maximize screen density.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.compact_mode}
                                        onChange={(val) => setPreferences({ ...preferences, compact_mode: val })}
                                    />
                                </div>

                                <div style={styles.toggleRow}>
                                    <div style={styles.toggleInfo}>
                                        <div style={styles.settingTitle}>Sidebar Collapsed</div>
                                        <div style={styles.settingDescription}>Automatically collapse the chat history sidebar by default.</div>
                                    </div>
                                    <Toggle
                                        checked={preferences.sidebar_collapsed}
                                        onChange={(val) => setPreferences({ ...preferences, sidebar_collapsed: val })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    {/* Status notifications inside the footer */}
                    <div style={styles.notificationContainer}>
                        {notification && (
                            <div
                                style={{
                                    color: notification.type === "success" ? "#10b981" : "#ef4444",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {notification.type === "success" ? "✓" : "⚠"} {notification.message}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button style={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                            {saving && <div style={styles.spinner} />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default PreferencesModal;