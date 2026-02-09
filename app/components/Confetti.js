"use client";

import { useEffect, useState } from "react";

/**
 * Confetti — spawns animated confetti particles that rain down
 * from the top of the viewport. Auto-removes after animation.
 */

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F1948A", "#82E0AA",
];

const SHAPES = ["circle", "square", "strip"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ active, onDone }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    const count = 60;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(5, 95),
      delay: randomBetween(0, 0.4),
      duration: randomBetween(1.2, 2.5),
      size: randomBetween(6, 12),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, 360),
      rotationSpeed: randomBetween(200, 600),
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      drift: randomBetween(-30, 30),
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onDone?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [active, onDone]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => {
        const shapeStyle =
          p.shape === "circle"
            ? { borderRadius: "50%", width: p.size, height: p.size }
            : p.shape === "strip"
              ? { borderRadius: "2px", width: p.size * 0.4, height: p.size * 1.5 }
              : { borderRadius: "2px", width: p.size, height: p.size };

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: "-20px",
              backgroundColor: p.color,
              ...shapeStyle,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              transform: `rotate(${p.rotation}deg)`,
              "--drift": `${p.drift}px`,
              "--rotation-end": `${p.rotation + p.rotationSpeed}deg`,
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
}
