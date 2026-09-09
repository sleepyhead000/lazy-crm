"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Select } from "@/modules/shared/ui/select";
import { Button } from "@/modules/shared/ui/button";
import { createCompany, updateCompany } from "../actions";
import type { CreateCompanyInput } from "../schema";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Consulting",
  "Media",
  "Other",
];

const SIZES = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "501-1000", label: "501-1000" },
  { value: "1001+", label: "1001+" },
];

interface CompanyFormProps {
  initialData?: {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    size: string | null;
    location: string | null;
    ownerId: string;
  };
  owners: { id: string; name: string | null; email: string }[];
}

export function CompanyForm({ initialData, owners }: CompanyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState<CreateCompanyInput>({
    name: initialData?.name ?? "",
    domain: initialData?.domain ?? "",
    industry: initialData?.industry ?? undefined,
    size: (initialData?.size as CreateCompanyInput["size"]) ?? undefined,
    location: initialData?.location ?? "",
    ownerId: initialData?.ownerId ?? owners[0]?.id ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = initialData
      ? await updateCompany(initialData.id, form)
      : await createCompany(form);

    if (result.success) {
      router.push(`/companies/${result.data.id}`);
      router.refresh();
    } else if (typeof result.error === "object") {
      setErrors(result.error);
    } else {
      setErrors({ _form: [result.error] });
    }

    setLoading(false);
  }

  function set<K extends keyof CreateCompanyInput>(key: K, value: CreateCompanyInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {errors._form && (
        <div className="p-3 rounded-md bg-[var(--color-danger-light)] text-sm text-[var(--color-danger)]">
          {errors._form.join(", ")}
        </div>
      )}

      <Input
        label="Company name"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        required
        error={errors.name?.[0]}
      />

      <Input
        label="Website"
        value={form.domain ?? ""}
        onChange={(e) => set("domain", e.target.value)}
        placeholder="https://example.com"
        error={errors.domain?.[0]}
      />

      <Select
        label="Industry"
        value={form.industry ?? ""}
        onChange={(e) => set("industry", e.target.value || undefined)}
        options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
        placeholder="Select industry"
        error={errors.industry?.[0]}
      />

      <Select
        label="Company size"
        value={form.size ?? ""}
        onChange={(e) => set("size", (e.target.value || undefined) as CreateCompanyInput["size"])}
        options={SIZES}
        placeholder="Select size"
        error={errors.size?.[0]}
      />

      <Input
        label="Location"
        value={form.location ?? ""}
        onChange={(e) => set("location", e.target.value)}
        placeholder="City, Country"
        error={errors.location?.[0]}
      />

      <Select
        label="Owner"
        value={form.ownerId}
        onChange={(e) => set("ownerId", e.target.value)}
        options={owners.map((o) => ({
          value: o.id,
          label: o.name || o.email,
        }))}
        required
        error={errors.ownerId?.[0]}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update company" : "Create company"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
