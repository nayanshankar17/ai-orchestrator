import { useState , useRef } from "react";

// these import re for markdown rendering, they maintain bold, italic, bullets etc
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter";
import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";

export default function App() {
 
  // Store the current prompt input by the user
  const [prompt, setPrompt] = useState("");

  // Store the last prompt to allow regenerating responses without needing to re-enter the prompt
  const [lastPrompt, setLastPrompt] = useState("");

  const [displayedResponses, setDisplayedResponses] = useState([]);
  
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
    // {
    //   icon: "🤗",
    //   title: "Hugging Face",
    // },
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
        "https://ai-orchestrator-i4w5.onrender.com",
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

      setResponses([
        {
          provider: "System",
          response: "Backend connection failed.",
          status: "error",
          time: "--",
        },
      ]);
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
        // "http://127.0.0.1:8000/orchestrate",
        "https://ai-orchestrator-i4w5.onrender.com",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            prompt: prompt,

            providers: [provider.toLowerCase()],
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

    }

    catch (error) {

      console.log(error);
    }

    finally {

      setRegeneratingProvider(null);
    }
  };


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "15vw",
          height: "100vh",
          backgroundColor: "#0a0a0a",
          border: "none",
          borderRight: "1px solid #2E303A",
          padding: "20px",
          overflowY: "auto",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          <b>Chat History</b>
        </h2>
        {

          chatHistory.map((chat, index) => (

            <div

              key={index}

              onClick={() => {

                setResponses(chat.responses);

                setDisplayedResponses(
                  chat.responses
                );
              }}

              style={{

                padding: "14px",

                backgroundColor: "#1a1a1a",

                borderRadius: "12px",

                marginBottom: "12px",

                cursor: "pointer",

                border: "1px solid #2a2a2a",

                transition: "0.3s",
              }}
            >

              <p
                style={{
                  margin: 0,
                  color: "#ddd",
                  fontSize: "14px",
                }}
              >

                {chat.prompt.slice(0, 40)}...

              </p>

            </div>
          ))
        }

      </div>
      <div
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
          backgroundColor: "#0a0a0a",
          color: "white",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >

        {/* Header */}
        <div
          style={{
            marginBottom: "40px",
          }}
        >

          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
            }}
          >
            AI Orchestrator
          </h1>

          <p
            style={{
              color: "#888",
              fontSize: "18px",
            }}
          >
            Compare responses from multiple AI models side-by-side.
          </p>

        </div>


        {/* Prompt Container */}
        <div
          style={{
            backgroundColor: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "20px",
            padding: "25px",
            marginBottom: "40px",
          }}
        >

          <textarea

            rows="6"

            value={prompt}

            onChange={(e) => setPrompt(e.target.value)}

            placeholder="Ask anything..."

            style={{
              width: "100%",
              backgroundColor: "#1a1a1a",
              color: "white",
              border: "1px solid #333",
              borderRadius: "14px",
              padding: "18px",
              fontSize: "16px",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
            }}
          />


          {/* Provider Selection */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "20px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >

            {
              featureCards.map((card, index) => (

                <div

                  key={index}

                  style={{
                    backgroundColor: selectedProviders.includes(card.title)
                      ? "#ffffff"
                      : "#202020",
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: "1px solid #333",
                    transition: "0.3s",
                    cursor: "pointer",
                    color: selectedProviders.includes(card.title)
                      ? "black"
                      : "white",
                  }}

                  onClick={() => toggleProvider(card.title)}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2b2b2b";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#202020";
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  {card.icon} {card.title}
                </div>
              ))
            }

          </div>


          {/* Generate Button */} 
          <button

            onClick={sendPrompt}

            style={{
              backgroundColor: "white",
              color: "black",
              border: "none",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >

            {loading ? "Generating..." : "Generate Responses"}

          </button>

        </div>


        {/* Response Grid */}
        <div

          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "24px",
          }}
        >

          {
            displayedResponses.map((item, index) => (

              <div

                key={index}

                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #2a2a2a",
                  borderRadius: "20px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "420px",
                }}
              >

                {/* Top Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: 0,
                        marginBottom: "8px",
                        fontSize: "28px",
                      }}
                    >
                      {item.provider}
                    </h2>

                    <p
                      style={{
                        color: "#888",
                        margin: 0,
                      }}
                    >
                      Response Latency: {item.latency}
                    </p>
                    <p
                      style={{
                        color: "#888",
                        margin: 0,
                      }}
                    >
                      Tokens used: {item.token_count} tokens
                    </p>

                  </div>


                  {/* Status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >

                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(item.status),
                      }}
                    />

                    <span
                      style={{
                        color: "#aaa",
                      }}
                    >
                      {item.status}
                    </span>

                  </div>

                </div>


                {/* Response Area */}
                <div
                  style={{
                    backgroundColor: "#0f0f0f",
                    borderRadius: "16px",
                    border: "1px solid #2f2f2f",
                    padding: "20px",
                    flex: 1,
                    overflowY: "auto",
                    maxHeight: "320px",
                  }}
                >

                  <p
                    style={{
                      lineHeight: "1.8",
                      color: "#ddd",
                      whiteSpace: "pre-wrap",
                      textAlign: "left",
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        code(props) {
                          const {children,className} = props;
                          const match =
                            /language-(\w+)/.exec(
                              className || ""
                            );
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
                        }
                      }}
                    >

                      {item.response}

                    </ReactMarkdown>
                  </p>

                </div>


                {/* Footer Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px",
                  }}
                >

                  <button
                    onClick={() => copyResponse(item.response)}

                    style={{
                      flex: 1,
                      backgroundColor: "#222",
                      border: "1px solid #333",
                      color: "white",
                      padding: "12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}

                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#333";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}

                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#222";
                      e.currentTarget.style.transform = "translateY(0px)";
                    }}
                  >
                    Copy
                  </button>


                  <button
                    onClick={() => regenerateResponse(item.provider)}

                    style={{
                      flex: 1,
                      backgroundColor: "#222",
                      border: "1px solid #333",
                      color: "white",
                      padding: "12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}

                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#333";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}

                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#222";
                      e.currentTarget.style.transform = "translateY(0px)";
                    }}
                  >
                    { // Show loading state only on the card that is currently regenerating
                      regeneratingProvider === item.provider 
                        ? "Regenerating..." 
                        : "Regenerate"
                    }
                  </button>

                </div>

              </div>
            ))
          }

        </div>

      </div>
    </div>
  );
}

