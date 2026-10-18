import { isAuthorized } from "@/lib/admin-auth";
import { appendMessage, getChat, type ChatSender } from "@/lib/chat-store";

const MAX_TEXT_LENGTH = 2000;

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chat = await getChat();
  return Response.json(chat);
}

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

  const { sender, text } = (body ?? {}) as { sender?: unknown; text?: unknown };

  if (sender !== "me" && sender !== "her") {
    return Response.json({ error: "`sender` must be \"me\" or \"her\"" }, { status: 400 });
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    return Response.json({ error: "Message can't be empty" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json(
      { error: `Message is too long (max ${MAX_TEXT_LENGTH} characters)` },
      { status: 400 }
    );
  }

  try {
    const chat = await appendMessage(sender as ChatSender, text.trim());
    return Response.json(chat);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    return Response.json({ error: message }, { status: 500 });
  }
}
