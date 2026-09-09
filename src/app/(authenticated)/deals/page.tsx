import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect } from "next/navigation";
import { getBoardData } from "@/modules/deals/queries";
import { DealBoard } from "@/modules/deals/components/deal-board";
import Link from "next/link";
import { Button } from "@/modules/shared/ui/button";

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const board = await getBoardData(workspace.id);

  if (!board) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Deals
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              No pipeline configured. Create one in Settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-semibold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {board.pipeline.name} · {board.deals.length} deals
          </p>
        </div>
        <Link href="/deals/new">
          <Button>New deal</Button>
        </Link>
      </div>

      <DealBoard stages={board.stages} deals={board.deals} />
    </div>
  );
}
