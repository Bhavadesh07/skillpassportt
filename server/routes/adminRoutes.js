import fs from 'fs';
import path from 'path';
import express from 'express';
import { store } from '../store.js';
import { settings } from '../config.js';
import { requireAdmin } from '../auth.js';
import { DocumentParserService } from '../services/documentParser.js';
import { AIService } from '../services/aiService.js';

const router = express.Router();

function formatDateTime(iso) {
  return iso ? iso.slice(0, 16).replace('T', ' ') : null;
}

function formatDateTimeSec(iso) {
  return iso ? iso.slice(0, 19).replace('T', ' ') : null;
}

function dirSizeBytes(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(full);
    else if (entry.isFile()) total += fs.statSync(full).size;
  }
  return total;
}

router.get('/stats', requireAdmin, (req, res) => {
  const totalStudents = store.users.filter((u) => u.role === 'student').length;
  const totalRecruiters = store.users.filter((u) => u.role === 'recruiter').length;
  const verifiedRecruiters = store.recruiterProfiles.filter((r) => r.is_verified).length;
  const totalResumes = store.resumes.length;
  const completedAnalyses = store.resumeAnalyses.filter((a) => a.status === 'completed').length;
  const failedJobs = store.resumes.filter((r) => r.upload_status === 'failed').length;
  const activeOpportunities = store.opportunities.filter((o) => o.is_active).length;
  const totalApplications = store.applications.length;
  const activeUsers = store.users.filter((u) => u.is_active).length;

  let aiStatus, aiMode;
  if (settings.AI_API_KEY && settings.AI_API_KEY.length > 5) {
    aiStatus = `Active - Google Gemini (${settings.AI_MODEL})`;
    aiMode = 'Cloud LLM';
  } else {
    aiStatus = 'Active - Local Semantic Parser (Dev Mode)';
    aiMode = 'Local NLP';
  }

  const storageMb = Math.round((dirSizeBytes(settings.STORAGE_DIR) / (1024 * 1024)) * 100) / 100;

  return res.json({
    metrics: {
      total_students: totalStudents,
      total_recruiters: totalRecruiters,
      verified_recruiters: verifiedRecruiters,
      total_resumes: totalResumes,
      completed_ai_analyses: completedAnalyses,
      failed_processing_jobs: failedJobs,
      active_opportunities: activeOpportunities,
      total_applications: totalApplications,
      active_users: activeUsers,
    },
    system_health: {
      status: 'Operational',
      database_engine: 'Node.js In-Memory Store',
      ai_service_status: aiStatus,
      ai_mode: aiMode,
      storage_provider: settings.STORAGE_PROVIDER,
      storage_usage_mb: storageMb,
      storage_path: settings.STORAGE_DIR,
    },
  });
});

router.get('/users', requireAdmin, (req, res) => {
  const { role, query } = req.query;
  let users = [...store.users];
  if (role && role !== 'all') {
    users = users.filter((u) => u.role === role);
  }
  if (query && query.trim()) {
    const term = query.trim().toLowerCase();
    users = users.filter((u) => u.email.toLowerCase().includes(term));
  }
  users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  users = users.slice(0, 100);

  return res.json(
    users.map((u) => {
      let name = u.email;
      let extra = {};
      if (u.role === 'student') {
        const sp = store.getStudentProfileByUserId(u.id);
        if (sp) {
          name = sp.full_name;
          const selectedRole = sp.selected_role_id
            ? store.careerRoles.find((r) => r.id === sp.selected_role_id)
            : null;
          extra = {
            college: sp.college,
            readiness_score: sp.readiness_score,
            selected_role: selectedRole ? selectedRole.title : null,
          };
        }
      } else if (u.role === 'recruiter') {
        const rp = store.getRecruiterProfileByUserId(u.id);
        if (rp) {
          name = rp.full_name;
          extra = {
            company: rp.company_name,
            is_verified: rp.is_verified,
            official_email: rp.official_email,
          };
        }
      } else if (u.role === 'admin') {
        name = 'Super Admin (Owner)';
      }

      return {
        id: u.id,
        email: u.email,
        name,
        role: u.role,
        is_active: u.is_active,
        is_verified: u.is_verified,
        created_at: formatDateTime(u.created_at),
        extra,
      };
    })
  );
});

