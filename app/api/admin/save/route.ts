import { isAuthorized } from "@/lib/admin-auth";
import { mergeContent, type StoredPhoto } from "@/lib/store";

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

  const { reasons, photos } = (body ?? {}) as {
    reasons?: unknown;
    photos?: unknown;
  };

  const patch: { reasons?: string[]; photos?: StoredPhoto[] } = {};

  if (reasons !== undefined) {
    if (
      !Array.isArray(reasons) ||
      !reasons.every((r) => typeof r === "string")
    ) {
      return Response.json({ error: "`reasons` must be an array of strings" }, { status: 400 });
    }
    patch.reasons = reasons.map((r) => r.trim()).filter(Boolean);
  }

  if (photos !== undefined) {
    if (
      !Array.isArray(photos) ||
      !photos.every(
        (p) =>
          p &&
          typeof p === "object" &&
          typeof (p as StoredPhoto).url === "string" &&
          typeof (p as StoredPhoto).caption === "string"
      )
    ) {
      return Response.json(
        { error: "`photos` must be an array of { url, caption }" },
        { status: 400 }
      );
    }
    patch.photos = photos as StoredPhoto[];
  }

  try {
    const saved = await mergeContent(patch);
    return Response.json(saved);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return Response.json({ error: message }, { status: 500 });
  }
}
