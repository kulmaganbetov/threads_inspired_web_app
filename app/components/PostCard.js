"use client";

import ModerationBadge from "./ModerationBadge";

/**
 * PostCard — renders a single post in the feed with author info,
 * text content, timestamp, and the moderation classification badge.
 */

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

// Deterministic pastel color from name string
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 65%)`;
}

export default function PostCard({ post }) {
  const { text, author, createdAt, moderation } = post;

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
      {/* Header: avatar + name + time */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "15px",
                color: "#0A0A0A",
              }}
            >
              {author}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#999",
              }}
            >
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <ModerationBadge
          label={moderation.label}
          confidence={moderation.confidence}
        />
      </div>
    </article>
  );
}
