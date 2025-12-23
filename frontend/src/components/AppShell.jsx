import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function initials(email = "") {
  const s = (email.split("@")[0] || "U").slice(0, 2).toUpperCase();
  return s;
}

export default function AppShell({ title, subtitle, children }) {
  const nav = useNavigate();
  const loc = useLocation();
  const user = getUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  const isActive = (path) => loc.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-600 mt-1 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            {/* User pill */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur border border-white/60 shadow-sm rounded-2xl px-3 py-2">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">
                {initials(user?.email || "")}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium text-slate-900">
                  {user?.email || "Unknown"}
                </div>
                <div className="text-xs text-slate-500">{user?.role || "-"}</div>
              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-2">
              <Link
                to="/tasks"
                className={[
                  "rounded-xl px-3 py-2 text-sm font-medium border shadow-sm transition",
                  isActive("/tasks")
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white/70 hover:bg-white border-white/60 text-slate-900",
                ].join(" ")}
              >
                Tasks
              </Link>

              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-medium border shadow-sm transition",
                    isActive("/admin")
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white/70 hover:bg-white border-white/60 text-slate-900",
                  ].join(" ")}
                >
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="rounded-xl px-3 py-2 text-sm font-medium bg-white/70 hover:bg-white border border-white/60 shadow-sm transition text-slate-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
