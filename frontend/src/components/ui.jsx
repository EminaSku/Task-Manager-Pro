import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl bg-white/80 backdrop-blur shadow-[0_10px_30px_rgba(2,6,23,0.08)] border border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4 p-6 pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary:
      "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100",
    danger:
      "bg-red-600 text-white hover:bg-red-500 shadow-sm",
    outlineDanger:
      "bg-white text-red-700 border border-red-300 hover:bg-red-50",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900
      focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* decor */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-slate-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] left-1/3 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
      </div>
      {children}
    </div>
  );
}
