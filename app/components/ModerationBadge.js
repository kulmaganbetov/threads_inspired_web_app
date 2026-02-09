"use client";

/**
 * ModerationBadge — displays the classification label and confidence
 * with color coding per severity level.
 *
 * Red    → Hate speech, Extremism
 * Yellow → Cyberbullying, Fraud / Scam, Toxic language
 * Green  → Neutral
 */

const SEVERITY_COLORS = {
  "Hate speech": { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  Extremism: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  Cyberbullying: { bg: "#FEF9C3", text: "#854D0E", dot: "#EAB308" },
  "Fraud / Scam": { bg: "#FEF9C3", text: "#854D0E", dot: "#EAB308" },
  "Toxic language": { bg: "#FEF9C3", text: "#854D0E", dot: "#EAB308" },
  Neutral: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
};

export default function ModerationBadge({ label, confidence }) {
  const colors = SEVERITY_COLORS[label] || SEVERITY_COLORS.Neutral;
  const pct = Math.round(confidence * 100);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        lineHeight: 1.4,
        backgroundColor: colors.bg,
        color: colors.text,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: colors.dot,
          flexShrink: 0,
        }}
      />
      {label} &middot; {pct}%
    </span>
  );
}
