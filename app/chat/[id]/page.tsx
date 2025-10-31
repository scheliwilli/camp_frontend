"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import api, { getTimeZoneParam, wsURL } from "@/lib/api";
import { useParams } from "next/navigation";

type ChatUser = { id: number; name: string; tag: string; photo_url?: string };
type Message = { id: number; text: string; user_id: number; is_read: boolean; created_at: string };

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTreeLegit, setIsTreeLegit] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const tz = useMemo(() => getTimeZoneParam(), []);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/api/chats/${id}/${tz}`);
      setUser(data.chat.user);
      setMessages(data.chat.messages || []);
      setIsTreeLegit(Boolean(data.is_tree_legit));
      setTimeout(() => listRef.current?.scrollTo({ top: 9999999, behavior: "smooth" }), 50);
    };
    load();
  }, [id, tz]);

  useEffect(() => {
    if (!token) return;
    const socket = new WebSocket(wsURL(`/ws/chat/${id}/${token}/${tz}`));
    socket.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setMessages((prev) => [...prev, { id: payload.message_id, text: payload.text, user_id: payload.user_id, is_read: true, created_at: new Date().toISOString() }]);
        if (payload.is_tree_updated) setIsTreeLegit(true);
        setTimeout(() => listRef.current?.scrollTo({ top: 9999999, behavior: "smooth" }), 30);
      } catch {}
    };
    return () => socket.close();
  }, [id, tz, token]);

  const send = () => {
    const socket = new WebSocket(wsURL(`/ws/chat/${id}/${token}/${tz}`));
    socket.onopen = () => {
      socket.send(input);
      setInput("");
      setTimeout(() => socket.close(), 100);
    };
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-full max-w-[360px] border-r border-zinc-700/50 p-4 space-y-3">
        <a href="/chats" className="btn-secondary w-full text-center">← К чатам</a>
      </aside>
      <section className="flex-1 flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-700/50 bg-zinc-800/70">
          <div>
            <div className="font-semibold text-lg">{user?.name}</div>
            <div className="text-xs text-zinc-400">@{user?.tag}</div>
          </div>
          {isTreeLegit && (
            <div className="flex items-center gap-3 bg-zinc-700/40 px-3 py-1.5 rounded-2xl">
              <span className="text-2xl">🌳</span>
              <span className="text-sm">Серия</span>
            </div>
          )}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[75%] rounded-3xl px-4 py-3 ${m.user_id === user?.id ? "bg-zinc-700 ml-0" : "bg-[color:var(--accent)] text-black ml-auto"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="p-4 flex items-center gap-3 border-t border-zinc-700/50">
          <input className="input" placeholder="Сообщение..." value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'&&input.trim()) send(); }}/>
          <button onClick={send} className="btn-primary">Отправить</button>
        </div>
      </section>
    </div>
  );
}


