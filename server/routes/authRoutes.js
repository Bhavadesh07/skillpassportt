import crypto from 'crypto';
import express from 'express';
import { store } from '../store.js';
import { settings } from '../config.js';
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  getCurrentUser,
} from '../auth.js';

const router = express.Router();
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

router.post('/register-student', (req, res) => {
  const { full_name, email, password, college, course_branch, graduation_year } = req.body || {};
  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ detail: 'Full name must be at least 2 characters.' });
  }
  const emailClean = (email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(emailClean)) {
    return res.status(400).json({ detail: 'Invalid email format.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ detail: 'Password must be at least 6 characters.' });
  }
  if (store.getUserByEmail(emailClean)) {
    return res.status(400).json({ detail: 'An account with this email address already exists.' });
  }

  const user = store.createUser({
    email: emailClean,
    password_hash: hashPassword(password),
    role: 'student',
    is_active: true,
    is_verified: true,
  });

  const studentProfile = store.createStudentProfile({
    user_id: user.id,
    full_name: full_name.trim(),
    college: college ? college.trim() : null,
    course_branch: course_branch ? course_branch.trim() : null,
    graduation_year: graduation_year || null,
    experience_level: 'Beginner',
    career_goal: 'Internship',
    preparation_timeline: '3 months',
  });

  store.createAuditLog({
    user_id: user.id,
    action: 'STUDENT_REGISTERED',
    resource_type: 'user',
    resource_id: String(user.id),
    details: { email: user.email, name: full_name },
    ip_address: req.ip || null,
  });

  const accessToken = createAccessToken({ sub: String(user.id), role: user.role, email: user.email });
  return res.json({
    access_token: accessToken,
    token_type: 'bearer',
    role: user.role,
    user_id: user.id,
    email: user.email,
    full_name: studentProfile.full_name,
  });
});

