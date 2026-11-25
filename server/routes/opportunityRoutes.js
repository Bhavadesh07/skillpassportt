import express from 'express';
import { store } from '../store.js';
import { getOptionalCurrentUser, requireStudent } from '../auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : null;
}

function formatDateTime(iso) {
  return iso ? iso.slice(0, 16).replace('T', ' ') : null;
}

router.get('/', getOptionalCurrentUser, (req, res) => {
  const { type, mode, query } = req.query;
  let list = store.opportunities.filter(
    (o) => o.is_active && o.verification_status === 'verified'
  );

  if (type && type !== 'all') {
    list = list.filter((o) => o.opportunity_type === type);
  }
  if (mode && mode !== 'all') {
    list = list.filter((o) => o.work_mode === mode);
  }
  if (query && query.trim()) {
    const term = query.trim().toLowerCase();
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(term) ||
        o.company.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        o.location.toLowerCase().includes(term)
    );
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  let studentSkillsSet = new Set();
  const savedAppMap = {};
  if (req.user && req.user.role === 'student') {
    const sp = store.getStudentProfileByUserId(req.user.id);
    if (sp) {
      studentSkillsSet = new Set(store.getStudentSkills(sp.id).map((s) => s.skill_name.toLowerCase().trim()));
      const apps = store.applications.filter((a) => a.student_id === sp.id);
      for (const a of apps) savedAppMap[a.opportunity_id] = a.status;
    }
  }

  const results = list.map((opp) => {
    const reqSkills = store.getOpportunityRequirements(opp.id).map((r) => r.skill_name);
    const matched = [];
    const missing = [];
    for (const rSkill of reqSkills) {
      const rLower = rSkill.toLowerCase().trim();
      let isMatch = false;
      for (const s of studentSkillsSet) {
        if (rLower.includes(s) || s.includes(rLower)) {
          isMatch = true;
          break;
        }
      }
      if (isMatch) matched.push(rSkill);
      else missing.push(rSkill);
    }

    const matchPct = reqSkills.length ? Math.round((matched.length / reqSkills.length) * 100) : 50;

    return {
      id: opp.id,
      title: opp.title,
      company: opp.company,
      description: opp.description,
      opportunity_type: opp.opportunity_type,
      work_mode: opp.work_mode,
      location: opp.location,
      stipend_or_salary: opp.stipend_or_salary,
      eligibility: opp.eligibility,
      deadline: opp.deadline,
      application_link: opp.application_link,
      source: opp.source,
      verification_status: opp.verification_status,
      last_verified_at: formatDate(opp.last_verified_at),
      required_skills: reqSkills,
      match_metrics: {
        match_percentage: studentSkillsSet.size > 0 ? matchPct : null,
        matched_skills: matched,
        missing_skills: missing,
      },
      application_status: savedAppMap[opp.id] || null,
    };
  });

  return res.json(results);
});

router.get('/tracker/my-applications', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const apps = store.applications
    .filter((a) => a.student_id === sp.id)
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

  const results = apps.map((a) => {
    const opp = store.opportunities.find((o) => o.id === a.opportunity_id);
    const interviews = store.interviews
      .filter((i) => i.application_id === a.id)
      .map((i) => ({
        id: i.id,
        scheduled_time: i.scheduled_time,
        duration_minutes: i.duration_minutes,
        meeting_link: i.meeting_link,
        interview_type: i.interview_type,
        status: i.status,
      }));

    return {
      application_id: a.id,
      opportunity_id: opp ? opp.id : a.opportunity_id,
      title: opp ? opp.title : 'Opportunity',
      company: opp ? opp.company : '',
      opportunity_type: opp ? opp.opportunity_type : 'internship',
      work_mode: opp ? opp.work_mode : 'remote',
      location: opp ? opp.location : '',
      stipend_or_salary: opp ? opp.stipend_or_salary : null,
      deadline: opp ? opp.deadline : null,
      status: a.status,
      notes: a.notes,
      applied_at: formatDateTime(a.applied_at),
      interviews,
    };
  });

  const counts = {
    total: results.length,
    saved: results.filter((r) => r.status === 'saved').length,
    applied: results.filter((r) => r.status === 'applied').length,
    under_review: results.filter((r) => r.status === 'under_review').length,
    shortlisted: results.filter((r) => r.status === 'shortlisted').length,
    interview_scheduled: results.filter((r) => r.status === 'interview_scheduled').length,
    selected: results.filter((r) => r.status === 'selected').length,
    rejected: results.filter((r) => r.status === 'rejected').length,
  };

  return res.json({ applications: results, summary: counts });
});

