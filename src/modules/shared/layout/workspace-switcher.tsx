"use client";

import { ChevronDown } from "lucide-react";

export function WorkspaceSwitcher() {
  return (
    <button className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
      <div className="w-6 h-6 rounded bg-[var(--color-primary)] flex items-center justify-center">
        <span className="text-white text-xs font-bold">A</span>
      </div>
      <span>Acme Corp</span>
      <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
    </button>
  );
}
