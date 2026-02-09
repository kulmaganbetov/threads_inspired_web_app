"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * LoginModal — overlay modal for demo login.
 * Shows available demo accounts for easy testing.
 */
export default function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password || loading) return;

    setLoading(true);
    setError("");

    try {
      await login(username, password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(u, p) {
    setUsername(u);
    setPassword(p);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "4px",
            color: "#0A0A0A",
          }}
        >
          Sign in
        </h2>
        <p style={{ fontSize: "14px", color: "#999", marginBottom: "24px" }}>
          Use a demo account to explore SafeThreads
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #E5E5E5",
              borderRadius: "10px",
              fontSize: "15px",
              color: "#1A1A1A",
              backgroundColor: "#FAFAFA",
              outline: "none",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0A0A0A")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #E5E5E5",
              borderRadius: "10px",
              fontSize: "15px",
              color: "#1A1A1A",
              backgroundColor: "#FAFAFA",
              outline: "none",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0A0A0A")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
          />

          {error && (
            <p
              style={{
                fontSize: "13px",
                color: "#EF4444",
                marginBottom: "12px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!username || !password || loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor:
                !username || !password || loading ? "#E5E5E5" : "#0A0A0A",
              color: !username || !password || loading ? "#999" : "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor:
                !username || !password || loading ? "default" : "pointer",
              marginBottom: "20px",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Quick login buttons */}
        <div
          style={{
            borderTop: "1px solid #F0F0F0",
            paddingTop: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#999",
              marginBottom: "10px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Demo accounts
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {[
              { u: "demo", p: "password", name: "Demo User" },
              { u: "alice", p: "alice123", name: "Alice Johnson" },
              { u: "bob", p: "bob123", name: "Bob Smith" },
            ].map((acct) => (
              <button
                key={acct.u}
                type="button"
                onClick={() => quickLogin(acct.u, acct.p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #E5E5E5",
                  backgroundColor:
                    username === acct.u ? "#F5F5F5" : "#FAFAFA",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1A1A1A",
                  }}
                >
                  {acct.name}
                </span>
                <span style={{ fontSize: "12px", color: "#999" }}>
                  {acct.u} / {acct.p}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
