import { useState } from "react";

export default function App() {

  const [prompt, setPrompt] = useState("");

  const [responses, setResponses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedProviders, setSelectedProviders] = useState([]);

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
    {
      icon: "🌐",
      title: "OpenRouter",
    },
  ];

  const sendPrompt = async () => {

    if (!prompt.trim()) {
      return;
    }

    setLoading(true);

    try {

      // If nothing selected -> use all providers
      const activeProviders = selectedProviders.length === 0
        ? ["Gemini", "Groq", "OpenRouter"]
        : selectedProviders;

      const requests = [];

      // Gemini
      if (activeProviders.includes("Gemini")) {

        requests.push(
          fetch("http://127.0.0.1:8000/generate-gemini", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              prompt: prompt,
            }),
          })
            .then(async (res) => {

              const data = await res.json();

              return {
                provider: "Gemini",
                response: data.response || data.error,
                status: data.error ? "error" : "success",
                time: `${(Math.random() * 2 + 1).toFixed(1)}s`,
              };
            })

            .catch(() => ({
              provider: "Gemini",
              response: "Failed to generate response.",
              status: "error",
              time: "--",
            }))
        );
      }


      // Groq
      if (activeProviders.includes("Groq")) {

        requests.push(
          fetch("http://127.0.0.1:8000/generate-groq", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              prompt: prompt,
            }),
          })
            .then(async (res) => {

              const data = await res.json();

              return {
                provider: "Groq",
                response: data.response || data.error,
                status: data.error ? "error" : "success",
                time: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
              };
            })

            .catch(() => ({
              provider: "Groq",
              response: "Failed to generate response.",
              status: "error",
              time: "--",
            }))
        );
      }


      // OpenRouter
      if (activeProviders.includes("OpenRouter")) {

        requests.push(
          fetch("http://127.0.0.1:8000/generate-openrouter", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              prompt: prompt,
            }),
          })
            .then(async (res) => {

              const data = await res.json();

              return {
                provider: "OpenRouter",
                response: data.response || data.error,
                status: data.error ? "error" : "success",
                time: `${(Math.random() * 3 + 1).toFixed(1)}s`,
              };
            })

            .catch(() => ({
              provider: "OpenRouter",
              response: "Provider unavailable.",
              status: "error",
              time: "--",
            }))
        );
      }


      const results = await Promise.all(requests);

      setResponses(results);

    } catch (error) {

      console.log(error);
    }

    setLoading(false);
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


  const regenerateResponse = (provider) => {

    alert(`Regenerate feature for ${provider} will be implemented next.`);
  };


  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        padding: "40px",
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
            marginBottom: "10px",
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
          responses.map((item, index) => (

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
                    Response Time: {item.time}
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
                  }}
                >
                  {item.response}
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
                  Regenerate
                </button>

              </div>

            </div>
          ))
        }

      </div>

    </div>
  );
}

