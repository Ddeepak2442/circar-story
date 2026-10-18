"use client";

import { motion } from "framer-motion";
import { siteContent } from "@/lib/content";

export type GalleryPhoto = { src: string; caption: string };

export default function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const { gallery } = siteContent;

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl text-plum sm:text-4xl">
          {gallery.heading}
        </h2>
        <p className="mt-3 font-body text-plum/70">{gallery.intro}</p>
      </motion.div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {photos.map((photo, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.08 }}
            className="group overflow-hidden rounded-2xl bg-white/50 shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.caption}
              className="aspect-square w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <figcaption className="px-3 py-2 text-center font-body text-xs text-plum/70 sm:text-sm">
              {photo.caption}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
