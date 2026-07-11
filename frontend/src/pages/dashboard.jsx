import { useState , useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// these import re for markdown rendering, they maintain bold, italic, bullets etc
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function Dashboard() {  

  // Store the current prompt input by the user
  const [prompt, setPrompt] = useState("");

  // Store the last prompt to allow regenerating responses without needing to re-enter the prompt
  const [lastPrompt, setLastPrompt] = useState("");

  const [displayedResponses, setDisplayedResponses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // the avoid the issue of stubmled response: suppose the app is generating the response, but if i click the generate button again, the responses get stumbled
  const animationIntervals = useRef([]);
  const messagesEndRef = useRef(null);

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

  // Responsive & Interactive states
  const [isMobile, setIsMobile] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [hoveredHamburger, setHoveredHamburger] = useState(false);
  const [hoveredNewChat, setHoveredNewChat] = useState(false);
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [hoveredProvider, setHoveredProvider] = useState(null);
  const [hoveredGenerate, setHoveredGenerate] = useState(false);
  const [hoveredLogout, setHoveredLogout] = useState(false);
  const [hoveredPreferences, setHoveredPreferences] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSession]);

  const styles = {
    appContainer: {
      display: "flex",
      height: "100dvh",
      overflow: "hidden",
      backgroundColor: "#212121",
      color: "#ececec",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      flexDirection: isMobile ? "column" : "row",
    },
    sidebar: {
      width: "260px",
      height: "100dvh",
      backgroundColor: "#171717",
      borderRight: "1px solid #2f2f2f",
      padding: "16px 12px 12px 12px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box",
      flexShrink: 0,
      zIndex: 100,
      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      ...(isMobile ? {
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        height: "100dvh",
        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
        boxShadow: "10px 0 30px rgba(0, 0, 0, 0.6)",
      } : {}),
    },
    sidebarOverlay: {
      display: isMobile ? "block" : "none",
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(4px)",
      zIndex: 90,
      opacity: isSidebarOpen ? 1 : 0,
      pointerEvents: isSidebarOpen ? "auto" : "none",
      transition: "opacity 0.3s ease",
    },
    sidebarSessionList: {
      flex: 1,
      overflowY: "auto",
      marginTop: "16px",
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    sidebarBottom: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      borderTop: "1px solid #2f2f2f",
      paddingTop: "12px",
    },
    mainContent: {
      flex: 1,
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#212121",
      overflow: "hidden",
      position: "relative",
    },
    mobileTopbar: {
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      backgroundColor: "#171717",
      borderBottom: "1px solid #2f2f2f",
      position: "sticky",
      top: 0,
      zIndex: 50,
      width: "100%",
      boxSizing: "border-box",
    },
    hamburgerBtn: {
      background: "none",
      border: "none",
      color: "white",
      fontSize: "24px",
      cursor: "pointer",
      padding: "6px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      transition: "background-color 0.2s",
      backgroundColor: hoveredHamburger ? "#2f2f2f" : "transparent",
    },
    mobileTitle: {
      fontSize: "16px",
      fontWeight: 600,
      margin: 0,
      color: "#ececec",
    },
    sidebarTitle: {
      marginTop: "8px",
      marginBottom: "8px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#676767",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    newChatBtn: (isHovered) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #424242",
      backgroundColor: isHovered ? "#2f2f2f" : "transparent",
      color: "white",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
      gap: "8px",
    }),
    historyCard: (sessionId) => ({
      padding: "10px 12px",
      backgroundColor: activeSession === sessionId ? "#2f2f2f" : (hoveredSessionId === sessionId ? "#212121" : "transparent"),
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.15s ease",
    }),
    historyPromptText: {
      margin: 0,
      color: "#ececec",
      fontSize: "13.5px",
      lineHeight: 1.4,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flex: 1,
    },
    preferencesBtn: (isHovered) => ({
      padding: "10px 12px",
      borderRadius: "8px",
      backgroundColor: isHovered ? "#2f2f2f" : "transparent",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "13.5px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      width: "100%",
      boxSizing: "border-box",
    }),
    logoutBtn: (isHovered) => ({
      padding: "10px 12px",
      borderRadius: "8px",
      backgroundColor: isHovered ? "#2f2f2f" : "transparent",
      color: "#f87171",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "13.5px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      width: "100%",
      boxSizing: "border-box",
    }),
    chatWrapper: {
      flex: 1,
      overflowY: "auto",
      width: "100%",
      WebkitOverflowScrolling: "touch",
      textAlign: "left",
    },
    conversationContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "768px",
      margin: "0 auto",
      padding: isMobile ? "24px 16px 160px 16px" : "40px 24px 160px 24px",
      boxSizing: "border-box",
    },
    userMessageWrapper: {
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
      marginBottom: "24px",
    },
    userMessageBubble: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      padding: "10px 16px",
      borderRadius: "20px",
      borderBottomRightRadius: "4px",
      maxWidth: "70%",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      fontSize: "15px",
      lineHeight: 1.5,
      wordBreak: "break-word",
      textAlign: "left",
    },
    assistantMessageWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "100%",
      marginBottom: "32px",
    },
    assistantHeader: (provider) => {
      const isGemini = provider?.toLowerCase().includes("gemini");
      const isGroq = provider?.toLowerCase().includes("groq");
      return {
        fontSize: "15px",
        fontWeight: 600,
        color: isGemini ? "#60a5fa" : (isGroq ? "#4ade80" : "#ffffff"),
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "8px",
      };
    },
    assistantBody: {
      color: "#ececec",
      fontSize: "15px",
      lineHeight: 1.6,
      width: "100%",
      wordBreak: "break-word",
      textAlign: "left",
    },
    assistantMeta: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#b4b4b4",
      fontSize: "12px",
      marginTop: "12px",
      borderTop: "1px solid #2f2f2f",
      paddingTop: "8px",
      width: "100%",
    },
    bottomInputOuter: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: "linear-gradient(180deg, rgba(33,33,33,0) 0%, #212121 40%)",
      padding: isMobile ? "16px 12px 24px 12px" : "24px 24px 36px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: 10,
      boxSizing: "border-box",
    },
    bottomInputInner: {
      width: "100%",
      maxWidth: "768px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    providersList: {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      width: "100%",
    },
    providerPill: (title) => {
      const isSelected = selectedProviders.includes(title);
      const isHovered = hoveredProvider === title;
      return {
        padding: "6px 12px",
        borderRadius: "16px",
        border: "1px solid " + (isSelected ? "#ffffff" : "#424242"),
        backgroundColor: isSelected ? "#ffffff" : (isHovered ? "#2e2e2e" : "transparent"),
        color: isSelected ? "#000000" : "#b4b4b4",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s ease",
      };
    },
    promptInputContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#2f2f2f",
      borderRadius: "24px",
      border: isTextareaFocused ? "1px solid #676767" : "1px solid #424242",
      padding: "6px 12px",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: isTextareaFocused ? "0 0 0 1px rgba(255, 255, 255, 0.1)" : "none",
    },
    promptTextarea: {
      flex: 1,
      background: "none",
      border: "none",
      color: "white",
      fontSize: "15px",
      outline: "none",
      resize: "none",
      padding: "8px 12px",
      fontFamily: "inherit",
      lineHeight: 1.5,
      maxHeight: "200px",
    },
    sendBtn: (isHovered, isDisabled) => ({
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: isDisabled ? "transparent" : "#ffffff",
      color: isDisabled ? "#676767" : "#000000",
      border: "none",
      cursor: isDisabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
      padding: 0,
      opacity: isDisabled ? 0.4 : 1,
    })
  };

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
  const loadSessionMessages = async (sessionId, currentMessages = []) => {

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

      // Find new messages that weren't in the state before
      const oldMessageIds = new Set(currentMessages.map(m => m.id));
      const newMessages = data.filter(m => !oldMessageIds.has(m.id));

      // We only animate if currentMessages was not empty AND we have new assistant messages.
      const shouldAnimate = currentMessages.length > 0 && newMessages.some(m => m.role === "assistant");

      if (shouldAnimate) {
        // Initialize state to include old messages, new user message, and new assistant messages with empty text
        const initializedMessages = data.map(m => {
          if (!oldMessageIds.has(m.id) && m.role === "assistant") {
            return { ...m, content: "" }; // start with empty content for new assistant responses
          }
          return m;
        });
        setMessages(initializedMessages);

        // Animate each new assistant message character by character
        newMessages.forEach(newMsg => {
          if (newMsg.role !== "assistant") return;

          let currentText = "";
          let charIndex = 0;
          const interval = setInterval(() => {
            if (charIndex < newMsg.content.length) {
              currentText += newMsg.content[charIndex];
              setMessages(prev => prev.map(m => {
                if (m.id === newMsg.id) {
                  return { ...m, content: currentText };
                }
                return m;
              }));
              charIndex++;
            } else {
              clearInterval(interval);
            }
          }, 10); // speed of typing (10ms per char)
          animationIntervals.current.push(interval);
        });
      } else {
        setMessages(data); // store the fetched data directly into state (switch session or history load)
      }
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
            title: sessionTitle.trim() || "Session", // Send the session title from state, defaulting to "Session" if empty
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
    setPrompt(""); // Clear the input field immediately
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

      await loadSessionMessages(activeSession, messages); // Refresh the messages for the active session after saving the new messages
      
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
    <div style={styles.appContainer}>
      {/* Mobile Topbar */}
      <div style={styles.mobileTopbar}>
        <button
          style={styles.hamburgerBtn}
          onClick={() => setIsSidebarOpen(true)}
          onMouseEnter={() => setHoveredHamburger(true)}
          onMouseLeave={() => setHoveredHamburger(false)}
        >
          ☰
        </button>
        <h1 style={styles.mobileTitle}>AI Orchestrator</h1>
        <div style={{ width: "40px" }} /> {/* Spacer to align title */}
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div 
        style={styles.sidebarOverlay}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar - Chat History */}
      <div style={styles.sidebar}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <button
            onClick={() => setShowSessionModal(true)} // Open the session management modal to create a new chat session
            style={styles.newChatBtn(hoveredNewChat)}
            onMouseEnter={() => setHoveredNewChat(true)}
            onMouseLeave={() => setHoveredNewChat(false)}
          >
            + New Chat
          </button>
          <h2 style={styles.sidebarTitle}>Chat History</h2>
          <div style={styles.sidebarSessionList}>
            {sessions.map((session) => (
              <div
                key={session.id}
                style={styles.historyCard(session.id)}
                onClick={() => {
                  setActiveSession(session.id);
                  loadSessionMessages(session.id);
                  setIsSidebarOpen(false); // Close sidebar on mobile after choosing a session
                }}
                onMouseEnter={() => setHoveredSessionId(session.id)}
                onMouseLeave={() => setHoveredSessionId(null)}
              >
                <p style={styles.historyPromptText}>
                  {session.title}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.sidebarBottom}>
          <button 
            onClick={() => navigate("/preferences")}
            onMouseEnter={() => setHoveredPreferences(true)}
            onMouseLeave={() => setHoveredPreferences(false)}
            style={styles.preferencesBtn(hoveredPreferences)}
          >
            ⚙️ Preferences
          </button>
          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            style={styles.logoutBtn(hoveredLogout)}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        
        {/* Scrollable Conversation wrapper */}
        <div style={styles.chatWrapper}>
          <div style={styles.conversationContainer}>
            {messages.map((message) => {
              const isUser = message.role === "user";
              if (isUser) {
                return (
                  <div key={message.id} style={styles.userMessageWrapper}>
                    <div style={styles.userMessageBubble}>
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
                  </div>
                );
              } else {
                const providerBrand = message.provider || "Assistant";
                const isGemini = providerBrand.toLowerCase().includes("gemini");
                const providerIcon = isGemini ? "🟢" : "⚡";
                return (
                  <div key={message.id} style={styles.assistantMessageWrapper}>
                    <div style={styles.assistantHeader(providerBrand)}>
                      {providerIcon} {providerBrand}
                    </div>
                    <div style={styles.assistantBody}>
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
                    <div style={styles.assistantMeta}>
                      <span>⏱ {message.latency} s</span>
                      <span>•</span>
                      <span>🪙 {message.token_count} tokens</span>
                      <span>•</span>
                      <span>
                        {message.status === "success" ? "🟢 Success" : "🔴 Failed"}
                      </span>
                    </div>
                  </div>
                );
              }
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Input Area */}
        <div style={styles.bottomInputOuter}>
          <div style={styles.bottomInputInner}>
            {/* Provider Selection */}
            <div style={styles.providersList}>
              {featureCards.map((card, index) => {
                return (
                  <div
                    key={index}
                    style={styles.providerPill(card.title)}
                    onClick={() => toggleProvider(card.title)}
                    onMouseEnter={() => setHoveredProvider(card.title)}
                    onMouseLeave={() => setHoveredProvider(null)}
                  >
                    {card.title.toLowerCase().includes("gemini") ? "🟢" : "⚡"} {card.title}
                  </div>
                );
              })}
            </div>

            {/* Prompt Input */}
            <div style={styles.promptInputContainer}>
              <textarea
                rows="1"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                placeholder="Ask anything..."
                style={styles.promptTextarea}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim() && activeSession && !loading) {
                      sendPrompt();
                    }
                  }
                }}
              />
              <button
                onClick={sendPrompt}
                disabled={loading || !prompt.trim() || !activeSession}
                style={styles.sendBtn(hoveredGenerate, loading || !prompt.trim() || !activeSession)}
                onMouseEnter={() => setHoveredGenerate(true)}
                onMouseLeave={() => setHoveredGenerate(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Session Modal */}
      {showSessionModal && (
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
              backgroundColor: "#171717",
              padding: "25px",
              borderRadius: "16px",
              width: "350px",
              border: "1px solid #2f2f2f",
            }}
          >
            <h2
              style={{
                color: "#ececec",
                marginBottom: "15px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Create New Session
            </h2>

            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #424242",
                backgroundColor: "#212121",
                color: "white",
                marginBottom: "20px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={createSession}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: "pointer",
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
                  backgroundColor: "#424242",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;