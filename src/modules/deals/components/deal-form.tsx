"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Select } from "@/modules/shared/ui/select";
import { Button } from "@/modules/shared/ui/button";
import { createDeal } from "../actions";
import type { CreateDealInput } from "../schema";

interface DealFormProps {
  pipelines: {
    id: string;
    name: string;
    stages: { id: string; name: string; order: number }[];
  }[];
  owners: { id: string; name: string | null; email: string }[];
  companies?: { id: string; name: string }[];
  contacts?: { id: string; firstName: string; lastName: string }[];
}

export function DealForm({ pipelines, owners, companies = [], contacts = [] }: DealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const defaultPipeline = pipelines[0];
  const [selectedPipelineId, setSelectedPipelineId] = useState(defaultPipeline?.id ?? "");
  const stages = pipelines.find((p) => p.id === selectedPipelineId)?.stages ?? [];

  const [form, setForm] = useState<CreateDealInput>({
    title: "",
    value: undefined,
    currency: "USD",
    expectedCloseDate: "",
    probability: undefined,
    ownerId: owners[0]?.id ?? "",
    pipelineId: selectedPipelineId,
    stageId: stages[0]?.id ?? "",
    companyId: undefined,
    contactIds: [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await createDeal(form);
    if (result.success) {
      router.push(`/deals/${result.data.id}`);
      router.refresh();
    } else if (typeof result.error === "object") {
      setErrors(result.error);
    } else {
      setErrors({ _form: [result.error] });
    }
    setLoading(false);
  }

  function set<K extends keyof CreateDealInput>(key: K, value: CreateDealInput[K]) {
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
        label="Deal title"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        required
        error={errors.title?.[0]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Value"
          type="number"
          value={form.value ?? ""}
          onChange={(e) => set("value", e.target.value ? Number(e.target.value) : undefined)}
          error={errors.value?.[0]}
        />
        <Input
          label="Expected close date"
          type="date"
          value={form.expectedCloseDate ?? ""}
          onChange={(e) => set("expectedCloseDate", e.target.value)}
          error={errors.expectedCloseDate?.[0]}
        />
      </div>

      <Input
        label="Probability (%)"
        type="number"
        min={0}
        max={100}
        value={form.probability ?? ""}
        onChange={(e) => set("probability", e.target.value ? Number(e.target.value) : undefined)}
        error={errors.probability?.[0]}
      />

      <Select
        label="Pipeline"
        value={form.pipelineId}
        onChange={(e) => {
          const pid = e.target.value;
          setSelectedPipelineId(pid);
          const p = pipelines.find((p) => p.id === pid);
          set("pipelineId", pid);
          set("stageId", p?.stages[0]?.id ?? "");
        }}
        options={pipelines.map((p) => ({ value: p.id, label: p.name }))}
        required
        error={errors.pipelineId?.[0]}
      />

      <Select
        label="Stage"
        value={form.stageId}
        onChange={(e) => set("stageId", e.target.value)}
        options={stages.map((s) => ({ value: s.id, label: s.name }))}
        required
        error={errors.stageId?.[0]}
      />

      <Select
        label="Owner"
        value={form.ownerId}
        onChange={(e) => set("ownerId", e.target.value)}
        options={owners.map((o) => ({ value: o.id, label: o.name || o.email }))}
        required
        error={errors.ownerId?.[0]}
      />

      <Select
        label="Company"
        value={form.companyId ?? ""}
        onChange={(e) => set("companyId", e.target.value || undefined)}
        options={companies.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="None"
      />

      {contacts.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--color-text)]">Contacts</label>
          <div className="flex flex-wrap gap-2">
            {contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setForm((prev) => {
                    const ids = prev.contactIds ?? [];
                    return {
                      ...prev,
                      contactIds: ids.includes(c.id)
                        ? ids.filter((id) => id !== c.id)
                        : [...ids, c.id],
                    };
                  });
                }}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  form.contactIds?.includes(c.id)
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                {c.firstName} {c.lastName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create deal"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
