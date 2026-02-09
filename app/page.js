import Feed from "./components/Feed";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
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
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Logo mark */}
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
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "#999",
              backgroundColor: "#F0F0F0",
              padding: "4px 10px",
              borderRadius: "8px",
              fontWeight: 500,
            }}
          >
            ML Moderation Demo
          </span>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "20px 16px 40px",
        }}
      >
        <Feed />
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          borderTop: "1px solid #EFEFEF",
          fontSize: "12px",
          color: "#999",
        }}
      >
        SafeThreads &mdash; Mock ML Content Moderation Demo &middot; Built with
        Next.js
      </footer>
    </div>
  );
}
