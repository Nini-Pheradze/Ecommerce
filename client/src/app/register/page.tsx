"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await register(name, email, password);
      await login(email, password);
      router.push("/account");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not create account");
    }
  }

  return (
    <div className="container-edge py-20 max-w-md">
      <p className="label-eyebrow mb-3">Join NodeShip</p>
      <h1 className="font-display italic text-4xl mb-10">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-eyebrow block mb-2">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>
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
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-ink/40 mt-1">At least 8 characters.</p>
        </div>
        {status === "error" && <p className="text-sm text-rust">{errorMsg}</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="underline hover:text-ink">
          Log in
        </Link>
      </p>
    </div>
  );
}
