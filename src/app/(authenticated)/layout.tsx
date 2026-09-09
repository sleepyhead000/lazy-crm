import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/modules/shared/layout/sidebar";
import { Topbar } from "@/modules/shared/layout/topbar";
import { CommandPalette } from "@/modules/search/components/command-palette";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
