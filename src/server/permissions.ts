import { prisma } from "./db";

const PERMISSIONS: Record<string, string[]> = {
  admin: [
    "workspace:manage",
    "users:manage",
    "roles:manage",
    "pipeline:manage",
    "custom_fields:manage",
    "import:execute",
    "export:execute",
    "records:create",
    "records:update",
    "records:archive",
    "records:restore",
    "records:view_all",
    "audit:view",
  ],
  manager: [
    "users:invite",
    "pipeline:manage",
    "custom_fields:manage",
    "import:execute",
    "export:execute",
    "records:create",
    "records:update",
    "records:archive",
    "records:restore",
    "records:view_all",
    "audit:view",
  ],
  sales_rep: [
    "import:execute",
    "export:execute",
    "records:create",
    "records:update",
    "records:archive",
  ],
  read_only: [],
};

export async function getUserPermissions(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  });

  if (!membership) return [];

  return PERMISSIONS[membership.role] ?? [];
}

export async function hasPermission(
  workspaceId: string,
  userId: string,
  permission: string
) {
  const permissions = await getUserPermissions(workspaceId, userId);
  return permissions.includes(permission);
}

export async function requirePermission(
  workspaceId: string,
  userId: string,
  permission: string
) {
  const ok = await hasPermission(workspaceId, userId, permission);
  return ok ? { ok: true as const } : { ok: false as const, error: "Forbidden" };
}
