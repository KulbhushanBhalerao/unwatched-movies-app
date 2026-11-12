"use client";
import Link from "next/link";
import { useState } from "react";
import { useSeen } from "./SeenProvider";

export default function Header() {
  const { user, logout, openAuth, authOpen, closeAuth, auth } = useSeen();
  return (
    <header className="border-b border-white/10 bg-neutral-950/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl flex items-center gap-6 px-4 h-14">
        <Link href="/" className="font-bold text-lg">🎬 Unwatched</Link>
        <Link href="/" className="text-sm text-neutral-300 hover:text-white">Find</Link>
        <Link href="/seen" className="text-sm text-neutral-300 hover:text-white">My seen list</Link>
        <div className="ml-auto text-sm">
          {user ? (
            <span className="flex items-center gap-3">
              <span className="text-neutral-400">{user.email}</span>
              <button onClick={logout} className="underline">Sign out</button>
            </span>
          ) : (
            <button onClick={openAuth} className="rounded bg-amber-500 px-3 py-1 font-medium text-black">Sign in</button>
          )}
        </div>
      </div>
      {authOpen && <AuthModal onClose={closeAuth} onSubmit={auth} />}
    </header>
  );
}

function AuthModal({ onClose, onSubmit }: { onClose(): void; onSubmit(m: "login" | "register", e: string, p: string): Promise<string | null> }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 bg-black/70 grid place-items-center z-30" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => { e.preventDefault(); setError(await onSubmit(mode, email, password)); }}
        className="w-80 rounded-lg bg-neutral-900 p-5 space-y-3 border border-white/10"
      >
        <h2 className="font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <input className="w-full rounded bg-neutral-800 px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded bg-neutral-800 px-3 py-2" type="password" placeholder="Password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full rounded bg-amber-500 py-2 font-medium text-black">{mode === "login" ? "Sign in" : "Sign up"}</button>
        <button type="button" className="text-sm text-neutral-400 underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
