"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/modules/shared/ui/button";
import { Select } from "@/modules/shared/ui/select";
import { Input } from "@/modules/shared/ui/input";
import { logActivity } from "../actions";

const ACTIVITY_TYPES = [
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
];

interface LogActivityFormProps {
  companyId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
}

export function LogActivityForm({ companyId, contactId, dealId, leadId }: LogActivityFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("note");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await logActivity({
      type: type as "call" | "meeting" | "email" | "note" | "other",
      description,
      duration: duration ? Number(duration) : undefined,
      companyId,
      contactId,
      dealId,
      leadId,
    });

    if (result.success) {
      setDescription("");
      setDuration("");
      setType("note");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Log activity
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--color-text)]">Log activity</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={ACTIVITY_TYPES}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none placeholder:text-[var(--color-text-muted)]"
        />

        {(type === "call" || type === "meeting") && (
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
          />
        )}

        <Button type="submit" size="sm" disabled={loading || !description.trim()}>
          {loading ? "Saving..." : "Save activity"}
        </Button>
      </form>
    </div>
  );
}
