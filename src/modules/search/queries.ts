import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function globalSearch(workspaceId: string, query: string) {
  if (!query || query.length < 2) return [];

  const term = query;

  const [companies, contacts, leads, deals, tasks] = await Promise.all([
    prisma.company.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        OR: [
          { name: { contains: term } },
          { domain: { contains: term } },
          { industry: { contains: term } },
        ],
      },
      select: { id: true, name: true, industry: true, domain: true },
      take: 5,
    }),
    prisma.contact.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        OR: [
          { firstName: { contains: term } },
          { lastName: { contains: term } },
          { email: { contains: term } },
          { title: { contains: term } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, title: true },
      take: 5,
    }),
    prisma.lead.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: term } },
          { email: { contains: term } },
          { companyName: { contains: term } },
        ],
      },
      select: { id: true, name: true, status: true, companyName: true },
      take: 5,
    }),
    prisma.deal.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        OR: [
          { title: { contains: term } },
        ],
      },
      select: { id: true, title: true, value: true, stage: { select: { name: true } } },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        workspaceId,
        status: "open",
        OR: [
          { title: { contains: term } },
        ],
      },
      select: { id: true, title: true, priority: true, dueDate: true },
      take: 5,
    }),
  ]);

  const results: {
    type: string;
    id: string;
    title: string;
    subtitle: string;
    href: string;
  }[] = [];

  for (const c of companies) {
    results.push({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: [c.industry, c.domain].filter(Boolean).join(" · ") || "Company",
      href: `/companies/${c.id}`,
    });
  }

  for (const c of contacts) {
    results.push({
      type: "contact",
      id: c.id,
      title: `${c.firstName} ${c.lastName}`,
      subtitle: [c.title, c.email].filter(Boolean).join(" · ") || "Contact",
      href: `/contacts/${c.id}`,
    });
  }

  for (const l of leads) {
    results.push({
      type: "lead",
      id: l.id,
      title: l.name,
      subtitle: [l.companyName, l.status].filter(Boolean).join(" · ") || "Lead",
      href: `/leads/${l.id}`,
    });
  }

  for (const d of deals) {
    results.push({
      type: "deal",
      id: d.id,
      title: d.title,
      subtitle: [d.stage.name, d.value != null ? `$${d.value.toLocaleString()}` : ""].filter(Boolean).join(" · ") || "Deal",
      href: `/deals/${d.id}`,
    });
  }

  for (const t of tasks) {
    results.push({
      type: "task",
      id: t.id,
      title: t.title,
      subtitle: [t.priority, t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : ""].filter(Boolean).join(" · ") || "Task",
      href: "/tasks",
    });
  }

  return results;
}
