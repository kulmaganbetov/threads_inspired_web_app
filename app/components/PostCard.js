"use client";

import { useState } from "react";
import ModerationBadge from "./ModerationBadge";
import { useAuth } from "./AuthContext";

function timeAgo(dateStr) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function avatarInitial(name) {
  return name?.charAt(0)?.toUpperCase() || "A";
}

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 65%)`;
}

export default function PostCard({ post, onUpdate }) {
  const { user, token } = useAuth();
  const { text, author, createdAt, moderation, likes = [], comments = [] } = post;

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);

  const isLiked = user ? likes.includes(user.id) : false;

  async function handleLike() {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id }),
      });
      if (res.ok) onUpdate?.();
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim() || commentLoading || !user) return;

    setCommentLoading(true);
    setCommentError("");

    try {
      const res = await fetch("/api/posts/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id, text: commentText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.error || "Failed to add comment.");
        return;
      }

      setCommentText("");
      setCommentError("");
      onUpdate?.();
    } catch {
      setCommentError("Something went wrong.");
    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <article
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid #F0F0F0",
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: avatarColor(author),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px",
            flexShrink: 0,
          }}
        >
          {avatarInitial(author)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "#0A0A0A" }}>
              {author}
            </span>
            <span style={{ fontSize: "13px", color: "#999" }}>
              {timeAgo(createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <p
        style={{
          margin: "0 0 14px 0",
          fontSize: "15px",
          lineHeight: 1.55,
          color: "#1A1A1A",
          wordBreak: "break-word",
        }}
      >
        {text}
      </p>

      {/* Moderation badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <ModerationBadge
          label={moderation.label}
          confidence={moderation.confidence}
        />
      </div>

      {/* Actions: Like + Comment toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          paddingTop: "10px",
          borderTop: "1px solid #F5F5F5",
        }}
      >
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={!user || likeLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: user ? "pointer" : "default",
            padding: "6px 10px",
            borderRadius: "8px",
            transition: "background-color 0.15s",
            fontSize: "14px",
            color: isLiked ? "#EF4444" : "#666",
            fontWeight: isLiked ? 600 : 400,
          }}
          onMouseEnter={(e) => {
            if (user) e.currentTarget.style.backgroundColor = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isLiked ? "#EF4444" : "none"}
            stroke={isLiked ? "#EF4444" : "#666"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likes.length > 0 && <span>{likes.length}</span>}
        </button>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "8px",
            transition: "background-color 0.15s",
            fontSize: "14px",
            color: showComments ? "#0A0A0A" : "#666",
            fontWeight: showComments ? 600 : 400,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={showComments ? "#0A0A0A" : "#666"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: "12px" }}>
          {/* Existing comments */}
          {comments.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "#FAFAFA",
                    borderRadius: "10px",
                    border: "1px solid #F0F0F0",
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
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: avatarColor(c.author),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "11px",
                        flexShrink: 0,
                      }}
                    >
                      {avatarInitial(c.author)}
                    </div>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#0A0A0A",
                      }}
                    >
                      {c.author}
                    </span>
                    <span style={{ fontSize: "12px", color: "#999" }}>
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.45,
                      color: "#333",
                      paddingLeft: "32px",
                    }}
                  >
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          {user ? (
            <form
              onSubmit={handleComment}
              style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setCommentText(e.target.value);
                    if (commentError) setCommentError("");
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid #E5E5E5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#1A1A1A",
                  backgroundColor: "#FAFAFA",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0A0A0A")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commentLoading}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor:
                    !commentText.trim() || commentLoading
                      ? "#E5E5E5"
                      : "#0A0A0A",
                  color:
                    !commentText.trim() || commentLoading ? "#999" : "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    !commentText.trim() || commentLoading
                      ? "default"
                      : "pointer",
                  flexShrink: 0,
                }}
              >
                {commentLoading ? "..." : "Reply"}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: "13px", color: "#999", textAlign: "center" }}>
              Sign in to comment
            </p>
          )}
          {commentError && (
            <p
              style={{
                fontSize: "13px",
                color: "#EF4444",
                marginTop: "6px",
              }}
            >
              {commentError}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