router.patch('/users/:userId/status', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = store.getUserById(userId);
  if (!user) {
    return res.status(404).json({ detail: 'User not found.' });
  }

  const { is_active, is_verified, verification_notes } = req.body || {};
  if (user.email.toLowerCase() === settings.OWNER_EMAIL.toLowerCase() && is_active === false) {
    return res.status(400).json({ detail: 'Cannot deactivate the website owner account.' });
  }

  if (is_active !== undefined && is_active !== null) user.is_active = Boolean(is_active);
  if (is_verified !== undefined && is_verified !== null) {
    user.is_verified = Boolean(is_verified);
    const rp = store.getRecruiterProfileByUserId(user.id);
    if (rp) {
      rp.is_verified = Boolean(is_verified);
      if (verification_notes) rp.verification_notes = verification_notes;
    }
  }

  store.createAuditLog({
    user_id: req.user.id,
    action: 'USER_STATUS_UPDATED',
    resource_type: 'user',
    resource_id: String(user.id),
    details: { email: user.email, is_active: user.is_active, is_verified: user.is_verified },
    ip_address: req.ip || null,
  });

  return res.json({ message: 'User status updated successfully.' });
});

router.get('/resumes/monitor', requireAdmin, (req, res) => {
  const resumes = [...store.resumes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50);

  return res.json(
    resumes.map((r) => {
      const sp = store.studentProfiles.find((s) => s.id === r.student_id);
      const analysis = store.resumeAnalyses.find((a) => a.resume_id === r.id);
      return {
        id: r.id,
        student_id: r.student_id,
        student_name: sp ? sp.full_name : 'Unknown',
        file_name: r.file_name,
        file_size: r.file_size,
        file_type: r.file_type,
        page_count: r.page_count,
        upload_status: r.upload_status,
        error_message: r.error_message,
        ai_provider: analysis ? analysis.ai_provider_used : null,
        created_at: formatDateTimeSec(r.created_at),
      };
    })
  );
});

router.post('/resumes/:resumeId/retry', requireAdmin, async (req, res) => {
  const resumeId = parseInt(req.params.resumeId, 10);
  const resume = store.resumes.find((r) => r.id === resumeId);
  if (!resume) {
    return res.status(404).json({ detail: 'Resume not found.' });
  }
  if (!resume.file_path || !fs.existsSync(resume.file_path)) {
    return res.status(400).json({ detail: 'Underlying resume file missing on storage disk.' });
  }

  try {
    const fileBytes = fs.readFileSync(resume.file_path);
    const { extractedText, pageCount } = await DocumentParserService.parseDocument(fileBytes, resume.file_name);
    resume.extracted_text = extractedText;
    resume.page_count = pageCount;
    resume.upload_status = 'parsed';
    resume.error_message = null;

    const aiResult = await AIService.analyzeResume(extractedText);
    const existing = store.resumeAnalyses.find((a) => a.resume_id === resume.id);
    if (existing) {
      existing.personal_info = aiResult.personal_info;
      existing.technical_skills = aiResult.technical_skills;
      existing.other_info = aiResult.other_info;
      existing.quality_analysis = aiResult.quality_analysis;
      existing.ai_provider_used = aiResult.ai_provider_used;
      existing.status = 'completed';
    } else {
      store.createResumeAnalysis({
        resume_id: resume.id,
        student_id: resume.student_id,
        personal_info: aiResult.personal_info,
        technical_skills: aiResult.technical_skills,
        other_info: aiResult.other_info,
        quality_analysis: aiResult.quality_analysis,
        ai_provider_used: aiResult.ai_provider_used,
        status: 'completed',
      });
    }

    return res.json({ message: 'Resume processing retried and completed successfully.' });
  } catch (err) {
    resume.upload_status = 'failed';
    resume.error_message = err.message;
    return res.status(500).json({ detail: `Retry failed: ${err.message}` });
  }
});

