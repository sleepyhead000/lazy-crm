"use client";

import { Search } from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";

export function Topbar() {
  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <WorkspaceSwitcher />
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors"
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true })
            );
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 text-xs bg-[var(--color-bg)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
