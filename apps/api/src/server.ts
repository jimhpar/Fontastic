import express from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './modules/auth/auth.controller';
import { plansRouter } from './modules/plans/plans.controller';
import { adminRouter } from './modules/admin/admin.controller';
import { fontsRouter } from './modules/fonts/fonts.controller';
import { visionRouter } from './modules/vision/vision.controller';
import { usersRouter } from './modules/users/users.controller';

import { connectMongoDB } from './db/mongo';

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Fontastic API',
    timestamp: new Date().toISOString()
  });
});

// Mount modular routers
app.use('/api/auth', authRouter);
app.use('/api/plans', plansRouter);
app.use('/api/admin', adminRouter);
app.use('/api/fonts', fontsRouter);
app.use('/api/vision', visionRouter);
app.use('/api/user', usersRouter);

app.listen(config.port, async () => {
  console.log(`[Fontastic API] Server running on http://localhost:${config.port}`);
  if (config.mongoUri) {
    await connectMongoDB(config.mongoUri);
  } else {
    console.log('[MongoDB] Awaiting MONGODB_URI in apps/api/.env to sync online.');
  }
});

export default app;
