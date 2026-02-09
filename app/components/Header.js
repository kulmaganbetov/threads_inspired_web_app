"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import LoginModal from "./LoginModal";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(250, 250, 250, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #EFEFEF",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="14" cy="14" r="13" stroke="#0A0A0A" strokeWidth="2" />
              <path
                d="M9 10.5C9 9.67 9.67 9 10.5 9H17.5C18.33 9 19 9.67 19 10.5V17.5C19 18.33 18.33 19 17.5 19H10.5C9.67 19 9 18.33 9 17.5V10.5Z"
                stroke="#0A0A0A"
                strokeWidth="1.5"
              />
              <circle cx="14" cy="14" r="2.5" fill="#0A0A0A" />
            </svg>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#0A0A0A",
              }}
            >
              SafeThreads
            </span>
          </a>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#999",
                backgroundColor: "#F0F0F0",
                padding: "4px 8px",
                borderRadius: "6px",
                fontWeight: 500,
                display: "none",
              }}
              className="badge-desktop"
            >
              ML Demo
            </span>

            {!loading && (
              <>
                {user ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {/* Profile link */}
                    <a
                      href="/profile"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#0A0A0A",
                        textDecoration: "none",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F0F0F0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.displayName}
                      </span>
                    </a>

                    {/* Logout */}
                    <button
                      onClick={logout}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E5E5E5",
                        backgroundColor: "#fff",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#666",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#999";
                        e.currentTarget.style.color = "#0A0A0A";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E5E5E5";
                        e.currentTarget.style.color = "#666";
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#0A0A0A",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.85";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Sign in
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
