import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChat, type ChatSender } from "@/lib/chat-store";
import ChatPanel from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ secret: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { secret } = await params;
  const configured = process.env.ADMIN_SECRET;

  if (!configured || secret !== configured) {
    notFound();
  }

  const { as } = await searchParams;
  const viewer: ChatSender = as === "her" ? "her" : "me";

  const chat = await getChat();
  const blobConfigured = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );

  return (
    <ChatPanel
      secret={secret}
      viewer={viewer}
      initialMessages={chat.messages}
      blobConfigured={blobConfigured}
    />
  );
}
