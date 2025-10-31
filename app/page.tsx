"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/chats");
    else router.replace("/login");
  }, [router]);
  return null;
}


