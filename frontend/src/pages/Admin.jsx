import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Link } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";

const BORDER = "border border-black/35";

const pill = (role) => {
  if (role === "ADMIN") return `${BORDER} bg-[var(--brandSoft)] text-[var(--brand)]`;
  return `${BORDER} bg-white/70 text-slate-800`;
};

const badgeClass = (status) => {
  if (status === "DONE") return `${BORDER} bg-[var(--successSoft)] text-[var(--success)]`;
  if (status === "IN_PROGRESS") return `${BORDER} bg-[var(--warnSoft)] text-[var(--warn)]`;
  return `${BORDER} bg-white/70 text-slate-700`;
};

const statusLabel = (s) => {
  if (s === "IN_PROGRESS") return "IN PROGRESS";
  if (s === "TODO") return "TO DO";
  return s;
};

export default function Admin() {
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data,
  });

  const tasksQuery = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => (await api.get("/admin/tasks")).data,
  });

  const stats = useMemo(() => {
    const tasks = tasksQuery.data || [];
    return {
      users: (usersQuery.data || []).length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      prog: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    };
  }, [usersQuery.data, tasksQuery.data]);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Admin Panel</h1>
            <p className="text-slate-600 mt-1 text-sm">Users + all tasks overview.</p>
          </div>

          <Link
            className="w-full sm:w-auto text-center rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--brand2))" }}
            to="/tasks"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-3xl bg-white/80 backdrop-blur ${BORDER} shadow-sm p-5`}>
            <div className="text-xs text-slate-500">USERS</div>
            <div className="mt-2 text-3xl font-semibold">{stats.users}</div>
          </div>
          <div className={`rounded-3xl bg-white/80 backdrop-blur ${BORDER} shadow-sm p-5`}>
            <div className="text-xs text-slate-500">{statusLabel("TODO")}</div>
            <div className="mt-2 text-3xl font-semibold">{stats.todo}</div>
          </div>
          <div className={`rounded-3xl bg-white/80 backdrop-blur ${BORDER} shadow-sm p-5`}>
            <div className="text-xs text-slate-500">{statusLabel("IN_PROGRESS")}</div>
            <div className="mt-2 text-3xl font-semibold">{stats.prog}</div>
          </div>
          <div className={`rounded-3xl bg-white/80 backdrop-blur ${BORDER} shadow-sm p-5`}>
            <div className="text-xs text-slate-500">DONE</div>
            <div className="mt-2 text-3xl font-semibold">{stats.done}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Users */}
          <div className={`rounded-3xl bg-white/85 backdrop-blur ${BORDER} shadow-sm p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Users</h2>
              <span className="text-xs text-slate-500">roles</span>
            </div>

            {usersQuery.isLoading && <p className="text-slate-600 mt-3">Loading...</p>}
            {usersQuery.isError && (
              <div
                className={`mt-3 rounded-2xl ${BORDER} p-3 text-sm bg-white/80 backdrop-blur`}
                style={{ borderColor: "rgba(239,68,68,.55)", color: "var(--danger)" }}
              >
                Failed to load users
              </div>
            )}

            <ul className="mt-4 space-y-2 max-h-[55dvh] overflow-auto pr-1">
              {usersQuery.data?.map((u) => (
                <li
                  key={u.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl ${BORDER} bg-white p-3`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{u.email}</div>
                    <div className="text-xs text-slate-500 truncate">{u.name || "—"}</div>
                  </div>
                  <span className={`shrink-0 text-xs px-3 py-1 rounded-full ${pill(u.role)}`}>
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tasks */}
          <div className={`rounded-3xl bg-white/85 backdrop-blur ${BORDER} shadow-sm p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">All Tasks</h2>
              <span className="text-xs text-slate-500">owners + status</span>
            </div>

            {tasksQuery.isLoading && <p className="text-slate-600 mt-3">Loading...</p>}
            {tasksQuery.isError && (
              <div
                className={`mt-3 rounded-2xl ${BORDER} p-3 text-sm bg-white/80 backdrop-blur`}
                style={{ borderColor: "rgba(239,68,68,.55)", color: "var(--danger)" }}
              >
                Failed to load tasks
              </div>
            )}

            <ul className="mt-4 space-y-2 max-h-[55dvh] overflow-auto pr-1">
              {tasksQuery.data?.map((t) => (
                <li key={t.id} className={`rounded-2xl ${BORDER} bg-white p-3`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{t.title}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate">Owner: {t.user?.email}</div>
                    </div>
                    <span className={`shrink-0 text-xs px-3 py-1 rounded-full ${badgeClass(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
