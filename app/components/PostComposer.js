"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

const MAX_CHARS = 500;

export default function PostComposer({ onPostCreated }) {
  const { user, token } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(null); // { label, confidence }

  const charCount = text.length;
  const isEmpty = text.trim().length === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (isEmpty || loading || !user) return;

    setLoading(true);
    setError("");
    setBlocked(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await res.json();

      if (res.status === 403 && data.blocked) {
        setBlocked(data.moderation);
        setError(data.error);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      setText("");
      onPostCreated?.();
    } catch (err) {
      if (!blocked) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          border: "1px solid #F0F0F0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", color: "#666", marginBottom: "4px" }}>
          Sign in to create posts, like, and comment
        </p>
        <p style={{ fontSize: "13px", color: "#999" }}>
          Use the Sign in button in the header
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid #F0F0F0",
      }}
    >
      {/* Author display */}
      <div
        style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontWeight: 600, color: "#0A0A0A" }}>
          {user.displayName}
        </span>
        <span style={{ color: "#ccc" }}>&middot;</span>
        <span>@{user.username}</span>
      </div>

      {/* Text area */}
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setText(e.target.value);
            if (blocked) setBlocked(null);
            if (error) setError("");
          }
        }}
        rows={3}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1px solid #E5E5E5",
          borderRadius: "10px",
          fontSize: "15px",
          color: "#1A1A1A",
          backgroundColor: "#FAFAFA",
          outline: "none",
          resize: "vertical",
          minHeight: "80px",
          fontFamily: "inherit",
          lineHeight: 1.5,
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#0A0A0A")}
        onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
      />

      {/* Blocked warning */}
      {blocked && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px 14px",
            borderRadius: "10px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#EF4444",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: "14px", fontWeight: 600, color: "#991B1B" }}
            >
              Content Blocked
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#991B1B", margin: 0 }}>
            Classified as <strong>{blocked.label}</strong> with{" "}
            {Math.round(blocked.confidence * 100)}% confidence. Please revise
            your post.
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "12px",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: charCount > MAX_CHARS * 0.9 ? "#EF4444" : "#999",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {charCount}/{MAX_CHARS}
          </span>
          {error && !blocked && (
            <span style={{ fontSize: "13px", color: "#EF4444" }}>{error}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isEmpty || loading}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: isEmpty || loading ? "#E5E5E5" : "#0A0A0A",
            color: isEmpty || loading ? "#999" : "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isEmpty || loading ? "default" : "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
