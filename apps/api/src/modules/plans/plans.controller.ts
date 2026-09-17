import { Request, Response, Router } from 'express';
import { db } from '../../db/storage';
import { authenticateToken, requireAdmin } from '../auth/auth.middleware';
import { SubscriptionPlan } from '@fontastic/shared-types';

export const plansRouter = Router();

// Public: Get all active plans
plansRouter.get('/', (_req: Request, res: Response) => {
  const plans = db.getPlans().filter(p => p.isActive);
  return res.json({ plans });
});

// Admin: Get all plans (including inactive)
plansRouter.get('/admin', authenticateToken, requireAdmin, (_req: Request, res: Response) => {
  const plans = db.getPlans();
  return res.json({ plans });
});

// Admin: Add new plan
plansRouter.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, priceBDT, searchesPerWeek, features } = req.body;
    if (!name || priceBDT === undefined) {
      return res.status(400).json({ error: 'Plan name and price in BDT are required' });
    }

    const newPlan: SubscriptionPlan = {
      _id: 'plan_' + Date.now().toString(36),
      name: name.trim(),
      priceBDT: Number(priceBDT),
      period: 'month',
      searchesPerWeek: searchesPerWeek === null || searchesPerWeek === undefined || searchesPerWeek === '' 
        ? null 
        : Number(searchesPerWeek),
      features: Array.isArray(features) ? features : [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addPlan(newPlan);
    return res.status(201).json({ plan: newPlan });
  } catch (err: any) {
    console.error('Error creating plan:', err);
    return res.status(500).json({ error: 'Failed to create plan' });
  }
});

// Admin: Edit plan
plansRouter.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = db.getPlanById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, priceBDT, searchesPerWeek, features, isActive } = req.body;

    const updates: Partial<SubscriptionPlan> = {};
    if (name !== undefined) updates.name = name.trim();
    if (priceBDT !== undefined) updates.priceBDT = Number(priceBDT);
    if (searchesPerWeek !== undefined) {
      updates.searchesPerWeek = (searchesPerWeek === null || searchesPerWeek === '') ? null : Number(searchesPerWeek);
    }
    if (features !== undefined) updates.features = Array.isArray(features) ? features : [];
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const updated = db.updatePlan(id, updates);
    return res.json({ plan: updated });
  } catch (err: any) {
    console.error('Error updating plan:', err);
    return res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Admin: Delete plan
plansRouter.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = db.getPlanById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    db.deletePlan(id);
    return res.json({ message: 'Plan successfully removed', planId: id });
  } catch (err: any) {
    console.error('Error deleting plan:', err);
    return res.status(500).json({ error: 'Failed to delete plan' });
  }
});
