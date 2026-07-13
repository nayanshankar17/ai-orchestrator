import { useState, useEffect } from "react";

function PreferencesModal({ onClose }) {

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

    };

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

                    {/* AI Settings */}

                    {/* Chat Settings */}

                    {/* Appearance */}

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
                    >
                        Save Changes
                    </button>

                </div>

            </div>
        </div>
    );
}

export default PreferencesModal;