router.patch('/tracker/applications/:appId', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const appId = parseInt(req.params.appId, 10);
  const app = store.applications.find((a) => a.id === appId && a.student_id === sp.id);
  if (!app) {
    return res.status(404).json({ detail: 'Application not found.' });
  }
  const { status, notes } = req.body || {};
  if (status) app.status = status;
  if (notes !== undefined) app.notes = notes;
  app.updated_at = new Date().toISOString();
  return res.json({ message: 'Application tracker updated successfully.' });
});

router.get('/:oppId', getOptionalCurrentUser, (req, res) => {
  const oppId = parseInt(req.params.oppId, 10);
  const opp = store.opportunities.find((o) => o.id === oppId);
  if (!opp || !opp.is_active) {
    return res.status(404).json({ detail: 'Opportunity not found or expired.' });
  }

  const reqSkills = store.getOpportunityRequirements(opp.id).map((r) => r.skill_name);
  let studentSkillsSet = new Set();
  let appStatus = null;
  if (req.user && req.user.role === 'student') {
    const sp = store.getStudentProfileByUserId(req.user.id);
    if (sp) {
      studentSkillsSet = new Set(store.getStudentSkills(sp.id).map((s) => s.skill_name.toLowerCase().trim()));
      const existingApp = store.applications.find((a) => a.student_id === sp.id && a.opportunity_id === opp.id);
      if (existingApp) appStatus = existingApp.status;
    }
  }

  const matched = reqSkills.filter((s) =>
    Array.from(studentSkillsSet).some((sk) => s.toLowerCase().includes(sk) || sk.includes(s.toLowerCase()))
  );
  const missing = reqSkills.filter((s) => !matched.includes(s));
  const matchPct = reqSkills.length ? Math.round((matched.length / reqSkills.length) * 100) : 50;

  return res.json({
    id: opp.id,
    title: opp.title,
    company: opp.company,
    description: opp.description,
    opportunity_type: opp.opportunity_type,
    work_mode: opp.work_mode,
    location: opp.location,
    stipend_or_salary: opp.stipend_or_salary,
    eligibility: opp.eligibility,
    deadline: opp.deadline,
    application_link: opp.application_link,
    source: opp.source,
    verification_status: opp.verification_status,
    last_verified_at: formatDate(opp.last_verified_at),
    required_skills: reqSkills,
    match_percentage: studentSkillsSet.size > 0 ? matchPct : null,
    matched_skills: matched,
    missing_skills: missing,
    application_status: appStatus,
  });
});

router.post('/:oppId/apply', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const oppId = parseInt(req.params.oppId, 10);
  const opp = store.opportunities.find((o) => o.id === oppId && o.is_active);
  if (!opp) {
    return res.status(404).json({ detail: 'Opportunity not found.' });
  }

  const notes = req.body ? req.body.notes : null;
  let app = store.applications.find((a) => a.student_id === sp.id && a.opportunity_id === opp.id);
  if (app) {
    app.status = 'applied';
    if (notes) app.notes = notes;
    app.updated_at = new Date().toISOString();
  } else {
    app = store.createApplication({
      student_id: sp.id,
      opportunity_id: opp.id,
      status: 'applied',
      notes,
    });
  }

  NotificationService.sendNotification({
    userId: req.user.id,
    title: 'Application Recorded',
    message: `Application for '${opp.title}' at ${opp.company} recorded to your tracker.`,
    notificationType: 'success',
    actionLink: '#student/applications',
  });

  if (opp.recruiter_id) {
    const recruiter = store.recruiterProfiles.find((r) => r.id === opp.recruiter_id);
    if (recruiter) {
      NotificationService.sendNotification({
        userId: recruiter.user_id,
        title: 'New Candidate Application',
        message: `${sp.full_name} applied for your '${opp.title}' opening.`,
        notificationType: 'info',
        actionLink: '#recruiter/applicants',
      });
    }
  }

  return res.json({ message: 'Application submitted and tracked successfully.', application_id: app.id });
});

router.post('/:oppId/save', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const oppId = parseInt(req.params.oppId, 10);
  const opp = store.opportunities.find((o) => o.id === oppId && o.is_active);
  if (!opp) {
    return res.status(404).json({ detail: 'Opportunity not found.' });
  }

  const existing = store.applications.find((a) => a.student_id === sp.id && a.opportunity_id === opp.id);
  if (!existing) {
    store.createApplication({
      student_id: sp.id,
      opportunity_id: opp.id,
      status: 'saved',
    });
  }

  return res.json({ message: 'Opportunity saved to your application tracker.' });
});

export default router;
