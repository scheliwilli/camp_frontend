import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Bratgram",
  description: "Chat-roulette messenger",
  icons: {
    icon: [
      { url: "/bratgram (2).ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
}
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-zinc-900 text-zinc-100 font-century antialiased min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="h-14 flex items-center px-6 bg-zinc-800/80 border-b border-zinc-700/50">
            <div className="text-2xl font-semibold tracking-wide">Bratgram</div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}


