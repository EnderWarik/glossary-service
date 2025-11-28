import { Router, Request, Response } from 'express';
import * as relationService from '../services/relationService';
import * as termService from '../services/termService';
import { RelationCreate, RelationUpdate, formatTerm } from '../types';

const router = Router();

router.post('/relations', async (req: Request, res: Response) => {
  try {
    const data: RelationCreate = req.body;
    const relation = await relationService.createRelation(data);
    res.status(201).json(relation);
  } catch (error) {
    console.error('Error creating relation:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/relations', async (req: Request, res: Response) => {
  try {
    const relations = await relationService.listRelations();
    res.json(relations);
  } catch (error) {
    console.error('Error listing relations:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.put('/relations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data: RelationUpdate = req.body;

    const relation = await relationService.updateRelation(id, data);
    res.json(relation);
  } catch (error) {
    console.error('Error updating relation:', error);
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ detail: 'Relation not found' });
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

router.delete('/relations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await relationService.deleteRelation(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting relation:', error);
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ detail: 'Relation not found' });
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

router.get('/graph', async (req: Request, res: Response) => {
  try {
    const terms = await termService.listTerms(undefined, 10000, 0);
    const relations = await relationService.listRelations();

    res.json({
      nodes: terms.map(formatTerm),
      edges: relations,
    });
  } catch (error) {
    console.error('Error getting graph:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

function isPrismaError(error: unknown): error is { code: string } {
  return error !== null && typeof error === 'object' && 'code' in error;
}

function isPrismaNotFoundError(error: unknown): boolean {
  return isPrismaError(error) && error.code === 'P2025';
}

export default router;
