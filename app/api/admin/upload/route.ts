import { put } from "@vercel/blob";
import { isAuthorized } from "@/lib/admin-auth";
import { getContent, saveContent } from "@/lib/store";

const MAX_BYTES = 4.4 * 1024 * 1024; // stay under Vercel's 4.5MB request body limit

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const captionRaw = formData.get("caption");
  const caption = typeof captionRaw === "string" ? captionRaw.trim() : "";

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Image is too large (please keep it under ~4MB)" },
      { status: 400 }
    );
  }

  try {
    const extension = file.type.split("/")[1] || "jpg";
    const safeName = `photos/${Date.now()}.${extension}`;

    const blob = await put(safeName, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    const current = await getContent();
    const nextPhotos = [
      ...current.photos,
      { url: blob.url, caption: caption || "Add your own caption here" },
    ];
    await saveContent({ reasons: current.reasons, photos: nextPhotos });

    return Response.json({ reasons: current.reasons, photos: nextPhotos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
