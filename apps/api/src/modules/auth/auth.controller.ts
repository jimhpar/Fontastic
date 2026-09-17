import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../../db/storage';
import { config } from '../../config';
import { AuthenticatedRequest, authenticateToken } from './auth.middleware';
import { User } from '@fontastic/shared-types';

export const authRouter = Router();

// Ensure initial admin user exists
const initAdmin = async () => {
  const adminEmail = 'admin@fontastic.io';
  const existing = db.getUserByEmail(adminEmail);
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin123!', salt);
    const adminUser: User = {
      _id: 'user_admin_super',
      name: 'Fontastic Administrator',
      email: adminEmail,
      role: 'admin',
      planId: 'plan_unlimited_300',
      planExpiresAt: null,
      searchesThisWeek: 0,
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
    (adminUser as any).passwordHash = passwordHash;
    db.addUser(adminUser);
    console.log('Default admin seeded: admin@fontastic.io / Admin123!');
  }
};
initAdmin();

// Ensure initial test subscriber user exists
const initTestUser = async () => {
  const testEmail = 'user@fontastic.io';
  const existing = db.getUserByEmail(testEmail);
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('User123!', salt);
    const testUser: User = {
      _id: 'user_test_subscriber',
      name: 'Alex Designer (Pro Test User)',
      email: testEmail,
      role: 'user',
      planId: 'plan_unlimited_300', // Pro Unlimited plan (300 TK)
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      searchesThisWeek: 0,
      wishlist: ['font_akira_expanded', 'font_plus_jakarta_sans', 'font_bodoni_moda'],
      isActive: true,
      settings: {
        theme: 'light',
        defaultPreviewText: 'The quick brown fox jumps over the lazy dog',
        defaultFontSize: 32,
        autoCheckUpdates: true
      },
      createdAt: new Date().toISOString()
    };
    (testUser as any).passwordHash = passwordHash;
    db.addUser(testUser);
    console.log('Default test subscriber seeded: user@fontastic.io / User123!');
  }
};
initTestUser();

// Register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      _id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'user',
      planId: 'plan_basic_30', // Defaults to Basic
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

    const token = jwt.sign({ userId: newUser._id }, config.jwtSecret, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = newUser as any;

    return res.status(201).json({
      token,
      user: safeUser,
      plan: db.getPlanById(newUser.planId as string)
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, (user as any).passwordHash || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user as any;
    const plan = user.planId ? db.getPlanById(user.planId as string) : null;

    return res.json({
      token,
      user: safeUser,
      plan
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get Current User Profile
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { passwordHash: _, ...safeUser } = user as any;
  const plan = user.planId ? db.getPlanById(user.planId as string) : null;

  return res.json({
    user: safeUser,
    plan
  });
});

// Update Settings
authRouter.put('/settings', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { theme, defaultPreviewText, defaultFontSize, autoCheckUpdates } = req.body;
  const currentSettings = req.user!.settings || {
    theme: 'light',
    defaultPreviewText: 'The quick brown fox jumps over the lazy dog',
    defaultFontSize: 32,
    autoCheckUpdates: true
  };

  const updatedSettings = {
    ...currentSettings,
    ...(theme ? { theme } : {}),
    ...(defaultPreviewText ? { defaultPreviewText } : {}),
    ...(defaultFontSize ? { defaultFontSize: Number(defaultFontSize) } : {}),
    ...(autoCheckUpdates !== undefined ? { autoCheckUpdates: Boolean(autoCheckUpdates) } : {})
  };

  const updatedUser = db.updateUser(req.user!._id, { settings: updatedSettings });
  const { passwordHash: _, ...safeUser } = updatedUser as any;
  return res.json({ user: safeUser });
});
