import React, { useEffect } from "react";

export default function ConfirmModal({
  open,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-white/60 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {message && <p className="text-sm text-slate-600 mt-1">{message}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:shadow-sm transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition disabled:opacity-50"
            style={{
              background: danger
                ? "linear-gradient(135deg, var(--danger), #fb7185)"
                : "linear-gradient(135deg, var(--cta), var(--cta2))",
            }}
          >
            {loading ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
