"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Select } from "@/modules/shared/ui/select";
import { Button } from "@/modules/shared/ui/button";
import { createLead, updateLead } from "../actions";
import type { CreateLeadInput } from "../schema";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "unqualified", label: "Unqualified" },
];

interface LeadFormProps {
  initialData?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    companyName: string | null;
    status: string;
    qualificationNotes: string | null;
    ownerId: string;
  };
  owners: { id: string; name: string | null; email: string }[];
}

export function LeadForm({ initialData, owners }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState<CreateLeadInput>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    companyName: initialData?.companyName ?? "",
    status: (initialData?.status as CreateLeadInput["status"]) ?? "new",
    qualificationNotes: initialData?.qualificationNotes ?? "",
    ownerId: initialData?.ownerId ?? owners[0]?.id ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = initialData
      ? await updateLead(initialData.id, form)
      : await createLead(form);

    if (result.success) {
      router.push(`/leads/${result.data.id}`);
      router.refresh();
    } else if (typeof result.error === "object") {
      setErrors(result.error);
    } else {
      setErrors({ _form: [result.error] });
    }
    setLoading(false);
  }

  function set<K extends keyof CreateLeadInput>(key: K, value: CreateLeadInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {errors._form && (
        <div className="p-3 rounded-md bg-[var(--color-danger-light)] text-sm text-[var(--color-danger)]">
          {errors._form.join(", ")}
        </div>
      )}

      <Input label="Lead name" value={form.name} onChange={(e) => set("name", e.target.value)} required error={errors.name?.[0]} />
      <Input label="Email" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} error={errors.email?.[0]} />
      <Input label="Phone" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
      <Input label="Company name" value={form.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} />
      <Select label="Status" value={form.status ?? "new"} onChange={(e) => set("status", e.target.value as CreateLeadInput["status"])} options={STATUS_OPTIONS} />
      <Input label="Qualification notes" value={form.qualificationNotes ?? ""} onChange={(e) => set("qualificationNotes", e.target.value)} />
      <Select label="Owner" value={form.ownerId} onChange={(e) => set("ownerId", e.target.value)} options={owners.map((o) => ({ value: o.id, label: o.name || o.email }))} required error={errors.ownerId?.[0]} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : initialData ? "Update lead" : "Create lead"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