router.get('/career-roles', requireAdmin, (req, res) => {
  const roles = [...store.careerRoles].sort((a, b) => a.title.localeCompare(b.title));
  return res.json(
    roles.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      description: r.description,
      is_active: r.is_active,
      requirements: store.getRoleRequirements(r.id).map((rq) => ({
        id: rq.id,
        skill_name: rq.skill_name,
        type: rq.requirement_type,
        weight: rq.weight,
      })),
    }))
  );
});

router.post('/career-roles', requireAdmin, (req, res) => {
  const {
    title,
    slug,
    description,
    category = 'Engineering',
    required_skills = [],
    preferred_skills = [],
    related_skills = [],
  } = req.body || {};

  if (!title || !description) {
    return res.status(400).json({ detail: 'Title and description are required.' });
  }
  const existing = store.careerRoles.find((r) => r.title.toLowerCase() === title.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ detail: 'A role with this title already exists.' });
  }

  const role = store.createCareerRole({
    title: title.trim(),
    slug: (slug || title).trim().toLowerCase(),
    category,
    description: description.trim(),
    is_active: true,
  });

  for (const s of required_skills) {
    if (s && s.trim()) store.createRoleRequirement({ role_id: role.id, skill_name: s.trim(), requirement_type: 'required', weight: 1.8 });
  }
  for (const s of preferred_skills) {
    if (s && s.trim()) store.createRoleRequirement({ role_id: role.id, skill_name: s.trim(), requirement_type: 'preferred', weight: 1.2 });
  }
  for (const s of related_skills) {
    if (s && s.trim()) store.createRoleRequirement({ role_id: role.id, skill_name: s.trim(), requirement_type: 'related', weight: 0.6 });
  }

  return res.json({ message: 'Career role created successfully.', role_id: role.id });
});

router.delete('/career-roles/:roleId', requireAdmin, (req, res) => {
  const roleId = parseInt(req.params.roleId, 10);
  const idx = store.careerRoles.findIndex((r) => r.id === roleId);
  if (idx === -1) {
    return res.status(404).json({ detail: 'Role not found.' });
  }
  store.careerRoles.splice(idx, 1);
  store.roleRequirements = store.roleRequirements.filter((rq) => rq.role_id !== roleId);
  return res.json({ message: 'Career role deleted.' });
});

router.get('/audit-logs', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  const logs = [...store.auditLogs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

  return res.json(
    logs.map((l) => {
      const user = l.user_id ? store.getUserById(l.user_id) : null;
      return {
        id: l.id,
        action: l.action,
        resource_type: l.resource_type,
        resource_id: l.resource_id,
        user_email: user ? user.email : 'System',
        details: l.details,
        ip_address: l.ip_address,
        timestamp: formatDateTimeSec(l.created_at),
      };
    })
  );
});

router.get('/settings', requireAdmin, (req, res) => {
  return res.json(
    store.platformSettings.map((s) => ({
      key: s.setting_key,
      value: s.setting_value,
      description: s.description,
    }))
  );
});

router.put('/settings', requireAdmin, (req, res) => {
  const { setting_key, setting_value, description } = req.body || {};
  if (!setting_key) {
    return res.status(400).json({ detail: 'setting_key is required.' });
  }
  const existing = store.platformSettings.find((s) => s.setting_key === setting_key);
  if (!existing) {
    store.createPlatformSetting({
      setting_key,
      setting_value: String(setting_value ?? ''),
      description: description || null,
      updated_by_user_id: req.user.id,
    });
  } else {
    existing.setting_value = String(setting_value ?? '');
    if (description) existing.description = description;
    existing.updated_by_user_id = req.user.id;
    existing.updated_at = new Date().toISOString();
  }
  return res.json({ message: 'Platform setting updated.' });
});

export default router;
