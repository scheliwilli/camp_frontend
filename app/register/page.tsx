"use client";
import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [about, setAbout] = useState("");
  const [isUnique, setIsUnique] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkTag = async (value: string) => {
    setTag(value);
    if (!value) return setIsUnique(null);
    try {
      const { data } = await api.get(`/auth/tag-unique/${encodeURIComponent(value)}`);
      setIsUnique(Boolean(data.is_unique));
    } catch (e) {
      setIsUnique(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/sign-up", { email, password, name, tag, about });
      router.replace("/login");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-6">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold mb-6">Регистрация</h1>
        {error && (
          <div className="mb-4 text-sm text-red-400">{String(error)}</div>
        )}
        <div className="space-y-4">
          <input className="input" placeholder="Имя пользователя" value={name} onChange={(e)=>setName(e.target.value)} required/>
          <input className="input" placeholder="Логин (email)" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
          <input className="input" placeholder="Пароль" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
          <div>
            <input className="input" placeholder="Тег (уникальный)" value={tag} onChange={(e)=>checkTag(e.target.value)} required/>
            {isUnique !== null && (
              <div className={`mt-1 text-sm ${isUnique ? "text-green-400" : "text-red-400"}`}>
                {isUnique ? "Тег свободен" : "Тег занят"}
              </div>
            )}
          </div>
          <textarea className="input min-h-24" placeholder="О себе" value={about} onChange={(e)=>setAbout(e.target.value)} />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button disabled={loading} className="btn-primary">
            {loading ? "Создаём..." : "Регистрация"}
          </button>
          <div className="text-sm text-zinc-400">
            Уже есть аккаунт? <Link href="/login" className="text-sky-300">Войти</Link>
          </div>
        </div>
      </form>
    </div>
  );
}


