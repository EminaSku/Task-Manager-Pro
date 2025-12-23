import React, { useState } from "react";
import api from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const BORDER = "border border-black/35";
  const PANEL = `rounded-3xl bg-white/80 backdrop-blur shadow-sm ${BORDER}`;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      nav("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <AnimatedBackground />

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md">
          <div className={`${PANEL} p-6 sm:p-8`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
                <p className="text-slate-600 mt-1 text-sm">Start small. Keep it consistent.</p>
              </div>

              <div
                className={`hidden sm:flex items-center justify-center h-10 w-10 rounded-2xl ${BORDER} bg-white shrink-0`}
                style={{ color: "var(--success)" }}
                title="Progress"
              >
                ✓
              </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  className={`mt-1 w-full min-h-[44px] rounded-2xl ${BORDER} bg-white px-4 py-3 outline-none focus:ring-4`}
                  style={{ "--tw-ring-color": "var(--successSoft)" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  className={`mt-1 w-full min-h-[44px] rounded-2xl ${BORDER} bg-white px-4 py-3 outline-none focus:ring-4`}
                  style={{ "--tw-ring-color": "var(--brandSoft)" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  className={`mt-1 w-full min-h-[44px] rounded-2xl ${BORDER} bg-white px-4 py-3 outline-none focus:ring-4`}
                  style={{ "--tw-ring-color": "var(--warnSoft)" }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-600 mt-2">Tip: use at least 6 characters.</p>
              </div>

              {error && (
                <div
                  className={`rounded-2xl ${BORDER} p-3 text-sm bg-white/70 backdrop-blur`}
                  style={{ borderColor: "rgba(239,68,68,.55)", color: "var(--danger)" }}
                >
                  {error}
                </div>
              )}

              <button
                className="w-full min-h-[44px] rounded-2xl py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition"
                style={{ background: "linear-gradient(135deg, var(--cta), var(--cta2))" }}
                type="submit"
              >
                Create account
              </button>
            </form>
          </div>

          <p className="text-sm text-slate-600 mt-4 text-center">
            Already have an account?{" "}
            <Link className="font-semibold underline" style={{ color: "var(--brand)" }} to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
