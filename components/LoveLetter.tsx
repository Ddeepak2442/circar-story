"use client";

import { motion } from "framer-motion";
import { siteContent } from "@/lib/content";

export default function LoveLetter() {
  const { loveLetter, herName } = siteContent;

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl bg-white/70 p-8 shadow-xl shadow-rose/10 backdrop-blur-sm sm:p-12"
      >
        <h2 className="text-center font-display text-3xl text-plum sm:text-4xl">
          {loveLetter.heading}
        </h2>

        <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-plum/85 sm:text-lg">
          <p>Dear {herName},</p>
          {loveLetter.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mt-8 text-right font-script text-3xl text-rose">
          {loveLetter.signature}
        </p>
      </motion.div>
    </section>
  );
}
