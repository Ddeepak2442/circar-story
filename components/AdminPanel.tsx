"use client";

import { useState, useRef, useCallback } from "react";
import type { StoredContent, StoredPhoto } from "@/lib/store";

type SaveState = "idle" | "saving" | "saved" | "error";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/** Downscale + re-encode an image client-side so uploads stay small and fast. */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file; // don't touch animated gifs or non-images
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function StatusNote({ state, message }: { state: SaveState; message?: string }) {
  if (state === "idle") return null;
  const styles: Record<SaveState, string> = {
    idle: "",
    saving: "text-plum/60",
    saved: "text-emerald-700",
    error: "text-rose-deep",
  };
  const label =
    state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : message || "Something went wrong";
  return <p className={`mt-2 text-sm ${styles[state]}`}>{label}</p>;
}

export default function AdminPanel({
  secret,
  initialContent,
  blobConfigured,
}: {
  secret: string;
  initialContent: StoredContent;
  blobConfigured: boolean;
}) {
  const [reasons, setReasons] = useState<string[]>(initialContent.reasons);
  const [photos, setPhotos] = useState<StoredPhoto[]>(initialContent.photos);

  const [reasonsState, setReasonsState] = useState<SaveState>("idle");
  const [photosState, setPhotosState] = useState<SaveState>("idle");
  const [uploadState, setUploadState] = useState<SaveState>("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [saveError, setSaveError] = useState<string>("");

  const [newCaption, setNewCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  };

  const updateReason = (index: number, value: string) => {
    setReasons((prev) => prev.map((r, i) => (i === index ? value : r)));
  };
  const removeReason = (index: number) => {
    setReasons((prev) => prev.filter((_, i) => i !== index));
  };
  const addReason = () => {
    setReasons((prev) => [...prev, ""]);
  };

  const saveReasons = async () => {
    setReasonsState("saving");
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ reasons }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setReasons(data.reasons);
      setReasonsState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setReasonsState("error");
    }
  };

  const updateCaption = (index: number, value: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, caption: value } : p)));
  };

  const savePhotoCaptions = async () => {
    setPhotosState("saving");
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ photos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPhotos(data.photos);
      setPhotosState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setPhotosState("error");
    }
  };

  const deletePhoto = async (url: string) => {
    const prev = photos;
    setPhotos((p) => p.filter((photo) => photo.url !== url));
    try {
      const res = await fetch("/api/admin/delete-photo", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setPhotos(data.photos);
    } catch (err) {
      setPhotos(prev); // roll back on failure
      setSaveError(err instanceof Error ? err.message : "Failed to delete");
      setPhotosState("error");
    }
  };

  const handleUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploadState("saving");
    setUploadError("");
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("caption", newCaption);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-secret": secret },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setPhotos(data.photos);
      setNewCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadState("saved");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  }, [newCaption, secret]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12 font-body text-plum">
      <header className="mb-10">
        <h1 className="font-display text-2xl text-plum">Site admin</h1>
        <p className="mt-2 text-sm text-plum/70">
          This page has no login — its URL is the only thing protecting it. Don&rsquo;t share this
          link, and bookmark it somewhere private instead.
        </p>
        {!blobConfigured && (
          <p className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
            Blob storage isn&rsquo;t connected to this project yet, so saving and uploads won&rsquo;t
            work. Add a Blob store in your Vercel project&rsquo;s Storage tab, redeploy, then reload
            this page.
          </p>
        )}
      </header>

      <section className="mb-14">
        <h2 className="font-display text-xl text-plum">Reasons</h2>
        <p className="mt-1 text-sm text-plum/60">
          Add, edit, or remove lines — the count on the public page updates automatically.
        </p>

        <ol className="mt-5 space-y-2">
          {reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 w-6 flex-none text-right text-xs text-plum/40">{i + 1}</span>
              <textarea
                value={reason}
                onChange={(e) => updateReason(i, e.target.value)}
                rows={1}
                className="flex-1 resize-none rounded-lg border border-line bg-white/80 px-3 py-2 text-sm text-plum focus:outline-rose"
              />
              <button
                type="button"
                onClick={() => removeReason(i)}
                aria-label={`Remove reason ${i + 1}`}
                className="mt-1 flex-none rounded-full px-2 py-1 text-sm text-rose-deep hover:bg-blush"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addReason}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-plum hover:bg-white"
          >
            + Add a reason
          </button>
          <button
            type="button"
            onClick={saveReasons}
            disabled={reasonsState === "saving"}
            className="rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white hover:bg-rose-deep disabled:opacity-60"
          >
            Save reasons
          </button>
        </div>
        <StatusNote state={reasonsState} message={saveError} />
      </section>

      <section className="mb-14">
        <h2 className="font-display text-xl text-plum">Photos</h2>
        <p className="mt-1 text-sm text-plum/60">
          Upload a photo with a caption. Images are resized in your browser before upload, so
          large phone photos are fine.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white/60 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-plum/70" htmlFor="photo-file">
              Photo
            </label>
            <input id="photo-file" ref={fileInputRef} type="file" accept="image/*" />
          </div>
          <div className="flex flex-1 min-w-[10rem] flex-col gap-1">
            <label className="text-xs font-medium text-plum/70" htmlFor="photo-caption">
              Caption
            </label>
            <input
              id="photo-caption"
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="e.g. Our first trip together"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm focus:outline-rose"
            />
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadState === "saving"}
            className="rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white hover:bg-rose-deep disabled:opacity-60"
          >
            Upload
          </button>
        </div>
        <StatusNote state={uploadState} message={uploadError} />

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, i) => (
            <div key={photo.url} className="rounded-xl bg-white/70 p-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => updateCaption(i, e.target.value)}
                className="mt-2 w-full rounded-md border border-line bg-white px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => deletePhoto(photo.url)}
                className="mt-2 w-full rounded-md border border-rose-deep/30 px-2 py-1 text-xs text-rose-deep hover:bg-blush"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {photos.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={savePhotoCaptions}
              disabled={photosState === "saving"}
              className="rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white hover:bg-rose-deep disabled:opacity-60"
            >
              Save caption changes
            </button>
            <StatusNote state={photosState} message={saveError} />
          </div>
        )}
        {photos.length === 0 && (
          <p className="mt-4 text-sm text-plum/50">
            No uploaded photos yet — the public page will show placeholder tiles until you add
            some here.
          </p>
        )}
      </section>
    </main>
  );
}
