"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await login(email, password);
      router.push("/account");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not log in");
    }
  }

  return (
    <div className="container-edge py-20 max-w-md">
      <p className="label-eyebrow mb-3">Welcome back</p>
      <h1 className="font-display italic text-4xl mb-10">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-eyebrow block mb-2">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-eyebrow block mb-2">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        {status === "error" && <p className="text-sm text-rust">{errorMsg}</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/60">
        New to NodeShip?{" "}
        <Link href="/register" className="underline hover:text-ink">
          Create an account
        </Link>
      </p>
    </div>
  );
}
