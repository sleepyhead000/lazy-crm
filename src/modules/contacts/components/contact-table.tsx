"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { User, Mail, Building2 } from "lucide-react";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Badge } from "@/modules/shared/ui/badge";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  lifecycle: string | null;
  owner: { id: string; name: string | null; email: string };
  companies: { company: { id: string; name: string } }[];
  _count: { deals: number };
}

interface ContactTableProps {
  contacts: Contact[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function ContactTable({ contacts, total, page, pageSize, totalPages }: ContactTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page");
    router.push(`/contacts?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/contacts?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-64"
          />
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">
            {total} {total === 1 ? "contact" : "contacts"}
          </span>
          <Link href="/contacts/new">
            <Button size="sm">New contact</Button>
          </Link>
        </div>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Name</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Company</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Title</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Lifecycle</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--color-text-muted)]">
                  No contacts found.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-surface-raised)] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[var(--color-text-muted)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.email && (
                          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {contact.companies[0]?.company.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {contact.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {contact.lifecycle && (
                      <Badge
                        variant={
                          contact.lifecycle === "customer"
                            ? "success"
                            : contact.lifecycle === "churned"
                              ? "danger"
                              : "default"
                        }
                      >
                        {contact.lifecycle}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {contact.owner.name || contact.owner.email}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
