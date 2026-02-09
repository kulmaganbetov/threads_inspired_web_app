"use client";

import { AuthProvider } from "./components/AuthContext";
import Header from "./components/Header";
import Feed from "./components/Feed";

export default function Home() {
  return (
    <AuthProvider>
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <main style={{ flex: 1, padding: "20px 16px 40px" }}>
          <Feed />
        </main>

        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            borderTop: "1px solid #EFEFEF",
            fontSize: "12px",
            color: "#999",
          }}
        >
          SafeThreads &mdash; Mock ML Content Moderation Demo &middot; Built
          with Next.js
        </footer>
      </div>
    </AuthProvider>
  );
}
