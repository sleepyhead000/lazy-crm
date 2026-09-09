"use client";

import { useDroppable } from "@dnd-kit/core";
import { DealCard } from "./deal-card";

interface DealColumnProps {
  stage: { id: string; name: string; type: string };
  deals: {
    id: string;
    title: string;
    value: number | null;
    currency: string;
    owner: { name: string | null };
    company: { name: string } | null;
  }[];
}

export function DealColumn({ stage, deals }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 rounded-lg border transition-colors ${
        isOver
          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
          : "border-[var(--color-border)] bg-[var(--color-surface-raised)]"
      }`}
    >
      <div className="px-3 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[var(--color-text)]">{stage.name}</h3>
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            ${totalValue.toLocaleString()}
          </span>
        )}
      </div>
      <div className="p-2 space-y-2 min-h-[100px]">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