router.post('/register-recruiter', (req, res) => {
  const {
    full_name,
    official_email,
    password,
    company_name,
    company_website,
    designation,
    company_description,
  } = req.body || {};

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ detail: 'Full name must be at least 2 characters.' });
  }
  const emailClean = (official_email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(emailClean)) {
    return res.status(400).json({ detail: 'Invalid official email format.' });
  }
  if (!company_name || company_name.trim().length < 2) {
    return res.status(400).json({ detail: 'Company name is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ detail: 'Password must be at least 6 characters.' });
  }
  if (store.getUserByEmail(emailClean)) {
    return res.status(400).json({ detail: 'An account with this official email address already exists.' });
  }

  const user = store.createUser({
    email: emailClean,
    password_hash: hashPassword(password),
    role: 'recruiter',
    is_active: true,
    is_verified: false,
  });

  const recruiterProfile = store.createRecruiterProfile({
    user_id: user.id,
    full_name: full_name.trim(),
    official_email: emailClean,
    company_name: company_name.trim(),
    company_website: company_website ? company_website.trim() : null,
    designation: designation ? designation.trim() : null,
    company_description: company_description ? company_description.trim() : null,
    is_verified: false,
  });

  store.createAuditLog({
    user_id: user.id,
    action: 'RECRUITER_REGISTERED',
    resource_type: 'user',
    resource_id: String(user.id),
    details: { email: user.email, company: company_name },
    ip_address: req.ip || null,
  });

  const accessToken = createAccessToken({ sub: String(user.id), role: user.role, email: user.email });
  return res.json({
    access_token: accessToken,
    token_type: 'bearer',
    role: user.role,
    user_id: user.id,
    email: user.email,
    full_name: recruiterProfile.full_name,
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const emailClean = (email || '').trim().toLowerCase();
  const user = store.getUserByEmail(emailClean);

  if (!user || !verifyPassword(password || '', user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }
  if (!user.is_active) {
    return res.status(403).json({ detail: 'Account is suspended. Please contact platform administration.' });
  }

  let fullName = null;
  if (user.role === 'student') {
    const sp = store.getStudentProfileByUserId(user.id);
    fullName = sp ? sp.full_name : null;
  } else if (user.role === 'recruiter') {
    const rp = store.getRecruiterProfileByUserId(user.id);
    fullName = rp ? rp.full_name : null;
  } else if (user.role === 'admin') {
    fullName = 'Platform Owner';
  }

  const accessToken = createAccessToken({ sub: String(user.id), role: user.role, email: user.email });
  return res.json({
    access_token: accessToken,
    token_type: 'bearer',
    role: user.role,
    user_id: user.id,
    email: user.email,
    full_name: fullName,
  });
});

router.post('/owner-bootstrap', (req, res) => {
  const { email, bootstrap_secret, password } = req.body || {};
  const emailClean = (email || '').trim().toLowerCase();

  if (emailClean !== settings.OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({ detail: 'Provided email does not match the configured website owner address.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ detail: 'Owner password must be at least 8 characters.' });
  }

  const secretA = Buffer.from(bootstrap_secret || '', 'utf-8');
  const secretB = Buffer.from(settings.OWNER_BOOTSTRAP_SECRET || '', 'utf-8');
  if (secretA.length !== secretB.length || !crypto.timingSafeEqual(secretA, secretB)) {
    return res.status(403).json({ detail: 'Invalid owner bootstrap secret.' });
  }

  let user = store.getUserByEmail(emailClean);
  if (!user) {
    user = store.createUser({
      email: emailClean,
      password_hash: hashPassword(password),
      role: 'admin',
      is_active: true,
      is_verified: true,
    });
    store.createOwnerAccount({
      user_id: user.id,
      bootstrap_secret_hash: hashPassword(bootstrap_secret),
      is_bootstrapped: true,
    });
  } else {
    user.password_hash = hashPassword(password);
    user.role = 'admin';
    user.is_active = true;
    user.is_verified = true;
  }

  store.createAuditLog({
    user_id: user.id,
    action: 'OWNER_BOOTSTRAPPED',
    resource_type: 'owner',
    resource_id: String(user.id),
    details: { status: 'Owner account initialized successfully' },
    ip_address: req.ip || null,
  });

  const accessToken = createAccessToken({ sub: String(user.id), role: 'admin', email: user.email });
  return res.json({
    access_token: accessToken,
    token_type: 'bearer',
    role: 'admin',
    user_id: user.id,
    email: user.email,
    full_name: 'Platform Owner',
  });
});

router.post('/forgot-password', (req, res) => {
  const emailClean = ((req.body && req.body.email) || '').trim().toLowerCase();
  const user = store.getUserByEmail(emailClean);
  if (!user) {
    return res.json({
      message: 'If this email exists in our records, password reset instructions have been sent.',
    });
  }
  const token = crypto.randomBytes(24).toString('base64url');
  return res.json({
    message: 'Password reset token generated successfully. In production, this link is dispatched to your registered email.',
    dev_reset_token: token,
    email: user.email,
  });
});

router.post('/reset-password', (req, res) => {
  const { email, new_password } = req.body || {};
  const user = store.getUserByEmail((email || '').trim().toLowerCase());
  if (!user || !new_password || new_password.length < 6) {
    return res.status(400).json({ detail: 'Invalid request.' });
  }
  user.password_hash = hashPassword(new_password);
  return res.json({ message: 'Password has been successfully updated. You may now log in.' });
});

router.get('/me', getCurrentUser, (req, res) => {
  const u = req.user;
  const profileData = {
    id: u.id,
    email: u.email,
    role: u.role,
    is_active: u.is_active,
    is_verified: u.is_verified,
    created_at: u.created_at,
  };

  if (u.role === 'student') {
    const sp = store.getStudentProfileByUserId(u.id);
    if (sp) {
      const selectedRole = sp.selected_role_id
        ? store.careerRoles.find((r) => r.id === sp.selected_role_id)
        : null;
      profileData.student_profile = {
        id: sp.id,
        full_name: sp.full_name,
        college: sp.college,
        course_branch: sp.course_branch,
        graduation_year: sp.graduation_year,
        bio: sp.bio,
        phone: sp.phone,
        experience_level: sp.experience_level,
        career_goal: sp.career_goal,
        preparation_timeline: sp.preparation_timeline,
        readiness_score: sp.readiness_score,
        readiness_level: sp.readiness_level,
        selected_role_id: sp.selected_role_id,
        selected_role_title: selectedRole ? selectedRole.title : null,
      };
    }
  } else if (u.role === 'recruiter') {
    const rp = store.getRecruiterProfileByUserId(u.id);
    if (rp) {
      profileData.recruiter_profile = {
        id: rp.id,
        full_name: rp.full_name,
        official_email: rp.official_email,
        company_name: rp.company_name,
        company_website: rp.company_website,
        designation: rp.designation,
        is_verified: rp.is_verified,
        verification_notes: rp.verification_notes,
      };
    }
  }

  return res.json(profileData);
});

export default router;
