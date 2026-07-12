// AI
// - Default Provider
// - Default Model

// Chat
// - Auto Scroll
// - Typewriter Animation
// - Show Analytics

// Appearance
// - Theme
// - Font Size

// Future
// - Streaming



import { useState } from "react";

export default function Preferences() {

  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [style, setStyle] = useState("");

  return (
    <div>
      <h1>Preferences</h1>
    </div>
  );
}