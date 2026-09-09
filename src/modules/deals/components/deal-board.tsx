"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DealColumn } from "./deal-column";
import { moveDealStage } from "../actions";

interface Deal {
  id: string;
  title: string;
  value: number | null;
  currency: string;
  stageId: string;
  expectedCloseDate: Date | null;
  owner: { name: string | null };
  company: { name: string } | null;
}

interface Stage {
  id: string;
  name: string;
  type: string;
  order: number;
}

interface DealBoardProps {
  stages: Stage[];
  deals: Deal[];
}

export function DealBoard({ stages, deals: initialDeals }: DealBoardProps) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function getDealsForStage(stageId: string) {
    return deals.filter((d) => d.stageId === stageId);
  }

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeDeal = deals.find((d) => d.id === active.id);
      if (!activeDeal) return;

      const overStageId = stages.find((s) => s.id === over.id)?.id ?? deals.find((d) => d.id === over.id)?.stageId;
      if (!overStageId || overStageId === activeDeal.stageId) return;

      setDeals((prev) =>
        prev.map((d) => (d.id === active.id ? { ...d, stageId: overStageId } : d))
      );
    },
    [deals, stages]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const deal = deals.find((d) => d.id === active.id);
      if (!deal) return;

      const overStageId = stages.find((s) => s.id === over.id)?.id ?? deals.find((d) => d.id === over.id)?.stageId;
      if (!overStageId) return;

      if (deal.stageId !== overStageId) {
        const result = await moveDealStage(deal.id, { stageId: overStageId });
        if (result.success) {
          router.refresh();
        } else {
          setDeals(initialDeals);
        }
      }
    },
    [deals, stages, initialDeals, router]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <DealColumn
            key={stage.id}
            stage={stage}
            deals={getDealsForStage(stage.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}
