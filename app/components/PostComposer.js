"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import Confetti from "./Confetti";

const MAX_CHARS = 500;

export default function PostComposer({ onPostCreated }) {
  const { user, token } = useAuth();
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null); // base64 data URL
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shaking, setShaking] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const charCount = text.length;
  const isEmpty = text.trim().length === 0 && !media;

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setMedia(ev.target.result);
      setMediaPreview(ev.target.result);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function removeMedia() {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleConfettiDone = useCallback(() => {
    setShowConfetti(false);
  }, []);

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
        body: JSON.stringify({
          text: text.trim(),
          media: media || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.blocked) {
        setBlocked(data.moderation);
        setError(data.error);
        // Shake + flash animation
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      // Success! Fire confetti
      setText("");
      removeMedia();
      setShowConfetti(true);
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
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-primary)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
          Sign in to create posts, like, and comment
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Use the Sign in button in the header
        </p>
      </div>
    );
  }

  return (
    <>
      <Confetti active={showConfetti} onDone={handleConfettiDone} />
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`${shaking ? "shake flash-red" : ""}`}
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-primary)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Author display */}
        <div
          style={{
            fontSize: "14px",
            color: "var(--text-tertiary)",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {user.displayName}
          </span>
          <span style={{ color: "var(--text-muted)" }}>&middot;</span>
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
            border: "1px solid var(--border-input)",
            borderRadius: "10px",
            fontSize: "15px",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-input)",
            outline: "none",
            resize: "vertical",
            minHeight: "80px",
            fontFamily: "inherit",
            lineHeight: 1.5,
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--text-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-input)")}
        />

        {/* Media preview */}
        {mediaPreview && (
          <div style={{ position: "relative", marginTop: "10px" }}>
            <img
              src={mediaPreview}
              alt="Upload preview"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "1px solid var(--border-primary)",
              }}
            />
            <button
              type="button"
              onClick={removeMedia}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        )}

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
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#991B1B" }}>
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
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid var(--border-input)",
                backgroundColor: "var(--bg-input)",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              title="Attach image"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>

            <span
              style={{
                fontSize: "13px",
                color: charCount > MAX_CHARS * 0.9 ? "#EF4444" : "var(--text-muted)",
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
              backgroundColor: isEmpty || loading ? "var(--btn-disabled-bg)" : "var(--btn-primary-bg)",
              color: isEmpty || loading ? "var(--btn-disabled-text)" : "var(--btn-primary-text)",
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
    </>
  );
}
