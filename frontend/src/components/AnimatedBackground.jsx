import React from "react";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="blob absolute -top-28 -left-24 h-80 w-80 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--brand)" }}
      />
      <div
        className="blob blob-2 absolute top-10 -right-24 h-96 w-96 rounded-full blur-3xl opacity-20"
        style={{ background: "var(--cta)" }}
      />
      <div
        className="blob blob-3 absolute -bottom-32 left-1/3 h-96 w-96 rounded-full blur-3xl opacity-20"
        style={{ background: "var(--success)" }}
      />

      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:60px_60px]" />
    </div>
  );
}
