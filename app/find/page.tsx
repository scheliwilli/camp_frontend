"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import api, { wsURL } from "@/lib/api";
import Link from "next/link";

type Room = { id: number };
type RoomUser = { id: number; name: string; tag: string; photo_url?: string };
type WsPayload = { text: string; user_id: number };

export default function FindPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<RoomUser | null>(null);
  const [chatId, setChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const connect = (roomId: number) => {
    if (!token) return;
    socketRef.current?.close();
    const ws = new WebSocket(wsURL(`/ws/room/${roomId}/${token}`));
    socketRef.current = ws;
    ws.onmessage = (ev) => {
      const data: WsPayload = JSON.parse(ev.data);
      if (data.user_id === 0 && data.text.startsWith("event:user_connect:")) {
        loadRoomUser(roomId);
      } else if (data.user_id === 0 && data.text.startsWith("event:new_chat:")) {
        const id = Number(data.text.split(":")[2]);
        setChatId(id);
      } else {
        setMessages((prev) => [...prev, data.text]);
      }
    };
  };

  const loadRoomUser = async (roomId: number) => {
    const { data } = await api.get(`/api/rooms/${roomId}/user`);
    setUser(data.room_user || null);
  };

  const join = async () => {
    const { data } = await api.post("/api/join-room");
    setRoom(data.room);
    connect(data.room.id);
  };

  const leave = async () => {
    if (!room) return;
    await api.post("/api/leave-room", { room_id: room.id });
    socketRef.current?.close();
    setRoom(null);
    setUser(null);
    setMessages([]);
  };

  const next = async () => {
    if (!room) return join();
    const { data } = await api.post("/api/next-room", { room_id: room.id });
    setUser(null);
    setMessages([]);
    setChatId(null);
    setRoom(data.room);
    connect(data.room.id);
  };

  useEffect(() => {
    join();
    return () => socketRef.current?.close();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-full max-w-[360px] border-r border-zinc-700/50 p-4 space-y-3">
        <Link href="/chats" className="btn-secondary w-full text-center">← К чатам</Link>
        <button onClick={next} className="btn-secondary w-full">Пропустить</button>
        <button onClick={leave} className="btn-secondary w-full">Выйти</button>
      </aside>
      <section className="flex-1 p-6 flex flex-col items-center justify-center">
        {!user ? (
          <div className="text-center">
            <div className="animate-pulse text-6xl mb-3">◯</div>
            <div className="text-xl text-zinc-300">Происходит поиск брата...</div>
          </div>
        ) : (
          <div className="w-full max-w-2xl card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl">🧑</div>
              <div>
                <div className="font-semibold text-lg">{user.name}</div>
                <div className="text-sm text-zinc-400">@{user.tag}</div>
              </div>
            </div>
            <div className="min-h-[240px] max-h-[420px] overflow-y-auto space-y-2 mb-4">
              {messages.map((m, i) => (
                <div key={i} className="bg-zinc-700/60 rounded-2xl px-3 py-2 w-fit">{m}</div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>socketRef.current?.send("*friendship*")} className="btn-primary">Добавить в друзья</button>
              {chatId && (
                <Link href={`/chat/${chatId}`} className="btn-secondary">Перейти в чат</Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


