"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

interface DealCardProps {
  deal: {
    id: string;
    title: string;
    value: number | null;
    currency: string;
    owner: { name: string | null };
    company: { name: string } | null;
  };
}

export function DealCard({ deal }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Link
      ref={setNodeRef}
      href={`/deals/${deal.id}`}
      style={style}
      className={`block p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
        {deal.title}
      </p>
      {deal.company && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {deal.company.name}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        {deal.value != null && (
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {deal.currency === "USD" ? "$" : deal.currency}
            {deal.value.toLocaleString()}
          </span>
        )}
        <span className="text-xs text-[var(--color-text-muted)]">
          {deal.owner.name}
        </span>
      </div>
    </Link>
  );
}
