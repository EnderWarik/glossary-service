import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { TermCreate, TermUpdate, Term } from '../types';

export async function listTerms(query?: string, limit = 100, offset = 0): Promise<Term[]> {
  const where = query
    ? {
        OR: [
          { term: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { definition: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { synonyms: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { tags: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : undefined;

  return prisma.term.findMany({
    where,
    orderBy: { term: 'asc' },
    take: limit,
    skip: offset,
  });
}

export async function getTermById(id: number): Promise<Term | null> {
  return prisma.term.findUnique({ where: { id } });
}

export async function getTermByKeyword(keyword: string): Promise<Term | null> {
  return prisma.term.findFirst({
    where: { term: { equals: keyword, mode: Prisma.QueryMode.insensitive } },
  });
}

const toJoinedString = (arr?: string[]): string | null | undefined => {
  if (arr === undefined) return undefined;
  return arr.length ? arr.join(',') : null;
};

export async function createTerm(data: TermCreate): Promise<Term> {
  return prisma.term.create({
    data: {
      ...data,
      synonyms: toJoinedString(data.synonyms),
      tags: toJoinedString(data.tags),
    },
  });
}

export async function updateTerm(id: number, data: TermUpdate): Promise<Term> {
  return prisma.term.update({
    where: { id },
    data: {
      ...data,
      synonyms: toJoinedString(data.synonyms),
      tags: toJoinedString(data.tags),
    },
  });
}

export async function deleteTerm(id: number): Promise<void> {
  await prisma.term.delete({ where: { id } });
}
