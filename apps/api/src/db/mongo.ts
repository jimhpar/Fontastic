import mongoose, { Schema } from 'mongoose';
import { db } from './storage';

// 1. User Schema
const UserSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  planId: { type: String, default: null },
  planExpiresAt: { type: String, default: null },
  searchesThisWeek: { type: Number, default: 0 },
  weekResetAt: { type: String, default: null },
  wishlist: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  settings: {
    theme: { type: String, default: 'light' },
    defaultPreviewText: { type: String, default: 'The quick brown fox jumps over the lazy dog' },
    defaultFontSize: { type: Number, default: 32 },
    autoCheckUpdates: { type: Boolean, default: true }
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

export const UserModel = mongoose.model('User', UserSchema);

// 2. Subscription Plan Schema
const PlanSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  priceBDT: { type: Number, required: true },
  period: { type: String, default: 'month' },
  searchesPerWeek: { type: Number, default: null },
  features: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

export const PlanModel = mongoose.model('Plan', PlanSchema);

// 3. Font Item Schema
const FontSchema = new Schema({
  _id: { type: String, required: true },
  family: { type: String, required: true, index: true },
  category: { type: String, required: true },
  subsets: { type: [String], default: [] },
  variants: { type: [String], default: [] },
  files: { type: Map, of: String },
  downloadUrl: { type: String },
  source: { type: String, required: true },
  license: { type: String },
  tags: { type: [String], default: [] },
  features: { type: Schema.Types.Mixed }
}, { _id: false });

export const FontModel = mongoose.model('Font', FontSchema);

// 4. Search History Schema
const SearchHistorySchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  sourceDevice: { type: String, default: 'desktop' },
  detectedText: { type: String, default: '' },
  previewImage: { type: String },
  matchedFonts: { type: Schema.Types.Mixed, default: [] },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

export const SearchHistoryModel = mongoose.model('SearchHistory', SearchHistorySchema);

// 5. System Settings Schema (for Gemini API keys, sync status, etc.)
const SystemSettingSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

export const SystemSettingModel = mongoose.model('SystemSetting', SystemSettingSchema);

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected;
}

/**
 * Connect to MongoDB Atlas and synchronize local data online.
 */
export async function connectMongoDB(uri: string): Promise<boolean> {
  if (!uri) {
    console.warn('[MongoDB] No MONGODB_URI provided. Running in local JSON database mode.');
    return false;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    isConnected = true;
    console.log('[MongoDB] Successfully connected to MongoDB Atlas cluster!');

    // Automatically sync initial seed & local data to Atlas
    await syncLocalDataToMongo();

    return true;
  } catch (err: any) {
    console.error('[MongoDB] Connection error:', err.message);
    isConnected = false;
    return false;
  }
}

/**
 * Synchronize local users, plans, fonts, and settings to MongoDB Atlas
 * so online database is immediately populated with current accounts and settings.
 */
async function syncLocalDataToMongo() {
  try {
    // 1. Sync Plans
    const planCount = await PlanModel.countDocuments();
    if (planCount === 0) {
      console.log('[MongoDB Sync] Seeding subscription plans to MongoDB Atlas...');
      const localPlans = db.getPlans();
      for (const p of localPlans) {
        await PlanModel.findByIdAndUpdate(p._id, p, { upsert: true });
      }
    }

    // 2. Sync Users (Admin, Test User, etc.)
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB Sync] Seeding users and admin accounts to MongoDB Atlas...');
      const localUsers = db.getUsers();
      for (const u of localUsers) {
        await UserModel.findByIdAndUpdate(u._id, u, { upsert: true });
      }
    }

    // 3. Sync System Settings (Gemini API key, etc.)
    const localKey = db.getSystemSetting('geminiApiKey');
    if (localKey) {
      await SystemSettingModel.findOneAndUpdate(
        { key: 'geminiApiKey' },
        { key: 'geminiApiKey', value: localKey, updatedAt: new Date().toISOString() },
        { upsert: true }
      );
    }

    console.log('[MongoDB Sync] Database sync completed. All users, plans, and AI settings are live in the cloud.');
  } catch (err: any) {
    console.warn('[MongoDB Sync] Warning during sync:', err.message);
  }
}

// Live real-time cloud sync listener
db.onDbChange(async (entity, action, payload) => {
  if (!isConnected) return;
  try {
    if (entity === 'user') {
      if (action === 'create' || action === 'update') {
        await UserModel.findByIdAndUpdate(payload._id, payload, { upsert: true });
      } else if (action === 'delete') {
        await UserModel.findByIdAndDelete(payload.id);
      }
    } else if (entity === 'plan') {
      if (action === 'create' || action === 'update') {
        await PlanModel.findByIdAndUpdate(payload._id, payload, { upsert: true });
      } else if (action === 'delete') {
        await PlanModel.findByIdAndDelete(payload.id);
      }
    } else if (entity === 'systemSetting') {
      await SystemSettingModel.findOneAndUpdate(
        { key: payload.key },
        { key: payload.key, value: payload.value, updatedAt: new Date().toISOString() },
        { upsert: true }
      );
    } else if (entity === 'history') {
      await SearchHistoryModel.findByIdAndUpdate(payload._id, payload, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB Live Sync Error]:', err.message);
  }
});

