import "server-only";
import { get, put } from "@vercel/blob";
import { siteContent } from "@/lib/content";

const CONTENT_KEY = "data/content.json";

export type StoredPhoto = { url: string; caption: string };
export type StoredContent = { reasons: string[]; photos: StoredPhoto[] };

// Used whenever Blob storage isn't configured yet (e.g. local dev without a
// Blob store, or the very first request before the admin has saved anything).
const DEFAULT_CONTENT: StoredContent = {
  reasons: siteContent.milestone.reasons,
  photos: [],
};

// Vercel Blob supports two auth styles depending on how the store was
// connected: a classic `BLOB_READ_WRITE_TOKEN`, or the newer OIDC-based
// setup (`BLOB_STORE_ID` + an auto-issued `VERCEL_OIDC_TOKEN`). Both are
// resolved automatically by the SDK itself, so rather than guessing which
// one is present, we just attempt the call and let it tell us if neither
// is configured.
function isBlobUnconfiguredError(err: unknown): boolean {
  return err instanceof Error && /no blob credentials found/i.test(err.message);
}

export async function getContent(): Promise<StoredContent> {
  try {
    const result = await get(CONTENT_KEY, { access: "public", useCache: false });
    if (!result || !result.stream) return DEFAULT_CONTENT;

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as Partial<StoredContent>;

    return {
      reasons:
        Array.isArray(parsed.reasons) && parsed.reasons.length > 0
          ? parsed.reasons.filter((r): r is string => typeof r === "string")
          : DEFAULT_CONTENT.reasons,
      photos: Array.isArray(parsed.photos)
        ? parsed.photos.filter(
            (p): p is StoredPhoto =>
              !!p && typeof p.url === "string" && typeof p.caption === "string"
          )
        : [],
    };
  } catch {
    // Nothing saved yet, or a transient error — fall back to defaults
    // rather than breaking the page.
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: StoredContent): Promise<void> {
  try {
    await put(CONTENT_KEY, JSON.stringify(content), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    if (isBlobUnconfiguredError(err)) {
      throw new Error(
        "Blob storage isn't configured yet. Add a Blob store to this project in the Vercel dashboard (Storage tab), redeploy, then try again."
      );
    }
    throw err;
  }
}

/** Merge partial updates (reasons and/or photos) into the currently stored content. */
export async function mergeContent(
  patch: Partial<StoredContent>
): Promise<StoredContent> {
  const current = await getContent();
  const next: StoredContent = {
    reasons: patch.reasons ?? current.reasons,
    photos: patch.photos ?? current.photos,
  };
  await saveContent(next);
  return next;
}
