import React, { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

import AnimatedBackground from "../components/AnimatedBackground";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/ToastProvider";
import SkeletonTaskCard from "../components/SkeletonTaskCard";
import CommandPalette from "../components/CommandPalette";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

const badgeClass = (status) => {
  if (status === "DONE")
    return "border-[rgba(22,163,74,.25)] bg-[var(--successSoft)] text-[var(--success)]";
  if (status === "IN_PROGRESS")
    return "border-[rgba(245,158,11,.25)] bg-[var(--warnSoft)] text-[var(--warn)]";
  return "border-black/35 bg-slate-50 text-slate-600";
};

const statusLabel = (s) => {
  if (s === "IN_PROGRESS") return "IN PROGRESS";
  if (s === "TODO") return "TO DO";
  if (s === "DONE") return "DONE";
  return s || "";
};

export default function Tasks() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const user = getUser();
  const toast = useToast();

  // --------- UI helpers (35% black borders) ----------
  const BORDER = "border border-black/35";
  const CARD = `rounded-3xl bg-white/80 backdrop-blur shadow-sm ${BORDER}`;
  const CARD85 = `rounded-3xl bg-white/85 backdrop-blur shadow-sm ${BORDER}`;
  const CONTROL = `rounded-2xl ${BORDER}`;
  const CONTROL_GLASS = `rounded-2xl ${BORDER} bg-white/80 backdrop-blur`;
  const PILL_GLASS = `rounded-2xl ${BORDER} bg-white/70 backdrop-blur shadow-sm`;

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [paletteOpen, setPaletteOpen] = useState(false);

  const titleRef = useRef(null);

  // For Undo delete
  const pendingDeleteRef = useRef(null); // { timer, snapshot, taskId, queryKey }

  const queryKey = ["tasks", page, limit, status, q];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  const tasksQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const res = await api.get(`/tasks?${params.toString()}`);
      return res.data;
    },
  });

  const data = tasksQuery.data?.data || [];
  const meta = tasksQuery.data?.meta;

  const stats = useMemo(() => {
    const todo = data.filter((t) => t.status === "TODO").length;
    const prog = data.filter((t) => t.status === "IN_PROGRESS").length;
    const done = data.filter((t) => t.status === "DONE").length;
    return { todo, prog, done };
  }, [data]);

  // Create (normal + toast)
  const createTask = useMutation({
    mutationFn: async () =>
      (await api.post("/tasks", { title, description, status: "TODO" })).data,
    onSuccess: () => {
      setTitle("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created ✅", { title: "Created" });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Create failed", {
        title: "Create failed",
      }),
  });

  // Optimistic update for ANY update (status/title/desc)
  const updateTask = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/tasks/${id}`, data)).data,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData(queryKey);

      qc.setQueryData(queryKey, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t) => (t.id === id ? { ...t, ...data } : t)),
        };
      });

      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
      toast.error(err.response?.data?.message || "Update failed", {
        title: "Update failed",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Real server delete (will be called AFTER delay unless Undo)
  const deleteTaskServer = useMutation({
    mutationFn: async (id) => (await api.delete(`/tasks/${id}`)).data,
    onError: (err) => {
      toast.error(err.response?.data?.message || "Delete failed", {
        title: "Delete failed",
      });
      const p = pendingDeleteRef.current;
      if (p?.snapshot && p?.queryKey) {
        qc.setQueryData(p.queryKey, p.snapshot);
      }
      pendingDeleteRef.current = null;
    },
    onSuccess: () => {
      toast.success("Task deleted 🗑️", { title: "Deleted" });
      pendingDeleteRef.current = null;
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = () => {
    updateTask.mutate(
      { id: editingId, data: { title: editTitle, description: editDescription } },
      { onSuccess: () => toast.success("Saved ✨", { title: "Updated", duration: 1600 }) }
    );
    cancelEdit();
  };

  const setStatusQuick = (id, newStatus) => {
    updateTask.mutate(
      { id, data: { status: newStatus } },
      { onSuccess: () => toast.info(`Status → ${statusLabel(newStatus)}`, { title: "Updated", duration: 1200 })}
    );
  };

  const openDelete = (task) => {
    setDeleteTarget(task);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const snapshot = qc.getQueryData(queryKey);

    qc.setQueryData(queryKey, (old) => {
      if (!old?.data) return old;
      return { ...old, data: old.data.filter((t) => t.id !== deleteTarget.id) };
    });

    setDeleteOpen(false);

    const timer = window.setTimeout(() => {
      deleteTaskServer.mutate(deleteTarget.id);
    }, 6000);

    pendingDeleteRef.current = { timer, snapshot, taskId: deleteTarget.id, queryKey };

    toast.warning(`Deleted "${deleteTarget.title}"`, {
      title: "Undo?",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          const p = pendingDeleteRef.current;
          if (!p) return;
          window.clearTimeout(p.timer);
          if (p.snapshot) qc.setQueryData(p.queryKey, p.snapshot);
          pendingDeleteRef.current = null;
          toast.info("Delete undone ✅", { title: "Restored", duration: 1600 });
        },
      },
    });

    setDeleteTarget(null);
  };

  // Quick actions
  const commands = useMemo(() => {
    const list = [
      {
        label: "Create task",
        hint: "Title input",
        shortcut: "C",
        keywords: "new add",
        onRun: () => titleRef.current?.focus(),
      },
      {
        label: "Clear filters",
        hint: "Reset search + status",
        shortcut: "R",
        keywords: "reset filters",
        onRun: () => {
          setPage(1);
          setQ("");
          setStatus("");
          toast.info("Filters cleared", { title: "Reset", duration: 1200 });
        },
      },
      { label: "Filter: TODO", hint: "Show TODO tasks", shortcut: "1", onRun: () => setStatus("TODO") },
      { label: "Filter: IN_PROGRESS", hint: "Show active tasks", shortcut: "2", onRun: () => setStatus("IN_PROGRESS") },
      { label: "Filter: DONE", hint: "Show completed tasks", shortcut: "3", onRun: () => setStatus("DONE") },
    ];

    if (user?.role === "ADMIN") {
      list.unshift({
        label: "Go to Admin",
        hint: "Open admin panel",
        shortcut: "A",
        keywords: "users all tasks",
        onRun: () => nav("/admin"),
      });
    }

    list.push({
      label: "Logout",
      hint: "Sign out",
      shortcut: "L",
      keywords: "sign out",
      onRun: logout,
    });

    return list;
  }, [user?.role, nav]);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">
              {user?.email} <span className="text-slate-400">·</span>{" "}
              <span className="font-medium">{user?.role}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setPaletteOpen(true)}
              className={`${CONTROL_GLASS} px-4 py-2 text-sm font-semibold hover:shadow-sm transition`}
              style={{ color: "var(--brand)" }}
              title="Quick Actions"
            >
              Quick Actions
            </button>

            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                className={`${CONTROL_GLASS} px-4 py-2 text-sm font-semibold hover:shadow-sm transition`}
                style={{ color: "var(--brand)" }}
              >
                Admin
              </Link>
            )}

            <button
              onClick={logout}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition"
              style={{ background: "linear-gradient(135deg, var(--brand), var(--brand2))" }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className={`${CARD} p-5`}>
            <div className="text-xs text-slate-500">TO DO</div>
            <div className="mt-2 text-3xl font-semibold">{stats.todo}</div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/3" style={{ background: "var(--brand)" }} />
            </div>
          </div>

          <div className={`${CARD} p-5`}>
            <div className="text-xs text-slate-500">IN PROGRESS</div>
            <div className="mt-2 text-3xl font-semibold">{stats.prog}</div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/2" style={{ background: "var(--warn)" }} />
            </div>
          </div>

          <div className={`${CARD} p-5`}>
            <div className="text-xs text-slate-500">DONE</div>
            <div className="mt-2 text-3xl font-semibold">{stats.done}</div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-2/3" style={{ background: "var(--success)" }} />
            </div>
          </div>
        </div>

        {/* Create */}
        <div className={`mt-6 ${CARD} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Create task</h2>
              <p className="text-sm text-slate-600">Planning is your first win.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              ref={titleRef}
              className={`md:col-span-1 w-full ${CONTROL} p-3 outline-none focus:ring-4 bg-white`}
              style={{ "--tw-ring-color": "var(--brandSoft)" }}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className={`md:col-span-2 w-full ${CONTROL} p-3 outline-none focus:ring-4 bg-white`}
              style={{ "--tw-ring-color": "var(--brandSoft)" }}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <button
              disabled={!title || createTask.isPending}
              onClick={() => createTask.mutate()}
              className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--cta), var(--cta2))" }}
            >
              {createTask.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {/* Filters + page indicator (moved nicely) */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              className={`w-full sm:max-w-sm ${CONTROL_GLASS} p-3 outline-none focus:ring-4`}
              style={{ "--tw-ring-color": "var(--brandSoft)" }}
              placeholder="Search..."
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />

            <select
              className={`w-full sm:max-w-xs ${CONTROL_GLASS} p-3`}
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="TODO">TO DO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>

            <button
              onClick={() => tasksQuery.refetch()}
              className={`${CONTROL_GLASS} px-4 py-3 text-sm font-semibold hover:shadow-sm transition`}
              style={{ color: "var(--brand)" }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Skeletons */}
        {tasksQuery.isLoading && (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTaskCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {tasksQuery.isError && (
          <div
            className={`mt-6 rounded-3xl ${BORDER} p-4 text-sm bg-white/80 backdrop-blur`}
            style={{ borderColor: "rgba(239,68,68,.45)", color: "var(--danger)" }}
          >
            Failed to load tasks
          </div>
        )}

        {/* Empty */}
        {!tasksQuery.isLoading && !tasksQuery.isError && data.length === 0 && (
          <div className={`mt-6 ${CARD} p-6 text-slate-600`}>
            No tasks yet. Create your first one above ✨
          </div>
        )}

        {/* List */}
        {!tasksQuery.isLoading && !tasksQuery.isError && (
          <div className="mt-6 space-y-3">
            {data.map((t) => (
              <div key={t.id} className={`${CARD85} p-5`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1">
                    {editingId === t.id ? (
                      <div className="space-y-3">
                        <input
                          className={`w-full ${CONTROL} p-3 outline-none focus:ring-4 bg-white`}
                          style={{ "--tw-ring-color": "var(--brandSoft)" }}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <input
                          className={`w-full ${CONTROL} p-3 outline-none focus:ring-4 bg-white`}
                          style={{ "--tw-ring-color": "var(--brandSoft)" }}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={!editTitle || updateTask.isPending}
                            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:scale-[0.98] transition disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, var(--cta), var(--cta2))" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={updateTask.isPending}
                            className={`${CONTROL} bg-white px-4 py-2 text-sm font-semibold hover:shadow-sm transition disabled:opacity-50`}
                            style={{ color: "var(--brand)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{t.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full border ${badgeClass(t.status)}`}>
                            {statusLabel(t.status)}
                          </span>

                        </div>
                        <p className="text-slate-600 mt-1">{t.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => startEdit(t)}
                      disabled={updateTask.isPending}
                      className={`${CONTROL} bg-white px-4 py-2 text-sm font-semibold hover:shadow-sm transition disabled:opacity-50`}
                      style={{ color: "var(--brand)" }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setStatusQuick(t.id, "TODO")}
                      disabled={updateTask.isPending}
                      className={`${CONTROL} bg-white px-4 py-2 text-sm font-medium hover:shadow-sm transition disabled:opacity-50`}
                    >
                      TO DO
                    </button>
                    <button
                      onClick={() => setStatusQuick(t.id, "IN_PROGRESS")}
                      disabled={updateTask.isPending}
                      className={`${CONTROL} bg-white px-4 py-2 text-sm font-medium hover:shadow-sm transition disabled:opacity-50`}
                    >
                      IN PROGRESS
                    </button>
                    <button
                      onClick={() => setStatusQuick(t.id, "DONE")}
                      disabled={updateTask.isPending}
                      className={`${CONTROL} bg-white px-4 py-2 text-sm font-medium hover:shadow-sm transition disabled:opacity-50`}
                    >
                      DONE
                    </button>

                    <button
                      onClick={() => openDelete(t)}
                      className="rounded-2xl border px-4 py-2 text-sm font-semibold hover:opacity-95 active:scale-[0.98] transition"
                      style={{
                        borderColor: "rgba(239,68,68,.55)",
                        background: "var(--dangerSoft)",
                        color: "var(--danger)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={`${PILL_GLASS} px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50`}
          >
            Previous
          </button>

          <div className={`${PILL_GLASS} px-4 py-2 text-sm text-slate-700`}>
            Page <b>{meta?.page || page}</b> / <b>{meta?.totalPages || 1}</b>
          </div>

          <button
            disabled={meta ? page >= meta.totalPages : false}
            onClick={() => setPage((p) => p + 1)}
            className={`${PILL_GLASS} px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete modal */}
      <ConfirmModal
        open={deleteOpen}
        title="Delete task?"
        message={
          deleteTarget ? `This will delete: "${deleteTarget.title}" (Undo available for 6s)` : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleteTaskServer.isPending}
        onClose={() => {
          if (deleteTaskServer.isPending) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* Command palette */}
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} commands={commands} />
    </div>
  );
}
