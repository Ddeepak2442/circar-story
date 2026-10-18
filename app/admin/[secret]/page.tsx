import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/store";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const configured = process.env.ADMIN_SECRET;

  if (!configured || secret !== configured) {
    notFound();
  }

  const content = await getContent();
  // Vercel Blob may be configured via a classic BLOB_READ_WRITE_TOKEN or the
  // newer OIDC-based setup (BLOB_STORE_ID + an auto-issued token) — either
  // is enough for uploads/saves to work, so this banner only warns when
  // neither is present.
  const blobConfigured = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );

  return (
    <AdminPanel secret={secret} initialContent={content} blobConfigured={blobConfigured} />
  );
}
