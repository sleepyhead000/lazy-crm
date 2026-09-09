"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/modules/shared/ui/button";
import { Select } from "@/modules/shared/ui/select";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

const ENTITY_OPTIONS = [
  { value: "company", label: "Companies" },
  { value: "contact", label: "Contacts" },
  { value: "lead", label: "Leads" },
  { value: "deal", label: "Deals" },
];

interface ImportJob {
  id: string;
  fileName: string;
  entityType: string;
  status: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
}

export function ImportUploader({ importJobs }: { importJobs: ImportJob[] }) {
  const router = useRouter();
  const [entityType, setEntityType] = useState("company");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);

    const res = await fetch("/api/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setFile(null);
      router.refresh();
    } else {
      setError(data.error || "Import failed");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Import type"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          options={ENTITY_OPTIONS}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--color-text)]">CSV file</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-hover)]"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-[var(--color-danger-light)] text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <Button type="submit" disabled={!file || loading}>
          <Upload className="w-4 h-4 mr-2" />
          {loading ? "Uploading..." : "Start import"}
        </Button>
      </form>

      {importJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">Import history</h3>
          <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border-subtle)]">
            {importJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{job.fileName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {job.entityType} · {new Date(job.id).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {job.successRows}/{job.totalRows} rows
                  </span>
                  {job.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                  ) : job.status === "failed" ? (
                    <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
                  ) : (
                    <span className="text-xs text-[var(--color-warning)]">Processing...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
