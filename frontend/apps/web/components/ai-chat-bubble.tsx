"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@nairacloud/ui";

type AiChatBubbleProps = {
  email?: string | null;
  name?: string | null;
};

declare global {
  interface Window {
    __nairacloudAiChatReady?: boolean;
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiChatBubble({ email, name }: AiChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your NairaCloud AI assistant. Ask me anything about servers, billing, SSH, the API, or anything else.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: userMessage },
          ].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "Something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to connect. Please try again or create a support ticket." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow-xl backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/30"
        aria-label="Open AI Support"
      >
        <X size={22} />
      </button>

      {isOpen && (
        <div
          ref={bubbleRef}
          className="fixed bottom-5 right-5 z-50 flex h-[560px] w-[380px] max-h-[80vh] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                <X size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Support</p>
                <p className="text-[11px] text-neutral-500">Powered by Groq</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2 max-w-[85%]",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-accent text-accent-fg"
                      : "rounded-tl-sm bg-neutral-800/50 text-neutral-100 border border-neutral-700"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-neutral-800/50 px-4 py-2.5 text-sm border border-neutral-700">
                  <span className="animate-spin inline-block text-accent">Loading...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-neutral-800 p-3 bg-neutral-900/50 backdrop-blur-sm">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about servers, billing, SSH, API..."
                className="flex-1 rounded-xl bg-neutral-800/50 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-fg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                aria-label="Send message"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}