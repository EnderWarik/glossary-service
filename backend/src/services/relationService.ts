import { prisma } from '../db';
import { RelationCreate, RelationUpdate, Relation } from '../types';

export async function listRelations(): Promise<Relation[]> {
  return prisma.relation.findMany();
}

export async function getRelationById(id: number): Promise<Relation | null> {
  return prisma.relation.findUnique({ where: { id } });
}

export async function createRelation(data: RelationCreate): Promise<Relation> {
  return prisma.relation.create({ data });
}

export async function updateRelation(
    id: number,
    data: RelationUpdate
): Promise<Relation> {
  return prisma.relation.update({
    where: { id },
    data,
  });
}

export async function deleteRelation(id: number): Promise<void> {
  await prisma.relation.delete({ where: { id } });
}
