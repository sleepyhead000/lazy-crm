"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Handshake,
  Pencil,
  Archive,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { LogActivityForm } from "@/modules/activities/components/activity-form";
import { archiveCompany, restoreCompany } from "../actions";

interface CompanyDetailProps {
  company: {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    size: string | null;
    location: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    owner: { id: string; name: string | null; email: string };
    contacts: {
      contact: {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        title: string | null;
      };
    }[];
    deals: {
      id: string;
      title: string;
      value: number | null;
      stage: { name: string; type: string };
      owner: { name: string | null };
    }[];
    activities: {
      id: string;
      type: string;
      description: string | null;
      date: Date;
      creator: { name: string | null };
    }[];
    tags: { tag: { id: string; name: string; color: string | null } }[];
  };
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    if (!confirm("Archive this company?")) return;
    setLoading(true);
    const result = await archiveCompany(company.id);
    if (result.success) {
      router.push("/companies");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRestore() {
    setLoading(true);
    const result = await restoreCompany(company.id);
    if (result.success) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {company.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-secondary)]">
              {company.industry && <span>{company.industry}</span>}
              {company.size && (
                <>
                  <span>·</span>
                  <span>{company.size} employees</span>
                </>
              )}
              {company.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {company.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/companies/${company.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
          {company.archivedAt ? (
            <Button variant="secondary" size="sm" onClick={handleRestore} disabled={loading}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Restore
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={handleArchive} disabled={loading}>
              <Archive className="w-3.5 h-3.5 mr-1.5" />
              Archive
            </Button>
          )}
        </div>
      </div>

      {company.archivedAt && (
        <div className="p-3 rounded-md bg-[var(--color-warning-light)] text-sm text-[var(--color-warning)]">
          This company is archived.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text)]">Contacts</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {company.contacts.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No contacts yet.
                </div>
              ) : (
                company.contacts.map(({ contact }) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-raised)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.title && (
                        <p className="text-xs text-[var(--color-text-muted)]">{contact.title}</p>
                      )}
                    </div>
                    {contact.email && (
                      <span className="text-xs text-[var(--color-text-muted)]">{contact.email}</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text)]">Deals</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {company.deals.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No deals yet.
                </div>
              ) : (
                company.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-raised)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{deal.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{deal.stage.name}</p>
                    </div>
                    {deal.value != null && (
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        ${deal.value.toLocaleString()}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          <LogActivityForm companyId={company.id} />

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text)]">Activity Timeline</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {company.activities.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No activity yet.
                </div>
              ) : (
                company.activities.map((activity) => (
                  <div key={activity.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>{activity.type}</Badge>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          by {activity.creator.name ?? "Unknown"}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Owner</span>
                <span className="text-[var(--color-text)]">
                  {company.owner.name || company.owner.email}
                </span>
              </div>
              {company.domain && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Website</span>
                  <a
                    href={company.domain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {company.domain.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Created</span>
                <span className="text-[var(--color-text)]">
                  {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {company.tags.length > 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {company.tags.map(({ tag }) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
