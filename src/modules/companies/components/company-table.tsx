"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Globe, MapPin, Users, Handshake } from "lucide-react";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Badge } from "@/modules/shared/ui/badge";
import type { Company } from "../types";

interface CompanyTableProps {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function CompanyTable({ companies, total, page, pageSize, totalPages }: CompanyTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/companies?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/companies?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-64"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">
            {total} {total === 1 ? "company" : "companies"}
          </span>
          <Link href="/companies/new">
            <Button size="sm">New company</Button>
          </Link>
        </div>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Name</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Industry</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Size</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Owner</th>
              <th className="text-right px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Contacts</th>
              <th className="text-right px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Deals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--color-text-muted)]">
                  No companies found.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors"
                  onClick={() => router.push(`/companies/${company.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text)]">{company.name}</p>
                        {company.domain && (
                          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {company.domain}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {company.industry ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {company.size ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {company.owner.name || company.owner.email}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                    {company._count?.contacts ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                    {company._count?.deals ?? 0}
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
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
