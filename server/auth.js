import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { settings } from './config.js';
import { store } from './store.js';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `${salt}$${key.toString('hex')}`;
}

export function verifyPassword(plainPassword, hashedPassword) {
  try {
    if (!hashedPassword || !hashedPassword.includes('$')) return false;
    const idx = hashedPassword.indexOf('$');
    const salt = hashedPassword.slice(0, idx);
    const keyHex = hashedPassword.slice(idx + 1);
    const computedKey = crypto.pbkdf2Sync(plainPassword, salt, 100000, 32, 'sha256');
    const expectedBuf = Buffer.from(keyHex, 'hex');
    if (computedKey.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(computedKey, expectedBuf);
  } catch {
    return false;
  }
}

export function createAccessToken(data, expiresInMinutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES) {
  return jwt.sign(data, settings.SECRET_KEY, {
    algorithm: settings.ALGORITHM,
    expiresIn: expiresInMinutes * 60,
  });
}

export function decodeToken(token) {
  try {
    return jwt.verify(token, settings.SECRET_KEY, { algorithms: [settings.ALGORITHM] });
  } catch {
    return null;
  }
}

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function getCurrentUser(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }
  const payload = decodeToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ detail: 'Invalid or expired authentication token.' });
  }
  const userId = parseInt(payload.sub, 10);
  const user = store.getUserById(userId);
  if (!user || !user.is_active) {
    return res.status(401).json({ detail: 'User account is deactivated or not found.' });
  }
  req.user = user;
  next();
}

export function getOptionalCurrentUser(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  const payload = decodeToken(token);
  if (!payload || !payload.sub) {
    req.user = null;
    return next();
  }
  const userId = parseInt(payload.sub, 10);
  const user = store.getUserById(userId);
  req.user = user && user.is_active ? user : null;
  next();
}

export function requireStudent(req, res, next) {
  getCurrentUser(req, res, () => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ detail: 'Access restricted: Student account required.' });
    }
    next();
  });
}

export function requireRecruiter(req, res, next) {
  getCurrentUser(req, res, () => {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ detail: 'Access restricted: Recruiter account required.' });
    }
    next();
  });
}

export function requireVerifiedRecruiter(req, res, next) {
  getCurrentUser(req, res, () => {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ detail: 'Access restricted: Recruiter account required.' });
    }
    const rp = store.getRecruiterProfileByUserId(req.user.id);
    if (!rp || !rp.is_verified) {
      return res.status(403).json({
        detail: 'Recruiter verification pending. Once approved by the Super Admin, hiring actions will be unlocked.',
      });
    }
    next();
  });
}

export function requireAdmin(req, res, next) {
  getCurrentUser(req, res, () => {
    if (req.user.role !== 'admin' || req.user.email.toLowerCase() !== settings.OWNER_EMAIL.toLowerCase()) {
      return res.status(403).json({ detail: 'Access Denied: Exclusive Super Admin privileges required.' });
    }
    next();
  });
}
