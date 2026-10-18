import { siteContent } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="mt-8 mb-16 flex flex-col items-center gap-2 px-6 text-center">
      <span aria-hidden className="text-2xl text-rose">
        ♥
      </span>
      <p className="font-body text-sm text-plum/60">{siteContent.footer.line}</p>
    </footer>
  );
}
