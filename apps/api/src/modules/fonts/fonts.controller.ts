import { Request, Response, Router } from 'express';
import { db } from '../../db/storage';
import { FontSource, FontCategory } from '@fontastic/shared-types';

export const fontsRouter = Router();

// Query font catalog
fontsRouter.get('/', (req: Request, res: Response) => {
  const { search, category, source, limit, offset } = req.query;
  let fonts = db.getFonts();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    fonts = fonts.filter(f => 
      f.family.toLowerCase().includes(q) || 
      (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (category && typeof category === 'string') {
    fonts = fonts.filter(f => f.category === category);
  }

  if (source && typeof source === 'string') {
    fonts = fonts.filter(f => f.source === source);
  }

  const total = fonts.length;
  const pageOffset = offset ? parseInt(offset as string, 10) : 0;
  const pageLimit = limit ? parseInt(limit as string, 10) : 50;
  const paginatedFonts = fonts.slice(pageOffset, pageOffset + pageLimit);

  return res.json({
    total,
    offset: pageOffset,
    limit: pageLimit,
    fonts: paginatedFonts
  });
});

// Get single font details
fontsRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const font = db.getFontById(id);
  if (!font) {
    return res.status(404).json({ error: 'Font not found' });
  }
  return res.json({ font });
});

// Download redirect or direct link
fontsRouter.get('/:id/download', (req: Request, res: Response) => {
  const { id } = req.params;
  const font = db.getFontById(id);
  if (!font) {
    return res.status(404).json({ error: 'Font not found' });
  }

  if (!font.downloadUrl) {
    return res.status(400).json({ error: 'Direct download URL not available for this font' });
  }

  return res.redirect(font.downloadUrl);
});
