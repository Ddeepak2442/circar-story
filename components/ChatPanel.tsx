"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatSender } from "@/lib/chat-store";
import { siteContent } from "@/lib/content";

type SendState = "idle" | "sending" | "error";

const POLL_INTERVAL_MS = 4000;

function nameFor(sender: ChatSender): string {
  return sender === "her" ? siteContent.herName : siteContent.chat.meLabel;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function sameMessages(a: ChatMessage[], b: ChatMessage[]): boolean {
  if (a.length !== b.length) return false;
  const last = a.length - 1;
  return last < 0 || a[last].id === b[last].id;
}

export default function ChatPanel({
  secret,
  viewer,
  initialMessages,
  blobConfigured,
}: {
  secret: string;
  viewer: ChatSender;
  initialMessages: ChatMessage[];
  blobConfigured: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [error, setError] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const authHeaders = {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  };

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, []);

  // Keep track of whether the viewer is scrolled near the bottom, so polling
  // updates don't yank the screen while they're reading older messages.
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/chat/messages", { headers: authHeaders });
        if (!res.ok) return;
        const data = (await res.json()) as { messages: ChatMessage[] };
        setMessages((prev) => {
          if (sameMessages(prev, data.messages)) return prev;
          if (isNearBottomRef.current) requestAnimationFrame(scrollToBottom);
          return data.messages;
        });
      } catch {
        // Transient network error — try again on the next tick.
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // authHeaders is derived fresh each render from `secret`, which doesn't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret, scrollToBottom]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      sender: viewer,
      text,
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setSendState("sending");
    setError("");
    isNearBottomRef.current = true;
    requestAnimationFrame(scrollToBottom);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ sender: viewer, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setMessages(data.messages);
      setSendState("idle");
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      setError(err instanceof Error ? err.message : "Failed to send");
      setSendState("error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12 font-body text-plum">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-plum">{siteContent.chat.heading}</h1>
        <p className="mt-2 text-sm text-plum/70">{siteContent.chat.intro}</p>
        {!blobConfigured && (
          <p className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
            Blob storage isn&rsquo;t connected to this project yet, so messages won&rsquo;t be
            saved. Add a Blob store in your Vercel project&rsquo;s Storage tab, redeploy, then
            reload this page.
          </p>
        )}
      </header>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/50 p-4 shadow-sm backdrop-blur-sm"
      >
        {messages.length === 0 && (
          <p className="text-sm text-plum/50">No messages yet — say hi!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender === viewer;
          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              {!isOwn && (
                <span className="mb-1 px-1 text-xs font-medium text-plum/50">
                  {nameFor(msg.sender)}
                </span>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isOwn ? "bg-rose text-white" : "bg-white/80 text-plum"
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-1 px-1 text-[11px] text-plum/40">{formatTime(msg.sentAt)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-rose-deep">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-plum/15 bg-white/80 px-4 py-2 text-sm text-plum focus:outline-rose"
        />
        <button
          type="submit"
          disabled={sendState === "sending" || draft.trim().length === 0}
          className="rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose/30 hover:bg-rose-deep disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </main>
  );
}
