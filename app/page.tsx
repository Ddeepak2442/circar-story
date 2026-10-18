import FloatingHearts from "@/components/FloatingHearts";
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import Milestone from "@/components/Milestone";
import Gallery from "@/components/Gallery";
import LoveLetter from "@/components/LoveLetter";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/store";
import { siteContent } from "@/lib/content";

// Content (reasons + photos) is admin-editable and stored in Blob storage,
// so this page always renders the latest saved version.
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();

  const photos =
    content.photos.length > 0
      ? content.photos.map((p) => ({ src: p.url, caption: p.caption }))
      : siteContent.gallery.photos;

  return (
    <>
      <FloatingHearts />
      <Reveal>
        <main>
          <Hero />
          <Milestone reasons={content.reasons} />
          <Gallery photos={photos} />
          <LoveLetter />
        </main>
        <Footer />
      </Reveal>
    </>
  );
}
