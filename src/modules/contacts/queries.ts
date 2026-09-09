import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function getContacts(
  workspaceId: string,
  opts: {
    search?: string;
    lifecycle?: string;
    ownerId?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const { search, lifecycle, ownerId, page = 1, pageSize = 20 } = opts;

  const where: Prisma.ContactWhereInput = {
    workspaceId,
    archivedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ],
    }),
    ...(lifecycle && { lifecycle }),
    ...(ownerId && { ownerId }),
  };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        companies: { include: { company: { select: { id: true, name: true } } } },
        _count: { select: { deals: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    contacts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getContactById(workspaceId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      companies: {
        include: {
          company: {
            select: { id: true, name: true, industry: true },
          },
        },
      },
      deals: {
        include: {
          deal: {
            include: {
              stage: { select: { name: true, type: true } },
              owner: { select: { name: true } },
            },
          },
        },
      },
      activities: {
        orderBy: { date: "desc" },
        take: 20,
        include: { creator: { select: { name: true } } },
      },
      tags: { include: { tag: true } },
    },
  });
}
