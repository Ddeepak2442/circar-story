"use client";

import { motion } from "framer-motion";
import { siteContent } from "@/lib/content";

export default function Milestone({ reasons }: { reasons: string[] }) {
  const { milestone } = siteContent;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose font-display text-3xl font-bold text-white shadow-lg shadow-rose/30">
          {reasons.length}
        </span>
        <h2 className="mt-6 font-display text-3xl text-plum sm:text-4xl">
          {milestone.heading}
        </h2>
        <p className="mt-3 font-body text-plum/70">{milestone.intro}</p>
      </motion.div>

      <ol className="mt-12 space-y-4">
        {reasons.map((reason, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
            className="flex items-start gap-4 rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-sm"
          >
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-lilac font-display text-sm font-semibold text-rose-deep">
              {i + 1}
            </span>
            <p className="font-body text-plum/85">{reason}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
