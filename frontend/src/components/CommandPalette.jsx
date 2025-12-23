import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CommandPalette({ open, setOpen, commands = [] }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s
      ? commands.filter((c) => (c.label + " " + (c.keywords || "")).toLowerCase().includes(s))
      : commands;
    return list.slice(0, 10);
  }, [q, commands]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setIdx(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((x) => Math.min(x + 1, Math.max(filtered.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((x) => Math.max(x - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[idx];
        if (cmd?.onRun) {
          cmd.onRun();
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, idx, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-xl rounded-3xl bg-white/90 backdrop-blur border border-white/70 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/70 flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-2xl grid place-items-center text-white"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--brand2))" }}
          >
            ⌘
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command… (Ctrl+K)"
            className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-500"
          />
          <div className="text-xs text-slate-500 whitespace-nowrap">Esc</div>
        </div>

        <div className="p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-sm text-slate-600">No results.</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((c, i) => (
                <button
                  key={c.label}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => {
                    c.onRun?.();
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-2xl flex items-center justify-between gap-3 transition
                    ${i === idx ? "bg-slate-100" : "hover:bg-slate-50"}`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{c.label}</div>
                    {c.hint && <div className="text-xs text-slate-600 truncate">{c.hint}</div>}
                  </div>
                  {c.shortcut && (
                    <div className="text-xs text-slate-500 border border-slate-200 rounded-xl px-2 py-1">
                      {c.shortcut}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
