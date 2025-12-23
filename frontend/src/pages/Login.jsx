import React, { useState } from "react";
import api from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const BORDER = "border border-black/35";
  const PANEL = `rounded-3xl bg-white/80 backdrop-blur shadow-sm ${BORDER}`;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      nav("/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
                <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Sign in and keep momentum on your tasks.
                </p>
              </div>

              <div
                className={`hidden sm:flex items-center justify-center h-10 w-10 rounded-2xl ${BORDER} bg-white shrink-0`}
                style={{ color: "var(--brand)" }}
                title="Focus"
              >
                ⌁
              </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
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
                  style={{ "--tw-ring-color": "var(--brandSoft)" }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
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
                Login
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
                <span>Tip: planning is already a win.</span>
                <span className={`inline-flex w-fit px-2 py-1 rounded-full ${BORDER} bg-white/70`}>v1</span>
              </div>
            </form>
          </div>

          <p className="text-sm text-slate-600 mt-4 text-center">
            No account?{" "}
            <Link className="font-semibold underline" style={{ color: "var(--brand)" }} to="/register">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
