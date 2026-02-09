"use client";

import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import Header from "./components/Header";
import Feed from "./components/Feed";

export default function Home() {
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

          <main style={{ flex: 1, padding: "20px 16px 40px" }}>
            <Feed />
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
