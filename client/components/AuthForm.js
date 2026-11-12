"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      router.push(user.role === "attendee" ? "/" : "/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="muted">
        {isRegister ? "Already registered? " : "New here? "}
        <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Sign up"}</Link>
      </p>
      <form className="form" onSubmit={onSubmit}>
        {isRegister && (
          <label>
            Name
            <input value={form.name} onChange={set("name")} required minLength={2} maxLength={80} autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            required
            minLength={isRegister ? 8 : 1}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {isRegister && <span className="muted small">At least 8 characters, with a letter and a number.</span>}
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="btn" disabled={busy}>
          {busy ? "Please wait…" : isRegister ? "Sign up" : "Log in"}
        </button>
      </form>
    </div>
  );
}
