import { Request, Response, Router } from 'express';
import { db } from '../../db/storage';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware';
import { FontCollection } from '@fontastic/shared-types';

export const usersRouter = Router();
usersRouter.use(authenticateToken);

// Get user wishlist
usersRouter.get('/wishlist', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const fontIds = user.wishlist || [];
  const fonts = fontIds
    .map(id => db.getFontById(id) || db.getFonts().find(f => f.family.toLowerCase() === id.toLowerCase()))
    .filter(Boolean);

  return res.json({ wishlist: fonts, fontIds });
});

// Toggle wishlist item
usersRouter.post('/wishlist/toggle', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { fontId } = req.body;

  if (!fontId) {
    return res.status(400).json({ error: 'fontId is required' });
  }

  let wishlist = [...(user.wishlist || [])];
  const exists = wishlist.includes(fontId);

  if (exists) {
    wishlist = wishlist.filter(id => id !== fontId);
  } else {
    wishlist.push(fontId);
  }

  const updatedUser = db.updateUser(user._id, { wishlist });
  return res.json({
    inWishlist: !exists,
    wishlist: updatedUser?.wishlist || []
  });
});

// Get user search history
usersRouter.get('/history', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const history = db.getUserSearchHistory(user._id);
  return res.json({ history });
});

// Collections: List
usersRouter.get('/collections', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const collections = db.getUserCollections(user._id);
  return res.json({ collections });
});

// Collections: Create
usersRouter.post('/collections', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, description, colorTag, fontIds } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Collection name is required' });
  }

  const newCollection: FontCollection = {
    _id: 'col_' + Date.now().toString(36),
    userId: user._id,
    name: name.trim(),
    description: description ? description.trim() : undefined,
    colorTag: colorTag || '#3b82f6',
    fontIds: Array.isArray(fontIds) ? fontIds : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addCollection(newCollection);
  return res.status(201).json({ collection: newCollection });
});

// Collections: Update
usersRouter.put('/collections/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { name, description, colorTag, fontIds } = req.body;

  const collection = db.getUserCollections(user._id).find(c => c._id === id);
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const updates: Partial<FontCollection> = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();
  if (colorTag !== undefined) updates.colorTag = colorTag;
  if (fontIds !== undefined && Array.isArray(fontIds)) updates.fontIds = fontIds;

  const updated = db.updateCollection(id, updates);
  return res.json({ collection: updated });
});

// Collections: Delete
usersRouter.delete('/collections/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const collection = db.getUserCollections(user._id).find(c => c._id === id);
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  db.deleteCollection(id);
  return res.json({ message: 'Collection deleted successfully', collectionId: id });
});
