"use client";

import { useState, useEffect, useCallback } from "react";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <PostComposer onPostCreated={fetchPosts} />

      <div
        style={{
          height: "1px",
          backgroundColor: "#EFEFEF",
          margin: "4px 0",
        }}
      />

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#999",
            fontSize: "14px",
          }}
        >
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#999",
            fontSize: "14px",
          }}
        >
          No posts yet. Be the first to share something!
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
