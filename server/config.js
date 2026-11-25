import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const BASE_DIR = path.resolve(__dirname, '..');

// Load .env manually if present without external dependency
function loadEnvFile() {
  const envPath = path.join(BASE_DIR, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const idx = line.indexOf('=');
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile();

const isVercel = Boolean(process.env.VERCEL);
const defaultStorageDir = isVercel
  ? path.join(os.tmpdir(), 'skill-passport', 'resumes')
  : path.resolve(BASE_DIR, process.env.STORAGE_DIR || 'storage/resumes');

export const settings = {
  PROJECT_NAME: 'SKILL PASSPORT',
  VERSION: '1.0.0',
  API_V1_STR: '/api/v1',
  OWNER_EMAIL: (process.env.OWNER_EMAIL || 'owner@skillpassport.ai').toLowerCase().trim(),
  OWNER_BOOTSTRAP_SECRET: process.env.OWNER_BOOTSTRAP_SECRET || 'SkillPassportOwner2026!Bootstrap',
  SECRET_KEY: process.env.SECRET_KEY || 'dev-secret-key-skill-passport-2026-super-secure-jwt-token',
  ALGORITHM: 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10),
  AI_API_KEY: (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim(),
  AI_MODEL: process.env.AI_MODEL || 'gemini-2.5-flash',
  AI_BASE_URL: process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  STORAGE_DIR: defaultStorageDir,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_EXTENSIONS: new Set(['.pdf', '.docx']),
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT || '3000', 10),
};

try {
  fs.mkdirSync(settings.STORAGE_DIR, { recursive: true });
} catch (err) {
  console.warn('[Skill Passport] Could not create storage directory:', err?.message || err);
}
