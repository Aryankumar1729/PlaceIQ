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
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Floating button */}
      {!expanded && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Open AI chat"
        >
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          {open ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      )}

      {/* Chat panel */}
      {(open || expanded) && (
        <div
          className={`fixed z-50 flex flex-col border border-white/60 shadow-2xl shadow-slate-900/10 transition-all duration-300 ease-out bg-white/40 backdrop-blur-2xl
          ${expanded
              ? "top-0 right-0 h-full w-[380px] rounded-none animate-none"
              : "bottom-28 right-8 w-[360px] max-h-[560px] rounded-3xl animate-slide-in-drawer"
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/40 shrink-0 bg-white/20">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-900">
                <span
                  className="w-2 h-2 rounded-full bg-green-500 shadow-sm"
                  style={{ boxShadow: "0 0 8px rgba(34, 197, 94, 0.5)", animation: "pulse-glow 1.5s infinite" }}
                />
                PlaceIQ AI
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">Ask anything about your upcoming drives</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => { setExpanded((v) => !v); setOpen(true); }}
                className="btn-icon hover:bg-white/50"
                title={expanded ? "Collapse" : "Open as sidebar"}
              >
                {expanded ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
              </button>
              <button
                onClick={() => { setOpen(false); setExpanded(false); }}
                className="btn-icon hover:bg-white/50"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm backdrop-blur-md ${
                  m.role === "bot"
                    ? "self-start bg-white/60 border border-white/60 rounded-tl-sm text-slate-800"
                    : "self-end bg-primary/90 border border-primary/20 text-white rounded-tr-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-white/60 border border-white/60 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-md">
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="px-4 pt-3 pb-2 border-t border-white/40 shrink-0 bg-white/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">Quick ask</p>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-slate-500 hover:text-slate-800 transition-colors"
                  title="Dismiss suggestions"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 text-xs font-medium text-slate-700 hover:bg-white/80 hover:shadow-sm hover:text-slate-900 transition-all duration-200 ease-out"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 flex gap-2 items-end border-t border-white/40 shrink-0 bg-white/30">
            <textarea
              rows={1}
              className="flex-1 bg-white/60 border border-white/60 rounded-xl px-4 py-3 text-[13px] text-slate-900 placeholder-slate-500 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-white/80 transition-all duration-200 resize-none min-h-[44px] max-h-24 backdrop-blur-md shadow-sm"
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
              className="w-11 h-11 rounded-xl bg-primary/90 flex items-center justify-center shrink-0 hover:bg-indigo-600 transition-all duration-200 ease-out active:scale-95 shadow-md shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 backdrop-blur-md"
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
