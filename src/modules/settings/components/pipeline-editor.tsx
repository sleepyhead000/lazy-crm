"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/modules/shared/ui/input";
import { Button } from "@/modules/shared/ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface PipelineEditorProps {
  pipeline: {
    id: string;
    name: string;
    stages: { id: string; name: string; order: number; type: string }[];
  };
}

export function PipelineEditor({ pipeline }: PipelineEditorProps) {
  const router = useRouter();
  const [stages, setStages] = useState(pipeline.stages);
  const [newStageName, setNewStageName] = useState("");
  const [loading, setLoading] = useState(false);

  function addStage() {
    if (!newStageName.trim()) return;
    setStages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: newStageName,
        order: prev.length + 1,
        type: "active",
      },
    ]);
    setNewStageName("");
  }

  function removeStage(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStage(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stages.length) return;
    setStages((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  async function handleSave() {
    setLoading(true);
    await fetch("/api/settings/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pipelineId: pipeline.id,
        stages: stages.map((s) => ({
          id: s.id.startsWith("temp-") ? undefined : s.id,
          name: s.name,
          order: s.order,
          type: s.type,
        })),
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div
            key={stage.id}
            className="flex items-center gap-2 p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <GripVertical className="w-4 h-4 text-[var(--color-text-muted)] cursor-grab" />
            <span className="text-xs text-[var(--color-text-muted)] w-6">{stage.order}</span>
            <span className="flex-1 text-sm text-[var(--color-text)]">{stage.name}</span>
            <span className="text-xs text-[var(--color-text-muted)] px-2 py-0.5 rounded bg-[var(--color-bg)]">
              {stage.type}
            </span>
            <button onClick={() => moveStage(i, -1)} disabled={i === 0} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30">
              ↑
            </button>
            <button onClick={() => moveStage(i, 1)} disabled={i === stages.length - 1} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30">
              ↓
            </button>
            <button onClick={() => removeStage(stage.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="New stage name"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStage())}
        />
        <Button variant="secondary" onClick={addStage}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save pipeline"}
      </Button>
    </div>
  );
}
