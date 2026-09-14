"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, MessageCircle } from "lucide-react";

type Session = {
  id: string; name?: string; phone?: string; email?: string;
  status: string; unreadAdmin: number; lastMessageAt: string;
  lastMessage?: string; messageCount: number;
};

type Msg = { id: string; sender: "customer" | "admin"; body: string; createdAt: string };

const GOLD = "#C8B993";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAt = useRef("");

  async function loadSessions() {
    const res = await fetch("/api/admin/chat/sessions").catch(() => null);
    if (!res?.ok) return;
    const data: Session[] = await res.json();
    setSessions(data);
    // Update active session unread count
    if (active) {
      const updated = data.find(s => s.id === active.id);
      if (updated) setActive(updated);
    }
  }

  async function loadMessages(sessionId: string, initial = false) {
    const after = initial ? "" : lastAt.current;
    const url = `/api/chat/messages?sessionId=${sessionId}${after ? `&after=${encodeURIComponent(after)}` : ""}`;
    const res = await fetch(url).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json();
    const msgs: Msg[] = data.messages ?? [];
    if (msgs.length) {
      setMessages(prev => {
        const existing = new Set(prev.map(m => m.id));
        const newMsgs = msgs.filter(m => !existing.has(m.id));
        if (!newMsgs.length) return prev;
        lastAt.current = newMsgs[newMsgs.length - 1].createdAt;
        return initial ? msgs : [...prev, ...newMsgs];
      });
    }
  }

  useEffect(() => {
    loadSessions();
    const iv = setInterval(loadSessions, 5000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) return;
    lastAt.current = "";
    setMessages([]);
    loadMessages(active.id, true);
    const iv = setInterval(() => loadMessages(active.id), 3000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendReply() {
    if (!reply.trim() || !active || sending) return;
    setSending(true);
    const body = reply.trim();
    setReply("");
    await fetch("/api/admin/chat/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: active.id, body }),
    });
    const now = new Date().toISOString();
    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "admin", body, createdAt: now }]);
    lastAt.current = now;
    setSending(false);
    loadSessions();
  }

  async function resolveSession() {
    if (!active) return;
    await fetch("/api/admin/chat/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: active.id, status: "resolved" }),
    });
    loadSessions();
    setActive(null);
    setMessages([]);
  }

  const openSessions = sessions.filter(s => s.status === "open");
  const resolvedSessions = sessions.filter(s => s.status === "resolved");
  const totalUnread = openSessions.reduce((s, x) => s + x.unreadAdmin, 0);

  return (
    <div className="h-full flex flex-col bg-[#111111]">
      {/* Top bar */}
      <header className="bg-[#0f0f0f] border-b border-[#1A1A1A] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">&larr; Dashboard</Link>
          <span className="text-[#2A2A2A]">/</span>
          <span className="text-white text-sm font-semibold">Live Chat</span>
          {totalUnread > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#ef4444", color: "#fff" }}>
              {totalUnread} unread
            </span>
          )}
        </div>
        <span className="text-gray-600 text-xs">{openSessions.length} open · {resolvedSessions.length} resolved</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sessions sidebar */}
        <div className="w-72 shrink-0 border-r border-[#1A1A1A] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 && (
              <div className="p-6 text-center text-gray-600 text-sm">No chats yet.</div>
            )}
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className="w-full text-left px-4 py-3.5 border-b border-[#1A1A1A] transition-colors hover:bg-white/[0.03]"
                style={{ background: active?.id === s.id ? "rgba(200,185,147,0.06)" : undefined }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-semibold truncate">{s.name || "Anonymous"}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {s.unreadAdmin > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ef4444] text-white">{s.unreadAdmin}</span>
                    )}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${s.status === "open" ? "bg-green-400/10 text-green-400" : "bg-gray-700 text-gray-500"}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs truncate mb-1">{s.lastMessage || "No messages yet"}</p>
                <div className="flex items-center gap-2 text-gray-700 text-[10px]">
                  {s.phone && <span>📱 {s.phone}</span>}
                  <span className="ml-auto">{timeAgo(s.lastMessageAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageCircle size={48} color="#2a2a2a" strokeWidth={1} />
              <p className="text-gray-600 text-sm mt-4">Select a conversation to start replying</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-[#1A1A1A] shrink-0 flex items-center justify-between" style={{ background: "#0f0f0f" }}>
                <div>
                  <p className="text-white font-semibold">{active.name || "Anonymous"}</p>
                  <div className="flex gap-3 text-gray-500 text-xs mt-0.5">
                    {active.phone && <span>📱 {active.phone}</span>}
                    {active.email && <span>✉ {active.email}</span>}
                    <span>{active.messageCount} messages</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {active.phone && (
                    <a
                      href={`https://wa.me/${active.phone.replace(/[^0-9]/g, "").replace(/^0/, "27")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: "#25D366" }}
                    >
                      WhatsApp
                    </a>
                  )}
                  {active.status === "open" && (
                    <button
                      onClick={resolveSession}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-8">No messages yet.</p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={msg.sender === "admin"
                        ? { background: GOLD, color: "#000", borderBottomRightRadius: 4 }
                        : { background: "#1a1a1a", color: "#e5e7eb", borderBottomLeftRadius: 4, border: "1px solid #2a2a2a" }
                      }
                    >
                      <p>{msg.body}</p>
                      <p className="text-[10px] mt-1 opacity-50 text-right">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <div className="px-4 py-3 shrink-0 border-t border-[#1A1A1A]">
                {active.status === "resolved" ? (
                  <p className="text-gray-600 text-sm text-center py-1">This chat is resolved.</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                      className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C8B993] transition-colors"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30"
                      style={{ background: GOLD }}
                    >
                      <Send size={16} color="#000" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
