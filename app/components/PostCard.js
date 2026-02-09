"use client";

import { useState, useRef } from "react";
import ModerationBadge from "./ModerationBadge";
import { useAuth } from "./AuthContext";

const EMOJI_MAP = {
  heart: { icon: "\u2764\uFE0F", label: "Love" },
  fire: { icon: "\uD83D\uDD25", label: "Fire" },
  laugh: { icon: "\uD83D\uDE02", label: "Haha" },
  sad: { icon: "\uD83D\uDE22", label: "Sad" },
  rocket: { icon: "\uD83D\uDE80", label: "Rocket" },
  clap: { icon: "\uD83D\uDC4F", label: "Clap" },
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
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
  return `hsl(${Math.abs(hash) % 360}, 55%, 65%)`;
}

function countReactions(reactions) {
  const counts = {};
  for (const emoji of Object.values(reactions || {})) {
    counts[emoji] = (counts[emoji] || 0) + 1;
  }
  return counts;
}

export default function PostCard({ post, onUpdate, animDelay = 0 }) {
  const { user, token } = useAuth();
  const {
    text, author, createdAt, moderation,
    likes = [], reactions = {}, comments = [], media,
  } = post;

  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [particles, setParticles] = useState([]);
  const [lightbox, setLightbox] = useState(false);
  const likeBtnRef = useRef(null);

  const isLiked = user ? likes.includes(user.id) : false;
  const myReaction = user ? reactions[user.id] : null;
  const reactionCounts = countReactions(reactions);

  function spawnParticles() {
    const emoji = myReaction ? EMOJI_MAP[myReaction]?.icon || "\u2764\uFE0F" : "\u2764\uFE0F";
    const np = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: -10 + Math.random() * 20,
      emoji,
    }));
    setParticles(np);
    setTimeout(() => setParticles([]), 800);
  }

  async function handleLike() {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    if (!isLiked) {
      setHeartPop(true);
      spawnParticles();
      setTimeout(() => setHeartPop(false), 400);
    }
    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId: post.id }),
      });
      onUpdate?.();
    } catch { /* ignore */ } finally { setLikeLoading(false); }
  }

  async function handleReaction(emoji) {
    if (!user) return;
    setShowReactions(false);
    if (myReaction === emoji) {
      try {
        await fetch("/api/posts/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ postId: post.id, emoji }),
        });
        onUpdate?.();
      } catch { /* ignore */ }
      return;
    }
    setHeartPop(true);
    spawnParticles();
    setTimeout(() => setHeartPop(false), 400);
    try {
      await fetch("/api/posts/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId: post.id, emoji }),
      });
      onUpdate?.();
    } catch { /* ignore */ }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim() || commentLoading || !user) return;
    setCommentLoading(true);
    setCommentError("");
    try {
      const res = await fetch("/api/posts/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId: post.id, text: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCommentError(data.error || "Failed."); return; }
      setCommentText("");
      onUpdate?.();
    } catch { setCommentError("Something went wrong."); } finally { setCommentLoading(false); }
  }

  return (
    <article
      className="post-enter"
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--border-primary)",
        transition: "box-shadow 0.2s ease, background-color 0.3s ease",
        animationDelay: `${animDelay}ms`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: avatarColor(author), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>
          {avatarInitial(author)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{author}</span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{timeAgo(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      {text && (
        <p style={{ margin: "0 0 14px 0", fontSize: "15px", lineHeight: 1.55, color: "var(--text-secondary)", wordBreak: "break-word" }}>
          {text}
        </p>
      )}

      {/* Media */}
      {media && (
        <div style={{ marginBottom: "14px" }}>
          <img
            src={media}
            alt="Post media"
            onClick={() => setLightbox(true)}
            style={{
              width: "100%", maxHeight: "400px", objectFit: "cover",
              borderRadius: "12px", cursor: "pointer", transition: "transform 0.2s",
              border: "1px solid var(--border-primary)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        </div>
      )}

      {/* Moderation badge */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <ModerationBadge label={moderation.label} confidence={moderation.confidence} />
      </div>

      {/* Reaction summary bubbles */}
      {Object.keys(reactionCounts).length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <span
              key={emoji}
              className="emoji-pop"
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "3px 8px", borderRadius: "12px",
                backgroundColor: "var(--bg-hover)", fontSize: "13px",
                border: myReaction === emoji ? "1px solid var(--text-muted)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: "14px" }}>{EMOJI_MAP[emoji]?.icon}</span>
              <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "10px", borderTop: "1px solid var(--border-divider)", position: "relative" }}>
        <div style={{ position: "relative" }} ref={likeBtnRef}>
          <button
            onClick={handleLike}
            onContextMenu={(e) => { if (user) { e.preventDefault(); setShowReactions(!showReactions); } }}
            disabled={!user || likeLoading}
            className={heartPop ? "heart-pop" : ""}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none",
              cursor: user ? "pointer" : "default",
              padding: "6px 10px", borderRadius: "8px",
              transition: "background-color 0.15s",
              fontSize: "14px",
              color: isLiked ? "#EF4444" : "var(--text-tertiary)",
              fontWeight: isLiked ? 600 : 400,
            }}
            onMouseEnter={(e) => { if (user) e.currentTarget.style.backgroundColor = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            title={user ? "Click to like, right-click for reactions" : "Sign in to like"}
          >
            {myReaction ? (
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{EMOJI_MAP[myReaction]?.icon}</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "#EF4444" : "none"} stroke={isLiked ? "#EF4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
            {likes.length > 0 && <span>{likes.length}</span>}
          </button>

          {/* Floating particles */}
          {particles.map((p) => (
            <span key={p.id} className="heart-particle" style={{ left: `calc(50% + ${p.x}px)`, top: "-4px", fontSize: "14px" }}>
              {p.emoji}
            </span>
          ))}

          {/* Emoji picker */}
          {showReactions && (
            <div style={{
              position: "absolute", bottom: "100%", left: 0, marginBottom: "8px",
              padding: "6px 8px", backgroundColor: "var(--bg-card)",
              borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              border: "1px solid var(--border-primary)",
              display: "flex", gap: "4px", zIndex: 10,
            }}>
              {Object.entries(EMOJI_MAP).map(([key, { icon, label }]) => (
                <button
                  key={key}
                  onClick={() => handleReaction(key)}
                  title={label}
                  style={{
                    width: "36px", height: "36px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "50%", border: "none",
                    backgroundColor: myReaction === key ? "var(--bg-hover)" : "transparent",
                    cursor: "pointer", fontSize: "20px", transition: "transform 0.15s, background-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; e.currentTarget.style.backgroundColor = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; if (myReaction !== key) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", cursor: "pointer",
            padding: "6px 10px", borderRadius: "8px",
            transition: "background-color 0.15s", fontSize: "14px",
            color: showComments ? "var(--text-primary)" : "var(--text-tertiary)",
            fontWeight: showComments ? 600 : 400,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>

        {user && !showReactions && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto", opacity: 0.5 }}>
            right-click for reactions
          </span>
        )}
      </div>

      {showReactions && <div style={{ position: "fixed", inset: 0, zIndex: 5 }} onClick={() => setShowReactions(false)} />}

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop: "12px" }}>
          {comments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              {comments.map((c) => (
                <div key={c.id} style={{ padding: "10px 14px", backgroundColor: "var(--bg-input)", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: avatarColor(c.author), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "11px", flexShrink: 0 }}>
                      {avatarInitial(c.author)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{c.author}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.45, color: "var(--text-secondary)", paddingLeft: "32px" }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
          {user ? (
            <form onSubmit={handleComment} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <input
                type="text" placeholder="Write a comment..." value={commentText}
                onChange={(e) => { if (e.target.value.length <= 300) { setCommentText(e.target.value); if (commentError) setCommentError(""); } }}
                style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--border-input)", borderRadius: "10px", fontSize: "14px", color: "var(--text-secondary)", backgroundColor: "var(--bg-input)", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--text-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-input)")}
              />
              <button type="submit" disabled={!commentText.trim() || commentLoading}
                style={{
                  padding: "10px 16px", borderRadius: "10px", border: "none",
                  backgroundColor: !commentText.trim() || commentLoading ? "var(--btn-disabled-bg)" : "var(--btn-primary-bg)",
                  color: !commentText.trim() || commentLoading ? "var(--btn-disabled-text)" : "var(--btn-primary-text)",
                  fontSize: "13px", fontWeight: 600,
                  cursor: !commentText.trim() || commentLoading ? "default" : "pointer", flexShrink: 0,
                }}
              >
                {commentLoading ? "..." : "Reply"}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>Sign in to comment</p>
          )}
          {commentError && <p style={{ fontSize: "13px", color: "#EF4444", marginTop: "6px" }}>{commentError}</p>}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && media && (
        <div className="lightbox-enter" onClick={() => setLightbox(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: "20px" }}
        >
          <img src={media} alt="Full size" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }} />
        </div>
      )}
    </article>
  );
}
