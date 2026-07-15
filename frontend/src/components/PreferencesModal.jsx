import { useState, useEffect } from "react";


// Toggle Component
function Toggle({ checked, onChange }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: "48px",
                height: "26px",
                borderRadius: "999px",
                backgroundColor: checked ? "#10a37f" : "#555",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.25s ease",
            }}
        >
            <div
                style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    position: "absolute",
                    top: "2px",
                    left: checked ? "24px" : "2px",
                    transition: "left 0.25s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
            />
        </div>
    );
}

// Preferences Modal Component (Main Component)
function PreferencesModal({ onClose }) {

    // Styles
    const styles = {
        overlay: {
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5000,
        },
        modal: {
            width: "700px",
            maxHeight: "85vh",
            overflowY: "auto",
            backgroundColor: "#171717",
            borderRadius: "18px",
            border: "1px solid #2f2f2f",
            color: "white",
            padding: "28px",
            boxSizing: "border-box",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            borderBottom: "1px solid #2f2f2f",
            paddingBottom: "15px",
        },
        body: {
            display: "flex",
            flexDirection: "column",
            gap: "28px",
        },
        footer: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "30px",
            borderTop: "1px solid #2f2f2f",
            paddingTop: "20px",
        },
        closeButton: {
            background: "transparent",
            color: "#aaa",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
        },
        cancelButton: {
            backgroundColor: "#2f2f2f",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
        },
        saveButton: {
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
        },
        section: {
            borderBottom: "1px solid #2f2f2f",
            paddingBottom: "24px",
        },
        sectionTitle: {
            marginBottom: "18px",
            fontSize: "18px",
        },
        field: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "18px",
        },
        input: {
            background: "#2b2b2b",
            color: "white",
            border: "1px solid #3a3a3a",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "14px",
        },
        select: {
            background: "#2b2b2b",
            color: "white",
            border: "1px solid #3a3a3a",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "14px",
        },
        toggleRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
            fontSize: "15px",
        },
        settingTitle: {
            color: "white",
            fontSize: "15px",
            fontWeight: 600,
            marginBottom: "4px",
        },

        settingDescription: {
            color: "#9ca3af",
            fontSize: "13px",
            lineHeight: "18px",
            maxWidth: "430px",
        },
    };
    
    // Default Preferences State
    const [preferences, setPreferences] = useState({
        preferred_provider: "gemini",
        preferred_model: "gemini-2.5-flash",
        response_style: "balanced",

        temperature: 0.7,
        max_tokens: 1024,

        auto_scroll: true,
        typewriter_animation: true,
        show_analytics: true,

        render_markdown: true,
        code_highlighting: true,

        theme: "dark",
        font_size: "medium",

        compact_mode: false,
        sidebar_collapsed: false,
    });
    
    // Loading State: this runs while we fetch preferences from the backend
    const [loading, setLoading] = useState(true);

    // Saving State
    const [saving, setSaving] = useState(false);

    
    // Func to fetch preferences from the backend
    const fetchPreferences = async () => {

        try {
            const token = localStorage.getItem("access_token"); // Retrieve the token from localStorage
            
            // Make the API call to fetch preferences
            const response = await fetch(
                "http://127.0.0.1:8000/preferences",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Check if the response is OK
            if (!response.ok) {
                throw new Error("Failed to fetch preferences");
            }
            const data = await response.json(); // Parse the JSON response
            setPreferences(data); // Update the preferences state with the fetched data

        } 

        catch (error) {
            console.error(error);
        } 
        
        finally {
            setLoading(false); // Set loading to false after the fetch attempt (whether successful or not)
        }
    };

    // Fetch preferences on component mount
    useEffect(() => {
        fetchPreferences();
    }, []);

    // Function to handle saving preferences
    const handleSave = async () => {
        console.log(preferences);

        // We'll implement PUT /preferences next.
    };

    if (loading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <h2>Loading Preferences...</h2>
                </div>
            </div>
        );
    }


    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                <div style={styles.header}>
                    <h2>⚙️ Preferences</h2>

                    <button
                        style={styles.closeButton}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div style={styles.body}>   
                    <div style={styles.section}>

                        <h3 style={styles.sectionTitle}>🤖 AI Settings</h3>

                        <div style={styles.field}>

                            <label>Preferred Provider</label>

                            <select
                                value={preferences.preferred_provider}
                                onChange={(e) =>
                                    setPreferences({
                                        ...preferences,
                                        preferred_provider: e.target.value,
                                    })
                                }
                                style={styles.select}
                            >
                                <option value="gemini">Gemini</option>
                                <option value="groq">Groq</option>
                            </select>

                        </div>

                        <div style={styles.field}>

                            <label>Preferred Model</label>

                            <input
                                type="text"
                                value={preferences.preferred_model}
                                onChange={(e) =>
                                    setPreferences({
                                        ...preferences,
                                        preferred_model: e.target.value,
                                    })
                                }
                                style={styles.input}
                            />

                        </div>

                        <div style={styles.field}>

                            <label>Response Style</label>

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

                    </div>


                    <div style={styles.section}>

                        <h3 style={styles.sectionTitle}>💬 Chat Settings</h3>

                        <div style={styles.settingRow}>
                            <div>
                                <div style={styles.settingTitle}>Auto Scroll</div>
                                <div style={styles.settingDescription}>
                                    Automatically scroll to the latest message.
                                </div>
                            </div>

                            <Toggle
                                checked={preferences.auto_scroll}
                                onChange={(value) =>
                                    setPreferences({
                                        ...preferences,
                                        auto_scroll: value,
                                    })
                                }
                            />
                        </div>

                        <div style={styles.settingRow}>
                            <div>
                                <div style={styles.settingTitle}>Typewriter Animation</div>
                                <div style={styles.settingDescription}>
                                    Animate AI responses while they are generated.
                                </div>
                            </div>

                            <Toggle
                                checked={preferences.typewriter_animation}
                                onChange={(value) =>
                                    setPreferences({
                                        ...preferences,
                                        typewriter_animation: value,
                                    })
                                }
                            />
                        </div>

                        <div style={styles.settingRow}>
                            <div>
                                <div style={styles.settingTitle}>Show Analytics</div>
                                <div style={styles.settingDescription}>
                                    Display latency, tokens and provider information.
                                </div>
                            </div>

                            <Toggle
                                checked={preferences.show_analytics}
                                onChange={(value) =>
                                    setPreferences({
                                        ...preferences,
                                        show_analytics: value,
                                    })
                                }
                            />
                        </div>

                        <div style={styles.settingRow}>
                            <div>
                                <div style={styles.settingTitle}>Render Markdown</div>
                                <div style={styles.settingDescription}>
                                    Render headings, tables, code blocks and formatting.
                                </div>
                            </div>

                            <Toggle
                                checked={preferences.render_markdown}
                                onChange={(value) =>
                                    setPreferences({
                                        ...preferences,
                                        render_markdown: value,
                                    })
                                }
                            />
                        </div>

                        <div style={styles.settingRow}>
                            <div>
                                <div style={styles.settingTitle}>Code Highlighting</div>
                                <div style={styles.settingDescription}>
                                    Highlight syntax inside code blocks.
                                </div>
                            </div>

                            <Toggle
                                checked={preferences.code_highlighting}
                                onChange={(value) =>
                                    setPreferences({
                                        ...preferences,
                                        code_highlighting: value,
                                    })
                                }
                            />
                        </div>

                    </div>


                </div>

                <div style={styles.footer}>
                    <button
                        style={styles.cancelButton}
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        style={styles.saveButton}
                        onClick={handleSave}
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );


}

export default PreferencesModal;