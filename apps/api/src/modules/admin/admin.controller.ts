import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../../db/storage';
import { authenticateToken, requireAdmin } from '../auth/auth.middleware';
import { DashboardStats, User } from '@fontastic/shared-types';

export const adminRouter = Router();

// Protect all admin routes
adminRouter.use(authenticateToken, requireAdmin);

// Dashboard Analytics & Metrics
adminRouter.get('/stats', (_req: Request, res: Response) => {
  const users = db.getUsers();
  const searchHistory = db.getAllSearchHistory();
  const activeSubscribers = users.filter(u => u.planId && u.isActive).length;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonthStr = now.toISOString().slice(0, 7);

  const searchesToday = searchHistory.filter(h => h.createdAt.slice(0, 10) === todayStr).length;
  const totalSearchesThisMonth = searchHistory.filter(h => h.createdAt.slice(0, 7) === thisMonthStr).length;

  const desktopSearchesCount = searchHistory.filter(h => h.sourceDevice === 'desktop').length;
  const mobileSearchesCount = searchHistory.filter(h => h.sourceDevice === 'mobile').length;

  // Font popularity tracking
  const fontCountMap: Record<string, { family: string; count: number; source: any }> = {};
  searchHistory.forEach(h => {
    (h.matchedFonts || []).slice(0, 3).forEach(m => {
      const key = m.font.family;
      if (!fontCountMap[key]) {
        fontCountMap[key] = { family: key, count: 0, source: m.font.source };
      }
      fontCountMap[key].count++;
    });
  });

  const popularFonts = Object.values(fontCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(f => ({ family: f.family, searches: f.count, source: f.source }));

  const stats: DashboardStats = {
    totalUsers: users.length,
    activeSubscribers,
    totalSearchesThisMonth,
    searchesToday,
    desktopSearchesCount,
    mobileSearchesCount,
    popularFonts
  };

  return res.json({ stats });
});

// List Users with search & filter
adminRouter.get('/users', (req: Request, res: Response) => {
  const { query, role, planId } = req.query;
  let users = db.getUsers();

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  if (role && typeof role === 'string') {
    users = users.filter(u => u.role === role);
  }

  if (planId && typeof planId === 'string') {
    users = users.filter(u => u.planId === planId);
  }

  const safeUsers = users.map(u => {
    const { passwordHash: _, ...safe } = u as any;
    const plan = u.planId ? db.getPlanById(u.planId as string) : null;
    return { ...safe, plan };
  });

  return res.json({ users: safeUsers });
});

// Manual User Creation
adminRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, planId, durationDays } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const expiryDays = durationDays ? Number(durationDays) : 30;
    const planExpiresAt = planId ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : null;

    const newUser: User = {
      _id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: (role === 'admin' ? 'admin' : 'user'),
      planId: planId || 'plan_basic_30',
      planExpiresAt,
      searchesThisWeek: 0,
      weekResetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      wishlist: [],
      isActive: true,
      settings: {
        theme: 'light',
        defaultPreviewText: 'The quick brown fox jumps over the lazy dog',
        defaultFontSize: 32,
        autoCheckUpdates: true
      },
      createdAt: new Date().toISOString()
    };

    (newUser as any).passwordHash = passwordHash;
    db.addUser(newUser);

    const { passwordHash: _, ...safeUser } = newUser as any;
    return res.status(201).json({
      user: { ...safeUser, plan: db.getPlanById(newUser.planId as string) }
    });
  } catch (err: any) {
    console.error('Error creating user manually:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Manual Plan Assignment
adminRouter.put('/users/:id/plan', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planId, durationDays } = req.body;

    const user = db.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (planId) {
      const plan = db.getPlanById(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
    }

    const days = durationDays ? Number(durationDays) : 30;
    const planExpiresAt = planId ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

    const updatedUser = db.updateUser(id, {
      planId: planId || null,
      planExpiresAt,
      searchesThisWeek: 0, // Reset usage on plan assignment
      weekResetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const { passwordHash: _, ...safeUser } = updatedUser as any;
    const plan = updatedUser?.planId ? db.getPlanById(updatedUser.planId as string) : null;

    return res.json({
      message: 'Plan successfully assigned to user',
      user: { ...safeUser, plan }
    });
  } catch (err: any) {
    console.error('Error assigning plan:', err);
    return res.status(500).json({ error: 'Failed to assign plan' });
  }
});

// Toggle User Status (Activate / Suspend)
adminRouter.put('/users/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedUser = db.updateUser(id, { isActive: Boolean(isActive) });
  const { passwordHash: _, ...safeUser } = updatedUser as any;
  return res.json({ user: safeUser });
});

// Delete User
adminRouter.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.role === 'admin' && user.email === 'admin@fontastic.io') {
    return res.status(400).json({ error: 'Cannot delete primary root administrator account' });
  }

  db.deleteUser(id);
  return res.json({ message: 'User deleted successfully', userId: id });
});

// AI Engine Settings (Admin configuration for Gemini Vision API)
adminRouter.get('/ai-settings', (_req: Request, res: Response) => {
  const storedKey = db.getSystemSetting('geminiApiKey') || process.env.GEMINI_API_KEY || '';
  const isConfigured = Boolean(storedKey && storedKey.length > 5);
  const maskedKey = isConfigured
    ? storedKey.slice(0, 8) + '••••••••••••••••' + storedKey.slice(-4)
    : '';

  return res.json({
    isConfigured,
    maskedKey,
    hasServerEnvKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

adminRouter.post('/ai-settings', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  const cleanKey = (apiKey || '').trim();
  db.setSystemSetting('geminiApiKey', cleanKey);
  console.log('[Admin] Updated system Gemini API key, length:', cleanKey.length);

  return res.json({
    message: cleanKey ? 'Gemini API Key saved and activated system-wide' : 'Gemini API Key cleared',
    isConfigured: Boolean(cleanKey && cleanKey.length > 5)
  });
});

adminRouter.post('/ai-settings/test', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  const keyToTest = (apiKey || '').trim() || db.getSystemSetting('geminiApiKey') || process.env.GEMINI_API_KEY;

  if (!keyToTest) {
    return res.status(400).json({ error: 'No API key provided or configured' });
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: keyToTest });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond with the word OK if you can read this.'
    });

    return res.json({
      success: true,
      message: 'Google Gemini 3.6 Flash API Key is valid and connected!',
      reply: response.text?.trim()
    });
  } catch (err: any) {
    console.error('Gemini test error:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to authenticate with Google Gemini API'
    });
  }
});

// Update Admin Profile, Name, Email, and Password
adminRouter.put('/profile', async (req: Request, res: Response) => {
  const currentUserId = (req as any).user?._id;
  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = db.getUserById(currentUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email, currentPassword, newPassword } = req.body;

  // If changing password, verify current password
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to change password' });
    }
    const userHash = (user as any).passwordHash || '';
    const isValid = await bcrypt.compare(currentPassword, userHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password does not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    db.updateUser(currentUserId, { passwordHash: newHash } as any);
  }

  const updates: Partial<User> = {};
  if (name && name.trim()) updates.name = name.trim();
  if (email && email.trim() && email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = db.getUserByEmail(email.trim());
    if (existing && existing._id !== currentUserId) {
      return res.status(400).json({ error: 'Email is already in use by another user' });
    }
    updates.email = email.trim().toLowerCase();
  }

  const updatedUser = db.updateUser(currentUserId, updates) || user;
  const safeUser = { ...(updatedUser as any) };
  delete safeUser.passwordHash;

  return res.json({
    message: 'Admin profile updated successfully',
    user: safeUser
  });
});

