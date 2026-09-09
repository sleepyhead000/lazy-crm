import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect } from "next/navigation";
import { globalSearch } from "@/modules/search/queries";
import Link from "next/link";
import { Building2, User, LeadConnector, Handshake, CheckSquare } from "lucide-react";

const typeIcons: Record<string, typeof Building2> = {
  company: Building2,
  contact: User,
  lead: LeadConnector,
  deal: Handshake,
  task: CheckSquare,
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const params = await searchParams;
  const results = params.q ? await globalSearch(workspace.id, params.q) : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Search
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Search across all records in your workspace.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search companies, contacts, leads, deals..."
          className="flex-1 h-10 px-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Search
        </button>
      </form>

      {params.q && results.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
          No results found for &quot;{params.q}&quot;.
        </p>
      )}

      <div className="space-y-2">
        {results.map((result) => {
          const Icon = typeIcons[result.type] || Building2;
          return (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--color-bg)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{result.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)} · {result.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
