"use client";

// Fixed (non-random) values so server and client render identically —
// avoids hydration mismatches while still looking nicely scattered.
const HEARTS = [
  { left: "4%", size: 18, delay: 0, duration: 14, opacity: 0.5, symbol: "♥" },
  { left: "14%", size: 12, delay: 3, duration: 11, opacity: 0.4, symbol: "✿" },
  { left: "24%", size: 22, delay: 6, duration: 16, opacity: 0.55, symbol: "♥" },
  { left: "35%", size: 10, delay: 1.5, duration: 10, opacity: 0.35, symbol: "✿" },
  { left: "46%", size: 16, delay: 8, duration: 13, opacity: 0.5, symbol: "♥" },
  { left: "58%", size: 14, delay: 2.5, duration: 15, opacity: 0.4, symbol: "✿" },
  { left: "68%", size: 20, delay: 5, duration: 12, opacity: 0.5, symbol: "♥" },
  { left: "78%", size: 11, delay: 9, duration: 14, opacity: 0.4, symbol: "✿" },
  { left: "88%", size: 18, delay: 4, duration: 17, opacity: 0.45, symbol: "♥" },
  { left: "94%", size: 13, delay: 7, duration: 11, opacity: 0.4, symbol: "✿" },
];

export default function FloatingHearts() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className="floating-heart text-rose"
          style={{
            left: h.left,
            fontSize: h.size,
            opacity: h.opacity,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          {h.symbol}
        </span>
      ))}
    </div>
  );
}
