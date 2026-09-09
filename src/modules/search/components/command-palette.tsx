"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, User, LeadConnector, Handshake, CheckSquare, ArrowRight } from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const typeIcons: Record<string, typeof Building2> = {
  company: Building2,
  contact: User,
  lead: LeadConnector,
  deal: Handshake,
  task: CheckSquare,
};

const typeLabels: Record<string, string> = {
  company: "Company",
  contact: "Contact",
  lead: "Lead",
  deal: "Deal",
  task: "Task",
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].href);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search companies, contacts, leads, deals, tasks..."
            className="flex-1 h-12 text-sm bg-transparent outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="text-xs bg-[var(--color-bg)] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              No results found.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, i) => {
                const Icon = typeIcons[result.type] || Building2;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => navigate(result.href)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-[var(--color-primary-light)]"
                        : "hover:bg-[var(--color-surface-raised)]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md bg-[var(--color-bg)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {typeLabels[result.type]} · {result.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          )}

          {query.length < 2 && !loading && (
            <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              Type at least 2 characters to search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
