"use client";

import { useCallback, useState } from "react";
import confetti from "canvas-confetti";
import { siteContent } from "@/lib/content";

function EnvelopeIcon() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="8" y="24" width="80" height="56" rx="8" fill="#ffffff" stroke="#e8558d" strokeWidth="3" />
      <path d="M12 28L48 58L84 28" stroke="#e8558d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="20" r="12" fill="#e8558d" />
      <path
        d="M48 25c-3-3-8-2.6-8 1.2 0 3 4.5 5.6 8 8.8 3.5-3.2 8-5.8 8-8.8 0-3.8-5-4.2-8-1.2z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default function Reveal({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [popping, setPopping] = useState(false);

  const handleOpen = useCallback(() => {
    if (popping || opened) return;
    setPopping(true);

    const colors = ["#ffb8d9", "#dcc4ff", "#f0c987", "#ffe4ef", "#e8558d"];

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...opts,
        origin: { y: 0.6 },
        colors,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    window.setTimeout(() => setOpened(true), 650);
  }, [opened, popping]);

  return (
    <>
      {!opened && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-cream via-blush to-lilac px-6 text-center transition-opacity duration-700 ${
            popping ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className={popping ? "envelope-pop" : "animate-bob"}>
            <EnvelopeIcon />
          </div>
          <p className="max-w-xs font-display text-lg text-plum/80 sm:text-xl">
            {siteContent.envelope.label}
          </p>
          <button
            onClick={handleOpen}
            className="animate-soft-pulse rounded-full bg-rose px-8 py-3 font-body text-base font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-rose-deep"
          >
            {siteContent.envelope.button}
          </button>
        </div>
      )}
      <div className={opened ? "fade-in-up" : "invisible h-0 overflow-hidden"}>
        {children}
      </div>
    </>
  );
}
