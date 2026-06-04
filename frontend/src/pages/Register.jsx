import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate(); // For navigation after registration

  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password input
  const [name, setName] = useState(""); // State for name input

  const [loading, setLoading] = useState(false); // State to indicate if registration is in progress
  const [error, setError] = useState(""); // State to hold any error messages



  // Function to handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if(password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    //backend integration
    try {
      const response = await fetch(
      "http://127.0.0.1:8000/auth/register", //backend url for registration router
        {
          method: "POST",

          // Send the registration data as JSON
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json(); // wait for the response and parse it as JSON

      //if the response is absurd(not ok), throw an error with the message from the response or a default message
      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed"
        );
      }
      alert("Account created successfully!");
      navigate("/");
    }

    // If there's an error during registration, catch it and set the error message
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

        <form onSubmit={handleRegister}>

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
              Name
            </label>

            <input
              type="name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter name"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
              }}
            />
          </div>

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
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Enter password again"
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
              ? "Registering..."
              : "Register"}
          </button>

          <p style={{
            color: "white",
            textAlign: "center",
            marginTop: "15px",
          }}>
            Already have an account?
            <span onClick={() => navigate("/")} style={{
              color: "#2563eb",
              marginLeft: "5px",
              cursor: "pointer",
            }}>
                Login
            </span>
          </p>

        </form>

      </div>
    </div>
  );
}