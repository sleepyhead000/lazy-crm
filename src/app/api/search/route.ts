import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { globalSearch } from "@/modules/search/queries";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) {
    return NextResponse.json({ results: [] });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const results = await globalSearch(workspace.id, q);
  return NextResponse.json({ results });
}
