import "server-only";
import { get, put } from "@vercel/blob";

const CHAT_KEY = "data/chat.json";

// Bounds blob size/read cost while still covering weeks of casual
// back-and-forth between two people.
const MAX_MESSAGES = 300;

export type ChatSender = "me" | "her";
export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  sentAt: string; // ISO timestamp
};
export type StoredChat = { messages: ChatMessage[] };

const EMPTY_CHAT: StoredChat = { messages: [] };

function isBlobUnconfiguredError(err: unknown): boolean {
  return err instanceof Error && /no blob credentials found/i.test(err.message);
}

export async function getChat(): Promise<StoredChat> {
  try {
    const result = await get(CHAT_KEY, { access: "public", useCache: false });
    if (!result || !result.stream) return EMPTY_CHAT;

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as Partial<StoredChat>;

    return {
      messages: Array.isArray(parsed.messages)
        ? parsed.messages.filter(
            (m): m is ChatMessage =>
              !!m &&
              (m.sender === "me" || m.sender === "her") &&
              typeof m.text === "string" &&
              typeof m.sentAt === "string" &&
              typeof m.id === "string"
          )
        : [],
    };
  } catch {
    // No chat started yet, or a transient error — start from empty rather
    // than breaking the page.
    return EMPTY_CHAT;
  }
}

export async function appendMessage(sender: ChatSender, text: string): Promise<StoredChat> {
  const current = await getChat();
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    sender,
    text,
    sentAt: new Date().toISOString(),
  };
  const next: StoredChat = { messages: [...current.messages, message].slice(-MAX_MESSAGES) };

  try {
    await put(CHAT_KEY, JSON.stringify(next), {
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

  return next;
}
