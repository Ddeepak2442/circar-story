import { siteContent } from "@/lib/content";

export default function Hero() {
  const { hero, herName } = siteContent;

  return (
    <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-rose-deep/70 fade-in-up">
        {hero.eyebrow}
      </p>
      <h2 className="font-script text-5xl text-rose sm:text-6xl md:text-7xl fade-in-up">
        {herName}
      </h2>
      <h1 className="mt-6 font-display text-3xl leading-tight text-plum sm:text-5xl md:text-6xl fade-in-up">
        Happy {hero.turningAge}
        <sup className="mx-1 align-super text-lg text-rose-deep sm:text-2xl">th</sup>
        Birthday
      </h1>
      <p className="mt-6 max-w-md font-body text-base text-plum/70 sm:text-lg fade-in-up">
        {hero.subheading}
      </p>
      <div aria-hidden className="mt-12 animate-bob text-3xl text-rose/70">
        ↓
      </div>
    </section>
  );
}
