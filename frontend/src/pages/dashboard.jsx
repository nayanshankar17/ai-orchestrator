import { useState , useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// these import re for markdown rendering, they maintain bold, italic, bullets etc
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "./dashboard.css";

function Dashboard() {  

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

  // state to store the message of a particualr session in order tot display them 
  const [messages, setMessages] = useState([]); 

  // navigation hook from react-router-dom to navigate programmatically
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/", {replace: true }); // Navigate to login page and replace history to prevent going back
  };

  const [sessions, setSessions] = useState([]); // Store all chat sessions
  const [activeSession, setActiveSession] = useState(null); // Store the currently active session to display its chat history and responses
  const [showSessionModal, setShowSessionModal] = useState(false); // State to control the visibility of the session management modal
  const [sessionTitle, setSessionTitle] = useState(""); // State to hold the title input when creating a new session or renaming an existing one

  useEffect(() => {fetchSessions();}, []); // Fetch chat sessions on component mount

  // Function to fetch chat sessions from the backend and store them in state
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/session/list", //backend url for fetching chat sessions
        {
          headers: {
            Authorization: `Bearer ${token}`,// Include the access token in the Authorization header for authentication
          },
        }
      );

      // Check if the response is successful, if not throw an error
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json(); // Wait for the response and parse it as JSON
      setSessions(data); // Store the fetched sessions in state
    }
    catch (error) {
      console.log(error);
    }
  };


  // function to fetch messages of a session from backend and strore them in a state
  const loadSessionMessages = async (sessionId) => {

    try {
      
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }
      const data = await response.json();
      console.log(data); // display messages in console (for testing)
      setMessages(data); // store the fetched data into the state
    }
    catch (error) {
      console.log(error);
    }
  };


  // function to save user and assistant messages into the backend database, so that they can be retrieved later
  const saveMessage = async (
  role,
  provider,
  content,
  latency,
  tokenCount,
  status) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/session/${activeSession}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role,
            provider,
            content,
            latency,
            token_count: tokenCount,
            status,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save message");
      }
    }
    catch (error) {
      console.log(error);
    }
  };


  // Function to create a new chat session by calling the backend API and then refreshing the session list
  const createSession = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/session/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: sessionTitle.trim(), // Send the session title from state, trimming whitespace
          }),
        }
      );
      if (!response.ok) {
        throw new Error(
          "Failed to create session"
        );
      }
      setSessionTitle(""); // Clear the session title input after creating the session
      setShowSessionModal(false); // Close the session creation modal
      await fetchSessions(); // Refresh the session list after creating a new session
    }
    catch (error) {
      console.log(error);
    }
  };

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

  // Function to send the user's prompt to the backend for processing and handle the responses from multiple providers
  const sendPrompt = async () => {

    //if no prompt exists
    setLastPrompt(prompt);
    if (!prompt.trim()) {
      return;
    }
    setLoading(true);

    try {

      // fetches the ai response from the backend
      const response = await fetch(
        "http://127.0.0.1:8000/orchestrate",
        // "https://ai-orchestrator-i4w5.onrender.com/orchestrate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
            providers:
              selectedProviders.length > 0 ? selectedProviders.map((provider) => provider.toLowerCase()) : [],
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


      // Save the user's prompt message to the db for the active session
      await saveMessage(
          "user",
          null,
          prompt,
          null,
          null,
          null
      );


      // save the ai's response to the db for the active session
      for (const item of data.responses) {
        await saveMessage(
            "assistant",
            item.provider,
            item.response,
            parseFloat(item.latency),
            item.token_count,
            item.status
        );
      }

      await loadSessionMessages(activeSession); // Refresh the messages for the active session after saving the new messages

      animateResponses(data.responses); // Trigger the typing animation for the responses from all providers
      
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
  
  // Function to animate the typing effect for each provider's response
  const animateResponses = (responsesData) => {
    animationIntervals.current.forEach(clearInterval); // Clear any existing intervals to prevent overlapping animations
    animationIntervals.current = []; // Reset the intervals array for the new animations
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

  // Function to determine the color of the status indicator based on the response status
  const getStatusColor = (status) => {
    if (status === "success") {
      return "#22c55e";
    }
    if (status === "error") {
      return "#ef4444";
    }
    return "#facc15";
  };


  // Function to copy a provider's response to the clipboard and alert the user upon success or log an error if it fails
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
        "http://127.0.0.1:8000/orchestrate",
        // "https://ai-orchestrator-i4w5.onrender.com/orchestrate",

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
        <button
          onClick={() => setShowSessionModal(true)} // Open the session management modal to create a new chat session
          className="generate-btn"
          style={{
            marginBottom: "15px",
          }}
        >
          + New Chat
        </button>
        <h2 className="sidebar-title">Chat History</h2>
        {sessions.map((session) => (
          <div
            key={session.id}
            className="history-card"
            onClick={() => {
              setActiveSession(session.id);
              loadSessionMessages(session.id);
            }}
          >
            <p className="history-prompt-text">
              {session.title}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          backgroundColor: "#dc2626",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>
      <button onClick={() => navigate("/preferences")}>Preferences</button>
      
      {/* Main Content Area */}
      <div className="main-content">
        {/* Desktop Header */}
        {/* <div className="header-container">
          <h1 className="header-title">AI Orchestrator</h1>
          <p className="header-subtitle">
            Compare responses from multiple AI models side-by-side.
          </p>
        </div> */}

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
              disabled={
                loading ||
                !prompt.trim() || 
                !activeSession
              }
              className="generate-btn"
            >
              {
                !activeSession
                  ? "Select a Session"
                  : loading
                  ? "Generating..."
                  : "Generate Responses"
              }
            </button>
          </div>
        </div>

        {/* Messages Display */}
        <div style={{ marginBottom: "30px" }}>

          {messages.map((message) => (

            <div
              key={message.id}
              style={{
                background:
                  message.role === "user"
                    ? "#1e3a8a"
                    : "#1e293b",
                color: "white",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            >

              <strong>
                {message.role === "user"
                  ? "You"
                  : "Assistant"}
              </strong>

              <p>{message.content}</p>

            </div>

          ))}

        </div>

        {/* Responses Display */}
        <div className="chat-window">

            {messages.map((message) => (

                <div
                    key={message.id}
                    className={
                        message.role === "user"
                            ? "user-container"
                            : "assistant-container"
                    }
                >

                    <div className="message-author">

                        {
                            message.role === "user"
                                ? "You"
                                : `🤖 ${message.provider}`
                        }

                    </div>

                    <div className="message-body">

                        <ReactMarkdown
                            components={{
                                code(props) {
                                    const { children, className } = props;

                                    const match =
                                        /language-(\w+)/.exec(className || "");

                                    return match ? (

                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                        >
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>

                                    ) : (

                                        <code className={className}>
                                            {children}
                                        </code>

                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>

                    </div>

                    {
                        message.role === "assistant" && (

                            <div className="message-meta">

                                ⏱ {message.latency}s

                                •

                                🪙 {message.token_count} tokens

                                •

                                {
                                    message.status === "success"
                                        ? "🟢 Success"
                                        : "🔴 Failed"
                                }

                            </div>

                        )
                    }

                </div>

            ))}

        </div>


      </div>

    {/* Session Modal */}
    {
      showSessionModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >

          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "25px",
              borderRadius: "12px",
              width: "350px",
            }}
          >

            <h2
              style={{
                color: "white",
                marginBottom: "15px",
              }}
            >
              Create New Session
            </h2>

            <input
              type="text"
              value={sessionTitle}
              onChange={(e) =>
                setSessionTitle(e.target.value)
              }
              placeholder="Enter session name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                marginBottom: "20px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >

              <button
                onClick={createSession}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Create
              </button>

              <button
                onClick={() => {
                  setShowSessionModal(false);
                  setSessionTitle("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#475569",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )
    }


    </div>
  );
}

export default Dashboard;