import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { settings, BASE_DIR } from './server/config.js';
import { seedDatabase } from './server/store.js';
import { hashPassword } from './server/auth.js';

import authRoutes from './server/routes/authRoutes.js';
import studentRoutes from './server/routes/studentRoutes.js';
import opportunityRoutes from './server/routes/opportunityRoutes.js';
import recruiterRoutes from './server/routes/recruiterRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';

// Seed initial data on boot
seedDatabase(hashPassword);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API v1 Routes
const apiV1 = settings.API_V1_STR;
app.use(`${apiV1}/auth`, authRoutes);
app.use(`${apiV1}/student`, studentRoutes);
app.use(`${apiV1}/opportunities`, opportunityRoutes);
app.use(`${apiV1}/recruiter`, recruiterRoutes);
app.use(`${apiV1}/admin`, adminRoutes);
app.use(`${apiV1}/notifications`, notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: settings.PROJECT_NAME,
    version: settings.VERSION,
    ai_engine: settings.AI_API_KEY
      ? `Gemini (${settings.AI_MODEL})`
      : 'Local Semantic Parser (Dev Mode)',
  });
});

// Serve static frontend files at /static (matching index.html paths)
const frontendDir = path.join(BASE_DIR, 'frontend');
if (fs.existsSync(frontendDir)) {
  app.use('/static', express.static(frontendDir));
}

// Handle multer file size or upload errors cleanly
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ detail: `File exceeds maximum size of ${settings.MAX_FILE_SIZE_MB} MB.` });
  }
  if (err) {
    return res.status(err.status || 500).json({ detail: err.message || 'Internal Server Error' });
  }
  next();
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (
    req.path.startsWith('/api/') ||
    req.path.startsWith('/docs') ||
    req.path.startsWith('/openapi.json')
  ) {
    return res.status(404).json({ detail: 'Not Found' });
  }
  const indexFile = path.join(frontendDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  return res.status(404).json({ detail: 'Frontend index.html not found.' });
});

if (!process.env.VERCEL) {
  app.listen(settings.PORT, settings.HOST, () => {
    console.log(`[Skill Passport] Server running at http://${settings.HOST}:${settings.PORT}`);
  });
}

export default app;
