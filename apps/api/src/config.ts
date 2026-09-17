import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try multiple .env locations (apps/api/.env, project root, etc.)
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), 'apps/api/.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config(); // fallback default

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'fontastic_super_secret_jwt_key_2026',
  mongoUri: process.env.MONGODB_URI || '',
  isProduction: process.env.NODE_ENV === 'production',
  dataPath: path.resolve(__dirname, '../../data/fontastic-db.json'),
};
