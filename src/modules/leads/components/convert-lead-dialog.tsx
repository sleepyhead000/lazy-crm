"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Select } from "@/modules/shared/ui/select";
import { convertLead } from "../actions";
import type { ConvertLeadInput } from "../schema";

interface ConvertLeadDialogProps {
  leadId: string;
  leadName: string;
  defaultCompanyName?: string | null;
}

export function ConvertLeadDialog({ leadId, leadName, defaultCompanyName }: ConvertLeadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ConvertLeadInput>({
    createCompany: true,
    companyName: defaultCompanyName ?? "",
    createDeal: false,
    dealTitle: "",
    dealValue: undefined,
  });

  async function handleConvert() {
    setLoading(true);
    const result = await convertLead(leadId, form);
    if (result.success) {
      router.push(`/contacts/${result.data.contact.id}`);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-[var(--color-success)] text-white hover:opacity-90">
        Convert lead
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Convert &quot;{leadName}&quot;
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This will create a contact from the lead data. Optionally create a company and deal.
        </p>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.createCompany} onChange={(e) => setForm((p) => ({ ...p, createCompany: e.target.checked }))} className="rounded" />
          Create a company
        </label>

        {form.createCompany && (
          <Input label="Company name" value={form.companyName ?? ""} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} />
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.createDeal} onChange={(e) => setForm((p) => ({ ...p, createDeal: e.target.checked }))} className="rounded" />
          Create a deal
        </label>

        {form.createDeal && (
          <>
            <Input label="Deal title" value={form.dealTitle ?? ""} onChange={(e) => setForm((p) => ({ ...p, dealTitle: e.target.value }))} />
            <Input label="Deal value" type="number" value={form.dealValue ?? ""} onChange={(e) => setForm((p) => ({ ...p, dealValue: e.target.value ? Number(e.target.value) : undefined }))} />
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleConvert} disabled={loading}>{loading ? "Converting..." : "Convert"}</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
