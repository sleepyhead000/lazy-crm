import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function getCompanies(
  workspaceId: string,
  opts: {
    search?: string;
    industry?: string;
    ownerId?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const { search, industry, ownerId, page = 1, pageSize = 20 } = opts;

  const where: Prisma.CompanyWhereInput = {
    workspaceId,
    archivedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { domain: { contains: search } },
        { location: { contains: search } },
      ],
    }),
    ...(industry && { industry }),
    ...(ownerId && { ownerId }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { contacts: true, deals: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCompanyById(workspaceId: string, companyId: string) {
  return prisma.company.findFirst({
    where: { id: companyId, workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      contacts: {
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true, title: true },
          },
        },
      },
      deals: {
        where: { archivedAt: null },
        include: {
          stage: { select: { name: true, type: true } },
          owner: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        orderBy: { date: "desc" },
        take: 20,
        include: {
          creator: { select: { name: true } },
        },
      },
      tags: { include: { tag: true } },
    },
  });
}

export async function getCompanyContacts(workspaceId: string, companyId: string) {
  return prisma.companyContact.findMany({
    where: {
      companyId,
      contact: { workspaceId, archivedAt: null },
    },
    include: {
      contact: {
        include: {
          owner: { select: { name: true } },
        },
      },
    },
  });
}

export async function getCompanyDeals(workspaceId: string, companyId: string) {
  return prisma.deal.findMany({
    where: {
      companyId,
      workspaceId,
      archivedAt: null,
    },
    include: {
      stage: true,
      owner: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
