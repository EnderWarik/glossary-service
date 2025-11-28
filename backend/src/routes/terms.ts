import { Router, Request, Response } from 'express';
import * as termService from '../services/termService';
import { TermCreate, TermUpdate, formatTerm } from '../types';

const router = Router();

router.get('/terms', async (req: Request, res: Response) => {
  try {
    const query = req.query.query?.toString();
    const limit = parseInt(req.query.limit?.toString() || '100');
    const offset = parseInt(req.query.offset?.toString() || '0');

    const items = await termService.listTerms(query, limit, offset);
    res.json(items.map(formatTerm));
  } catch (error) {
    console.error('Error listing terms:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/terms/by-keyword/:keyword', async (req: Request, res: Response) => {
  try {
    const keyword = req.params.keyword;
    const term = await termService.getTermByKeyword(keyword);

    if (!term) {
      res.status(404).json({ detail: 'Term not found' });
      return;
    }

    res.json(formatTerm(term));
  } catch (error) {
    console.error('Error getting term by keyword:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/terms', async (req: Request, res: Response) => {
  try {
    const data: TermCreate = req.body;
    const term = await termService.createTerm(data);
    res.status(201).json(formatTerm(term));
  } catch (error) {
    console.error('Error creating term:', error);
    if (isPrismaUniqueError(error)) {
      res.status(400).json({ detail: 'Term already exists' });
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

router.put('/terms/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data: TermUpdate = req.body;

    const term = await termService.updateTerm(id, data);
    res.json(formatTerm(term));
  } catch (error) {
    console.error('Error updating term:', error);
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ detail: 'Term not found' });
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

router.delete('/terms/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await termService.deleteTerm(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting term:', error);
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ detail: 'Term not found' });
    } else {
      res.status(500).json({ detail: 'Internal server error' });
    }
  }
});

function isPrismaError(error: unknown): error is { code: string } {
  return error !== null && typeof error === 'object' && 'code' in error;
}

function isPrismaUniqueError(error: unknown): boolean {
  return isPrismaError(error) && error.code === 'P2002';
}

function isPrismaNotFoundError(error: unknown): boolean {
  return isPrismaError(error) && error.code === 'P2025';
}

export default router;
