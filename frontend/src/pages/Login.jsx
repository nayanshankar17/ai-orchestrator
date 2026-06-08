import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate(); // For navigation after login

  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input

  const [loading, setLoading] = useState(false); // State to indicate if login is in progress
  const [error, setError] = useState(""); // State to hold any error messages

  // On component mount, check if there's already a token in local storage. If there is, navigate to the dashboard.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard", {replace: true,});
    }
  }, []);

  // Function to handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login", //backend url for login router
        {
          method: "POST",

          // Send the login data as URL-encoded form data, because FastAPI's OAuth2PasswordRequestForm expects form data
          headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Set content type to URL-encoded for form data
          },

          // Send the login data as URL-encoded form data
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        }
      );

      const data = await response.json(); // wait for the response and parse it as JSON

      //if the response is absurd(not ok), throw an error with the message from the response or a default message
      if (!response.ok) {
        throw new Error(
          "Login failed"
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );
      
      navigate("/dashboard",{
        replace: true // Replace the current entry in the history stack, so that user cannot go back to login page using back button
      });
    }

    // If there's an error during login, catch it and set the error message
    catch (err) {
      setError(err.message);
    }

    // Always set loading to false after the attempt
    finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "30px",
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
      >

        <h2
          style={{
            color: "white",
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          AI Orchestrator
        </h2>

        <form onSubmit={handleLogin}>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                color: "white",
                display: "block",
                textAlign: "left",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "white",
                display: "block",
                textAlign: "left",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#ef4444",
                marginBottom: "15px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>

          <p
            style={{
              color: "#cbd5e1",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{
                color: "#60a5fa",
                cursor: "pointer",
              }}
            >
              Register
            </span>
          </p>

        </form>

      </div>
    </div>
  );
}