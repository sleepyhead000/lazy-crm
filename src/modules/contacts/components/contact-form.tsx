"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Select } from "@/modules/shared/ui/select";
import { Button } from "@/modules/shared/ui/button";
import { createContact, updateContact } from "../actions";
import type { CreateContactInput } from "../schema";

const LIFECYCLE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

interface ContactFormProps {
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    location: string | null;
    lifecycle: string | null;
    ownerId: string;
  };
  owners: { id: string; name: string | null; email: string }[];
  companies?: { id: string; name: string }[];
  selectedCompanyIds?: string[];
}

export function ContactForm({
  initialData,
  owners,
  companies = [],
  selectedCompanyIds = [],
}: ContactFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState<CreateContactInput>({
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    title: initialData?.title ?? "",
    location: initialData?.location ?? "",
    lifecycle: (initialData?.lifetime as CreateContactInput["lifecycle"]) ?? undefined,
    ownerId: initialData?.ownerId ?? owners[0]?.id ?? "",
    companyIds: selectedCompanyIds,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = initialData
      ? await updateContact(initialData.id, form)
      : await createContact(form);

    if (result.success) {
      router.push(`/contacts/${result.data.id}`);
      router.refresh();
    } else if (typeof result.error === "object") {
      setErrors(result.error);
    } else {
      setErrors({ _form: [result.error] });
    }

    setLoading(false);
  }

  function set<K extends keyof CreateContactInput>(key: K, value: CreateContactInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCompany(companyId: string) {
    setForm((prev) => {
      const ids = prev.companyIds ?? [];
      return {
        ...prev,
        companyIds: ids.includes(companyId)
          ? ids.filter((id) => id !== companyId)
          : [...ids, companyId],
      };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {errors._form && (
        <div className="p-3 rounded-md bg-[var(--color-danger-light)] text-sm text-[var(--color-danger)]">
          {errors._form.join(", ")}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          required
          error={errors.firstName?.[0]}
        />
        <Input
          label="Last name"
          value={form.lastName}
          onChange={(e) => set("lastName", e.target.value)}
          required
          error={errors.lastName?.[0]}
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={form.email ?? ""}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email?.[0]}
      />

      <Input
        label="Phone"
        value={form.phone ?? ""}
        onChange={(e) => set("phone", e.target.value)}
        error={errors.phone?.[0]}
      />

      <Input
        label="Job title"
        value={form.title ?? ""}
        onChange={(e) => set("title", e.target.value)}
        error={errors.title?.[0]}
      />

      <Input
        label="Location"
        value={form.location ?? ""}
        onChange={(e) => set("location", e.target.value)}
        error={errors.location?.[0]}
      />

      <Select
        label="Lifecycle"
        value={form.lifecycle ?? ""}
        onChange={(e) => set("lifecycle", (e.target.value || undefined) as CreateContactInput["lifecycle"])}
        options={LIFECYCLE_OPTIONS}
        placeholder="Select lifecycle"
        error={errors.lifecycle?.[0]}
      />

      <Select
        label="Owner"
        value={form.ownerId}
        onChange={(e) => set("ownerId", e.target.value)}
        options={owners.map((o) => ({ value: o.id, label: o.name || o.email }))}
        required
        error={errors.ownerId?.[0]}
      />

      {companies.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--color-text)]">Companies</label>
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCompany(c.id)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  form.companyIds?.includes(c.id)
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update contact" : "Create contact"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
