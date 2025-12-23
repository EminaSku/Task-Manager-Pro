import React, { createContext, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ToastItem({ t, onRemove }) {
  const color =
    t.type === "success"
      ? { border: "rgba(22,163,74,.25)", dot: "var(--success)", title: "var(--success)" }
      : t.type === "error"
      ? { border: "rgba(239,68,68,.25)", dot: "var(--danger)", title: "var(--danger)" }
      : t.type === "warning"
      ? { border: "rgba(245,158,11,.25)", dot: "var(--warn)", title: "var(--warn)" }
      : { border: "rgba(37,99,235,.20)", dot: "var(--brand)", title: "var(--brand)" };

  return (
    <div
      className="toast-in rounded-2xl border shadow-lg bg-white/90 backdrop-blur px-4 py-3 flex items-start gap-3"
      style={{ borderColor: color.border }}
    >
      <div className="mt-1 h-2.5 w-2.5 rounded-full" style={{ background: color.dot }} />
      <div className="min-w-0">
        <div className="text-sm font-semibold" style={{ color: color.title }}>
          {t.title || (t.type === "success" ? "Success" : t.type === "error" ? "Error" : "Info")}
        </div>
        <div className="text-sm text-slate-700">{t.message}</div>

        {t.action?.label && typeof t.action?.onClick === "function" && (
          <button
            className="mt-2 rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50 active:scale-[0.98] transition"
            style={{ color: "var(--brand)" }}
            onClick={() => {
              t.action.onClick();
              onRemove(t.id);
            }}
          >
            {t.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(t.id)}
        className="ml-auto rounded-xl border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
      >
        Close
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts((x) => x.filter((t) => t.id !== id));

  const push = ({ type = "info", title, message, action, duration = 2800 }) => {
    const id = makeId();
    setToasts((x) => [...x, { id, type, title, message, action }]);
    window.setTimeout(() => remove(id), duration);
  };

  const api = useMemo(
    () => ({
      success: (message, opts = {}) => push({ type: "success", message, ...opts }),
      error: (message, opts = {}) => push({ type: "error", message, ...opts }),
      info: (message, opts = {}) => push({ type: "info", message, ...opts }),
      warning: (message, opts = {}) => push({ type: "warning", message, ...opts }),
    }),
    []
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}

      <div className="fixed z-[70] right-4 top-4 space-y-2 w-[min(420px,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onRemove={remove} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
