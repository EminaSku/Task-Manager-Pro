import React from "react";

export default function SkeletonTaskCard() {
  return (
    <div className="rounded-3xl bg-white/85 backdrop-blur shadow-sm border border-white/70 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 w-44 bg-slate-200 rounded" />
          <div className="mt-3 h-3 w-72 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-56 bg-slate-200 rounded" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="h-9 w-16 bg-slate-200 rounded-2xl" />
          <div className="h-9 w-20 bg-slate-200 rounded-2xl" />
          <div className="h-9 w-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
