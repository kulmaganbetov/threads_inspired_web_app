"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { ThemeProvider } from "../components/ThemeContext";
import Header from "../components/Header";
import PostCard from "../components/PostCard";

function ProfileContent() {
  const { user, token, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProfile();
    else setLoading(false);
  }, [token, fetchProfile]);

  if (authLoading || loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Not signed in
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-tertiary)", marginBottom: "20px" }}>
          Sign in to view your profile
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: "10px",
            backgroundColor: "var(--btn-primary-bg)",
            color: "var(--btn-primary-text)",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to feed
        </a>
      </div>
    );
  }

  const { stats, posts } = profile || { stats: {}, posts: [] };

  function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 65%)`;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px 16px 40px",
      }}
    >
      {/* Profile card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-primary)",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: avatarColor(user.displayName),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "24px",
              flexShrink: 0,
            }}
          >
            {user.displayName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {user.displayName}
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                margin: "2px 0 0 0",
              }}
            >
              @{user.username}
            </p>
          </div>
        </div>

        {user.bio && (
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              marginBottom: "20px",
            }}
          >
            {user.bio}
          </p>
        )}

        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
          Joined{" "}
          {new Date(user.joinedAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-divider)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {stats.postsCount || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Posts
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {stats.likesReceived || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Likes
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {stats.commentsReceived || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Comments
            </div>
          </div>
        </div>
      </div>

      {/* User's posts */}
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}
      >
        Your posts
      </h2>

      {posts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--text-muted)",
            fontSize: "14px",
            backgroundColor: "var(--bg-card)",
            borderRadius: "16px",
            border: "1px solid var(--border-primary)",
          }}
        >
          You haven&apos;t posted anything yet.{" "}
          <a
            href="/"
            style={{
              color: "var(--text-primary)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Go to feed
          </a>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} onUpdate={fetchProfile} animDelay={i * 60} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header />
          <main style={{ flex: 1 }}>
            <ProfileContent />
          </main>
          <footer
            style={{
              textAlign: "center",
              padding: "20px",
              borderTop: "1px solid var(--border-divider)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            SafeThreads &mdash; Mock ML Content Moderation Demo &middot; Built
            with Next.js
          </footer>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
