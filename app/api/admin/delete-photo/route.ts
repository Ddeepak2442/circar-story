import { del } from "@vercel/blob";
import { isAuthorized } from "@/lib/admin-auth";
import { getContent, saveContent } from "@/lib/store";

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url } = (body ?? {}) as { url?: unknown };
  if (typeof url !== "string" || !url) {
    return Response.json({ error: "`url` is required" }, { status: 400 });
  }

  try {
    const current = await getContent();
    const nextPhotos = current.photos.filter((p) => p.url !== url);
    await saveContent({ reasons: current.reasons, photos: nextPhotos });

    // Best-effort cleanup of the underlying file — don't fail the request
    // over it, the gallery entry is already gone either way.
    try {
      await del(url);
    } catch {
      // ignore
    }

    return Response.json({ reasons: current.reasons, photos: nextPhotos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    return Response.json({ error: message }, { status: 500 });
  }
}
