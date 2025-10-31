"use client";
import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/sign-in", { email, password });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.replace("/chats");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-6">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold mb-6">Вход</h1>
        {error && (
          <div className="mb-4 text-sm text-red-400">{String(error)}</div>
        )}
        <div className="space-y-4">
          <input
            className="input"
            placeholder="Логин (email)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button disabled={loading} className="btn-primary">
            {loading ? "Входим..." : "Войти"}
          </button>
          <div className="text-sm text-zinc-400">
            Нет аккаунта? <Link href="/register" className="text-sky-300">Регистрация</Link>
          </div>
        </div>
      </form>
    </div>
  );
}


