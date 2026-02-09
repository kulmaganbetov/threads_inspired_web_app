"use client";

import { useState } from "react";

/**
 * PostComposer — textarea + submit button for creating new posts.
 * Includes a character counter and an author name field.
 */

const MAX_CHARS = 500;

export default function PostComposer({ onPostCreated }) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = text.length;
  const isEmpty = text.trim().length === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (isEmpty || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          author: author.trim() || "Anonymous",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post.");
      }

      setText("");
      onPostCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      {/* Author input */}
      <input
        type="text"
        placeholder="Your name (optional)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        maxLength={50}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1px solid #E5E5E5",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#1A1A1A",
          backgroundColor: "#FAFAFA",
          outline: "none",
          marginBottom: "10px",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#0A0A0A")}
        onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
      />

      {/* Text area */}
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setText(e.target.value);
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

      {/* Footer: char count + error + submit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "12px",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <span
            style={{
              fontSize: "13px",
              color: charCount > MAX_CHARS * 0.9 ? "#EF4444" : "#999",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {charCount}/{MAX_CHARS}
          </span>
          {error && (
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
