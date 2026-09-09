"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Button } from "@/modules/shared/ui/button";

interface WorkspaceFormProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export function WorkspaceForm({ workspace }: WorkspaceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(workspace.name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/settings/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Slug" value={workspace.slug} disabled />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
