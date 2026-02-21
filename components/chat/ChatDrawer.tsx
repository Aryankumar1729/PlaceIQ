"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, PanelRight, PanelRightClose } from "lucide-react";


type Message = {
  role: "user" | "bot";
  content: string;
};

const suggestions = [
  "3-week TCS prep plan",
  "Infosys SP cutoff criteria",
  "Amazon SDE most asked topics",
];



export default function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hey! TCS and Infosys drives are coming up 👋 What do you want to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", content: data.response }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Overlay when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Floating button — hide when expanded */}
      {!expanded && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-glow transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label="Open AI chat"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-green border-2 border-bg animate-pulse" />
          {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
        </button>
      )}

      {/* Chat panel — drawer or sidebar */}
      {(open || expanded) && (
        <div
          className={`fixed z-50 flex flex-col border border-border-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300
          ${expanded
              ? "top-0 right-0 h-full w-[380px] rounded-none border-r-0 border-t-0 border-b-0 animate-none"
              : "bottom-28 right-7 w-[360px] max-h-[560px] rounded-[18px] animate-slide-in-drawer"
            }`}
          style={{ background: "var(--surface)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div>
              <div className="flex items-center gap-2 font-syne font-bold text-sm">
                <span
                  className="w-2 h-2 rounded-full bg-accent-green"
                  style={{ boxShadow: "0 0 8px #43e97b", animation: "pulse-glow 1.5s infinite" }}
                />
                PlaceIQ AI
              </div>
              <p className="text-[11px] text-muted mt-0.5">Ask anything about your upcoming drives</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Expand / collapse sidebar button */}
              <button
                onClick={() => { setExpanded((v) => !v); setOpen(true); }}
                className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-[var(--text)] transition-colors"
                title={expanded ? "Collapse" : "Open as sidebar"}
              >
                {expanded
                  ? <PanelRightClose size={15} />
                  : <PanelRight size={15} />
                }
              </button>

              {/* Close button */}
              <button
                onClick={() => { setOpen(false); setExpanded(false); }}
                className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-[var(--text)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "bot"
                  ? "self-start bg-surface2 border border-border rounded-bl-sm text-[var(--text)]"
                  : "self-end bg-accent text-white rounded-br-sm"
                  }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-surface2 border border-border rounded-xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — dismissible */}
          {showSuggestions && (
            <div className="px-4 pt-2.5 pb-1 border-t border-border shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-2 font-semibold">Quick ask</p>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-muted-2 hover:text-muted transition-colors"
                  title="Dismiss suggestions"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left px-3 py-2 rounded-lg bg-surface2 border border-border text-xs text-muted hover:border-accent/30 hover:text-[var(--text)] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 flex gap-2 items-end border-t border-border shrink-0">
            <textarea
              rows={1}
              className="flex-1 input-field resize-none text-[13px] min-h-[38px] max-h-24 py-2.5"
              placeholder="Ask about any company..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button
              onClick={() => send(input)}
              className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0 hover:opacity-85 transition-opacity active:scale-95"
            >
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
