"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type ChatListItem = {
  id: number;
  user_name: string;
  last_message_text: string;
  last_message_time: string;
  unread_count: number;
};

export default function ChatsPage() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<ChatListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get(`/api/user-chats/${encodeURIComponent(query ? query : "***none***")}`);
      setChats(data.chats || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Не удалось загрузить чаты");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-full max-w-[360px] border-r border-zinc-700/50 p-4 space-y-3">
        <div className="flex gap-2">
          <input className="input" placeholder="Поиск" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <button onClick={load} className="btn-secondary">Найти</button>
        </div>
        <Link href="/find" className="btn-primary w-full text-center">Найти брата</Link>
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {chats?.map((c) => (
            <Link key={c.id} href={`/chat/${c.id}`} className="block px-3 py-3 rounded-2xl hover:bg-zinc-700/40 border border-zinc-700/30">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{c.user_name}</div>
                {c.unread_count ? (
                  <span className="ml-2 text-xs text-black rounded-full px-2 py-0.5" style={{ backgroundColor: 'var(--accent)' }}>
                    {c.unread_count}
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-zinc-400 line-clamp-1">{c.last_message_text}</div>
            </Link>
          ))}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </aside>
      <section className="flex-1 flex items-center justify-center">
        <div className="card p-10 text-center">
          <div className="text-6xl mb-4">🌳</div>
          <div className="text-xl text-zinc-300">Выберите, кому хотели бы написать</div>
        </div>
      </section>
    </div>
  );
}