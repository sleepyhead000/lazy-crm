"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Pencil, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { LogActivityForm } from "@/modules/activities/components/activity-form";
import { archiveContact, restoreContact } from "../actions";

interface ContactDetailProps {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    location: string | null;
    lifecycle: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    owner: { id: string; name: string | null; email: string };
    companies: { company: { id: string; name: string; industry: string | null } }[];
    deals: {
      deal: {
        id: string;
        title: string;
        value: number | null;
        stage: { name: string; type: string };
        owner: { name: string | null };
      };
    }[];
    activities: {
      id: string;
      type: string;
      description: string | null;
      date: Date;
      creator: { name: string | null };
    }[];
    tags: { tag: { id: string; name: string } }[];
  };
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    if (!confirm("Archive this contact?")) return;
    setLoading(true);
    const result = await archiveContact(contact.id);
    if (result.success) {
      router.push("/contacts");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRestore() {
    setLoading(true);
    const result = await restoreContact(contact.id);
    if (result.success) router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-raised)] flex items-center justify-center">
            <User className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-secondary)]">
              {contact.title && <span>{contact.title}</span>}
              {contact.companies[0] && (
                <>
                  <span>at</span>
                  <Link
                    href={`/companies/${contact.companies[0].company.id}`}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    {contact.companies[0].company.name}
                  </Link>
                </>
              )}
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
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/contacts/${contact.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
          {contact.archivedAt ? (
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

      {contact.archivedAt && (
        <div className="p-3 rounded-md bg-[var(--color-warning-light)] text-sm text-[var(--color-warning)]">
          This contact is archived.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text)]">Deals</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {contact.deals.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No deals yet.
                </div>
              ) : (
                contact.deals.map(({ deal }) => (
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
                      <span className="text-sm font-medium">${deal.value.toLocaleString()}</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          <LogActivityForm contactId={contact.id} />

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text)]">Activity Timeline</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {contact.activities.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No activity yet.
                </div>
              ) : (
                contact.activities.map((activity) => (
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
            <h3 className="text-sm font-medium text-[var(--color-text)]">Contact Info</h3>
            <div className="space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Mail className="w-3.5 h-3.5" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <MapPin className="w-3.5 h-3.5" />
                  {contact.location}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Owner</span>
                <span className="text-[var(--color-text)]">
                  {contact.owner.name || contact.owner.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Created</span>
                <span className="text-[var(--color-text)]">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {contact.tags.length > 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map(({ tag }) => (
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
