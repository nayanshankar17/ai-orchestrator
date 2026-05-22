import { useState , useRef } from "react";

// these import re for markdown rendering, they maintain bold, italic, bullets etc
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter";
import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";

import "./App.css";

export default function App() {
 
  // Store the current prompt input by the user
  const [prompt, setPrompt] = useState("");

  // Store the last prompt to allow regenerating responses without needing to re-enter the prompt
  const [lastPrompt, setLastPrompt] = useState("");

  const [displayedResponses, setDisplayedResponses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // the avoid the issue of stubmled response: suppose the app is generating the response, but if i click the generate button again, the responses get stumbled
  const animationIntervals = useRef([]);

  // Store responses from all providers
  const [responses, setResponses] = useState([]);

  // Loading state for the main generate button
  const [loading, setLoading] = useState(false);

  // For regenerating specific provider response, Tracks WHICH provider is currently regenerating. This allows us to show a loading state on the specific provider card while it's regenerating, without affecting the others.
  const [regeneratingProvider, setRegeneratingProvider] = useState(null);

  // Store selected providers for smart routing
  const [selectedProviders, setSelectedProviders] = useState([]);

  //chat states
  const [chatHistory, setChatHistory] = useState([]);

  const toggleProvider = (provider) => {

    setSelectedProviders((prev) => {

      if (prev.includes(provider)) {
        return prev.filter((item) => item !== provider);
      }

      return [...prev, provider];
    });
  };


  const featureCards = [
    {
      icon: "✨",
      title: "Gemini",
    },
    {
      icon: "⚡",
      title: "Groq",
    },
  ];

  const sendPrompt = async () => {
    setLastPrompt(prompt);
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        // "http://127.0.0.1:8000/orchestrate",
        "https://ai-orchestrator-i4w5.onrender.com/orchestrate",
        
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            prompt: prompt,

            providers:
              selectedProviders.length > 0
                ? selectedProviders.map(
                    (provider) => provider.toLowerCase()
                  )
                : [],
          }),

        }
      );

      const data = await response.json();

      setResponses(data.responses);

      setDisplayedResponses(
        data.responses.map((item) => ({
          ...item,
          response: "",
        }))
      );

      animateResponses(data.responses);
      
      // chats added as stack LIFO
      setChatHistory((prev) => [
        {
          prompt: prompt,
          responses: data.responses,
        },
        ...prev,
      ]);

    }

    catch (error) {

      console.log(error);

      const errorResponse = [
        {
          provider: "System",
          response: "Provider unavailable. Please try again.",
          status: "error",
          time: "--",
        },
      ];

      setResponses(errorResponse);
      setDisplayedResponses(errorResponse);
    }

    setLoading(false);
  };
  
  const animateResponses = (responsesData) => {

    animationIntervals.current.forEach(
      clearInterval
    );

    animationIntervals.current = [];

    responsesData.forEach((item, index) => {

      let currentText = "";

      let i = 0;

      const interval = setInterval(() => {

        if (i < item.response.length) {

          currentText += item.response[i];

          setDisplayedResponses((prev) => {

            const updated = [...prev];

            updated[index] = {

              ...updated[index],

              response: currentText,
            };

            return updated;
          });

          i++;

        } else {

          clearInterval(interval);
        }

      }, 5);
      animationIntervals.current.push(interval);
    });
  };
  const getStatusColor = (status) => {

    if (status === "success") {
      return "#22c55e";
    }

    if (status === "error") {
      return "#ef4444";
    }

    return "#facc15";
  };

  const copyResponse = async (text) => {

    try {

      await navigator.clipboard.writeText(text);

      alert("Response copied successfully!");

    } catch (error) {

      console.log(error);
    }
  };

  // Regenerate response for a specific provider
  const regenerateResponse = async (provider) => {

    try {

      setRegeneratingProvider(provider); // Set the currently regenerating provider to show loading state on that specific card

      const response = await fetch(
        
        "https://ai-orchestrator-i4w5.onrender.com/orchestrate",
        
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            prompt: lastPrompt || prompt,

            providers: [provider.toLowerCase().includes("gemini") ? "gemini" : "groq"],
          }),
        }
      );

      const data = await response.json(); // We expect the backend to return an array with a single response for the requested provider

      const updatedResponse = data.responses[0]; // Extract the updated response for the specific provider

      setResponses((prev) =>

        prev.map((item) =>

          item.provider === provider
            ? updatedResponse
            : item
        )
      );

      // Update displayed responses and trigger the typing animation for just this provider
      setDisplayedResponses((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((item) => item.provider === provider);
        if (index !== -1) {
          updated[index] = {
            ...updatedResponse,
            response: "",
          };

          let currentText = "";
          let i = 0;
          const interval = setInterval(() => {
            if (i < updatedResponse.response.length) {
              currentText += updatedResponse.response[i];
              setDisplayedResponses((prevDisp) => {
                const innerUpdated = [...prevDisp];
                innerUpdated[index] = {
                  ...innerUpdated[index],
                  response: currentText,
                };
                return innerUpdated;
              });
              i++;
            } else {
              clearInterval(interval);
            }
          }, 5);
          animationIntervals.current.push(interval);
        }
        return updated;
      });

    }

    catch (error) {

      console.log(error);

      const errorResponse = {
        provider: provider,
        response: "Provider unavailable. Please try again.",
        latency: "--",
        token_count: 0,
        status: "error",
      };

      setResponses((prev) =>
        prev.map((item) =>
          item.provider === provider ? errorResponse : item
        )
      );

      setDisplayedResponses((prev) =>
        prev.map((item) =>
          item.provider === provider ? errorResponse : item
        )
      );
    }

    finally {

      setRegeneratingProvider(null);
    }
  };


  return (
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          ☰
        </button>
        <h1 className="mobile-title">AI Orchestrator</h1>
        <div style={{ width: "40px" }} /> {/* Spacer to align title */}
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar - Chat History */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Chat History</h2>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            onClick={() => {
              setResponses(chat.responses);
              setDisplayedResponses(chat.responses);
              setIsSidebarOpen(false); // Auto-close drawer on mobile selection
            }}
            className="history-card"
          >
            <p className="history-prompt-text">
              {chat.prompt}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Desktop Header */}
        <div className="header-container">
          <h1 className="header-title">AI Orchestrator</h1>
          <p className="header-subtitle">
            Compare responses from multiple AI models side-by-side.
          </p>
        </div>

        {/* Prompt Console */}
        <div className="prompt-container">
          <textarea
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything..."
            className="prompt-textarea"
          />

          {/* Provider Selection */}
          <div className="providers-list">
            {featureCards.map((card, index) => (
              <div
                key={index}
                className={`provider-pill ${
                  selectedProviders.includes(card.title) ? "selected" : "unselected"
                }`}
                onClick={() => toggleProvider(card.title)}
              >
                {card.icon} {card.title}
              </div>
            ))}
          </div>

          {/* Generate Button Container */}
          <div className="action-bar">
            <button
              onClick={sendPrompt}
              disabled={loading || !prompt.trim()}
              className="generate-btn"
            >
              {loading ? "Generating..." : "Generate Responses"}
            </button>
          </div>
        </div>

        {/* Response Grid */}
        <div className="response-grid">
          {displayedResponses.map((item, index) => (
            <div key={index} className="response-card">
              {/* Card Top Section */}
              <div className="card-header">
                <div className="provider-info">
                  <h2>{item.provider}</h2>
                  <p className="provider-meta">Latency: {item.latency}</p>
                  <p className="provider-meta">Tokens: {item.token_count}</p>
                </div>

                {/* Status Badge */}
                <div className="status-indicator">
                  <div
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  />
                  <span>{item.status}</span>
                </div>
              </div>

              {/* Response Markdown Area */}
              <div className="response-area">
                <ReactMarkdown
                  components={{
                    code(props) {
                      const { children, className } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    },
                  }}
                >
                  {item.response}
                </ReactMarkdown>
              </div>

              {/* Action Buttons */}
              <div className="card-footer-actions">
                <button
                  onClick={() => copyResponse(item.response)}
                  className="card-action-btn"
                >
                  Copy
                </button>

                <button
                  onClick={() => regenerateResponse(item.provider)}
                  className="card-action-btn"
                  disabled={regeneratingProvider !== null}
                >
                  {regeneratingProvider === item.provider ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

