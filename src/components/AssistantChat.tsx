"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "./ToastSystem";
import { api, errorMessage } from "@/lib/api";
import type { AssistantReply } from "@/lib/travelTypes";

interface Msg {
  id: number;
  from: "user" | "bot";
  text: string;
  followUps?: string[];
}

const GREETING: Msg = {
  id: 0,
  from: "bot",
  text: "Hi, I'm your AI travel assistant — currently in demo mode with curated travel guidance (clearly labeled, not a live AI). Ask me about destinations, budgets, packing or the best time to travel.",
  followUps: ["Best destinations this season?", "How do I save money on flights?", "What should I pack?"],
};

export default function AssistantChat() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Msg[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open, showSaved]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    setMsgs((m) => [...m, { id: nextId.current++, from: "user", text: message }]);
    setBusy(true);
    try {
      const reply: AssistantReply = await api.askAssistant(message);
      setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: reply.text, followUps: reply.followUps }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { id: nextId.current++, from: "bot", text: `Something went wrong: ${errorMessage(e)}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const copyMsg = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Response copied.", "success");
    } catch {
      toast("Couldn't access the clipboard.", "error");
    }
  };

  const saveMsg = (m: Msg) => {
    setSaved((s) => [m, ...s].slice(0, 10));
    setShowSaved(true);
    toast("Response saved to your chat log (this device).", "success");
  };

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-neon fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full"
        aria-label={open ? "Close travel assistant" : "Open travel assistant"}
        title="AI Travel Assistant (demo)"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <path d="M12 19v3" />
          </svg>
        )}
      </button>

      {/* panel */}
      {open && (
        <div className="glass-card glow-ring animate-fade-up fixed bottom-24 right-5 z-[60] flex h-[min(70vh,540px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-line/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan/50 bg-cyan/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-soft rounded-full bg-ok" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Travel Assistant</p>
                <p className="text-[10px] font-bold tracking-wider text-violet">DEMO MODE · CURATED GUIDANCE</p>
              </div>
            </div>
            <button onClick={() => setShowSaved((v) => !v)} className="chip rounded-lg px-2.5 py-1.5 text-[10px] font-bold" title="Saved responses">
              Saved {saved.length > 0 && `(${saved.length})`}
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {showSaved && saved.length > 0 && (
              <div className="rounded-xl border border-line/60 bg-bg0/50 p-3">
                <p className="hairline mb-2 text-[9px] font-extrabold text-ink-faint">SAVED RESPONSES (THIS DEVICE)</p>
                {saved.map((m) => (
                  <p key={m.id} className="mb-1.5 truncate text-[11px] text-ink-dim">“{m.text.slice(0, 70)}…”</p>
                ))}
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${m.from === "user" ? "rounded-br-md bg-gradient-to-r from-cyan/25 to-purple/25 border border-cyan/30" : "rounded-bl-md border border-line/60 bg-bg0/50"}`}>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{m.text}</p>
                  {m.from === "bot" && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => void copyMsg(m.text)} className="text-[10px] font-bold text-cyan hover:opacity-80">Copy</button>
                      <button onClick={() => saveMsg(m)} className="text-[10px] font-bold text-violet hover:opacity-80">Save</button>
                    </div>
                  )}
                  {m.followUps && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.followUps.map((f) => (
                        <button key={f} onClick={() => void send(f)} className="chip-cyan rounded-full px-2.5 py-1 text-[10px] font-bold transition-transform hover:-translate-y-0.5">
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl border border-line/60 bg-bg0/50 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cyan" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex gap-2 border-t border-line/60 px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about destinations, budgets, packing…"
              aria-label="Assistant message"
              className="neon-input flex-1 rounded-xl px-3.5 py-2.5 text-sm"
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-neon rounded-xl px-4" aria-label="Send message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
