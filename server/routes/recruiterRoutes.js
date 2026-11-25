import express from 'express';
import { store } from '../store.js';
import { requireRecruiter, requireVerifiedRecruiter } from '../auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();

function formatDateTime(iso) {
  return iso ? iso.slice(0, 16).replace('T', ' ') : null;
}

router.get('/dashboard', requireRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const myOpps = store.opportunities.filter((o) => o.recruiter_id === rp.id);
  const oppIds = new Set(myOpps.map((o) => o.id));

  const apps = store.applications.filter((a) => oppIds.has(a.opportunity_id));
  const shortlisted = apps.filter((a) =>
    ['shortlisted', 'interview_scheduled', 'selected'].includes(a.status)
  ).length;

  const interviews = store.interviews
    .filter((i) => i.recruiter_id === rp.id)
    .sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time))
    .slice(0, 5);

  return res.json({
    recruiter_profile: {
      id: rp.id,
      full_name: rp.full_name,
      company_name: rp.company_name,
      is_verified: rp.is_verified,
      verification_notes: rp.verification_notes,
    },
    stats: {
      active_listings: myOpps.filter((o) => o.is_active).length,
      total_listings: myOpps.length,
      total_applications: apps.length,
      shortlisted_candidates: shortlisted,
      scheduled_interviews: interviews.length,
    },
    recent_interviews: interviews.map((i) => {
      const student = store.studentProfiles.find((s) => s.id === i.student_id);
      return {
        id: i.id,
        student_name: student ? student.full_name : 'Candidate',
        scheduled_time: i.scheduled_time,
        interview_type: i.interview_type,
        status: i.status,
        meeting_link: i.meeting_link,
      };
    }),
  });
});

router.get('/opportunities', requireRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const opps = store.opportunities
    .filter((o) => o.recruiter_id === rp.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return res.json(
    opps.map((o) => ({
      id: o.id,
      title: o.title,
      company: o.company,
      opportunity_type: o.opportunity_type,
      work_mode: o.work_mode,
      location: o.location,
      stipend_or_salary: o.stipend_or_salary,
      deadline: o.deadline,
      is_active: o.is_active,
      verification_status: o.verification_status,
      application_count: store.applications.filter((a) => a.opportunity_id === o.id).length,
      required_skills: store.getOpportunityRequirements(o.id).map((r) => r.skill_name),
    }))
  );
});

router.post('/opportunities', requireVerifiedRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const {
    title,
    description,
    opportunity_type = 'internship',
    work_mode = 'remote',
    location = 'Remote',
    stipend_or_salary = null,
    eligibility = null,
    deadline = null,
    application_link = null,
    required_skills = [],
  } = req.body || {};

  if (!title || title.trim().length < 2 || !description || description.trim().length < 10) {
    return res.status(400).json({ detail: 'Valid title and description (min 10 chars) are required.' });
  }

  const opp = store.createOpportunity({
    recruiter_id: rp.id,
    title: title.trim(),
    company: rp.company_name,
    description: description.trim(),
    opportunity_type,
    work_mode,
    location: location ? location.trim() : 'Remote',
    stipend_or_salary,
    eligibility,
    deadline,
    application_link,
    verification_status: 'verified',
    source: `Verified Recruiter (${rp.company_name})`,
    is_active: true,
  });

  for (const s of required_skills) {
    if (s && s.trim()) {
      store.createOpportunityRequirement({
        opportunity_id: opp.id,
        skill_name: s.trim(),
        is_mandatory: true,
      });
    }
  }

  return res.json({ message: 'Opportunity published successfully.', opportunity_id: opp.id });
});

router.put('/opportunities/:oppId', requireVerifiedRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const oppId = parseInt(req.params.oppId, 10);
  const opp = store.opportunities.find((o) => o.id === oppId && o.recruiter_id === rp.id);
  if (!opp) {
    return res.status(404).json({ detail: 'Opportunity not found or unauthorized.' });
  }
  const allowed = [
    'title', 'description', 'opportunity_type', 'work_mode', 'location',
    'stipend_or_salary', 'eligibility', 'deadline', 'application_link', 'is_active',
  ];
  for (const k of allowed) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, k)) {
      opp[k] = req.body[k];
    }
  }
  return res.json({ message: 'Opportunity updated successfully.' });
});

router.get('/applications', requireRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const myOppIds = new Set(store.opportunities.filter((o) => o.recruiter_id === rp.id).map((o) => o.id));
  if (myOppIds.size === 0) return res.json([]);

  let apps = store.applications.filter((a) => myOppIds.has(a.opportunity_id));
  if (req.query.opportunity_id) {
    const filterId = parseInt(req.query.opportunity_id, 10);
    apps = apps.filter((a) => a.opportunity_id === filterId);
  }
  apps.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

  const results = apps.map((a) => {
    const student = store.studentProfiles.find((s) => s.id === a.student_id);
    const opp = store.opportunities.find((o) => o.id === a.opportunity_id);
    const reqSkills = store.getOpportunityRequirements(opp.id).map((r) => r.skill_name);
    const studentSkills = student ? store.getStudentSkills(student.id).map((s) => s.skill_name) : [];
    const matched = reqSkills.filter((s) =>
      studentSkills.some((sk) => s.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(s.toLowerCase()))
    );
    const matchPct = reqSkills.length ? Math.round((matched.length / reqSkills.length) * 100) : 50;

    return {
      application_id: a.id,
      opportunity_id: opp.id,
      opportunity_title: opp.title,
      student_id: student ? student.id : a.student_id,
      student_name: student ? student.full_name : 'Candidate',
      college: student ? student.college : null,
      course_branch: student ? student.course_branch : null,
      graduation_year: student ? student.graduation_year : null,
      readiness_score: student ? student.readiness_score : 0,
      status: a.status,
      applied_at: formatDateTime(a.applied_at),
      match_percentage: matchPct,
      matched_skills: matched,
    };
  });

  return res.json(results);
});

router.get('/applicants/:appId', requireRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const appId = parseInt(req.params.appId, 10);
  const app = store.applications.find((a) => {
    if (a.id !== appId) return false;
    const opp = store.opportunities.find((o) => o.id === a.opportunity_id);
    return opp && opp.recruiter_id === rp.id;
  });

  if (!app) {
    return res.status(403).json({
      detail: 'Access restricted: Candidate details are only accessible for candidates who have applied to your openings.',
    });
  }

  const student = store.studentProfiles.find((s) => s.id === app.student_id);
  const skills = store.getStudentSkills(student.id);
  const projects = store.projects.filter((p) => p.student_id === student.id);
  const certs = store.certifications.filter((c) => c.student_id === student.id);

  return res.json({
    application_id: app.id,
    status: app.status,
    notes: app.notes,
    candidate: {
      id: student.id,
      full_name: student.full_name,
      college: student.college,
      course_branch: student.course_branch,
      graduation_year: student.graduation_year,
      bio: student.bio,
      readiness_score: student.readiness_score,
      readiness_level: student.readiness_level,
      skills: skills.map((s) => ({
        name: s.skill_name,
        category: s.category,
        proficiency: s.proficiency_level,
        source: s.source,
      })),
      projects: projects.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies_used,
        url: p.project_url,
      })),
      certifications: certs.map((c) => ({
        title: c.title,
        organization: c.issuing_organization,
        url: c.certificate_url,
      })),
    },
  });
});

router.patch('/applications/:appId/status', requireRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const appId = parseInt(req.params.appId, 10);
  const app = store.applications.find((a) => {
    if (a.id !== appId) return false;
    const opp = store.opportunities.find((o) => o.id === a.opportunity_id);
    return opp && opp.recruiter_id === rp.id;
  });

  if (!app) {
    return res.status(404).json({ detail: 'Application not found or unauthorized.' });
  }

  const { status, notes } = req.body || {};
  app.status = status;
  if (notes) app.notes = notes;
  app.updated_at = new Date().toISOString();

  const student = store.studentProfiles.find((s) => s.id === app.student_id);
  const opp = store.opportunities.find((o) => o.id === app.opportunity_id);
  const statusDisplay = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (student && opp) {
    NotificationService.sendNotification({
      userId: student.user_id,
      title: `Application Update: ${statusDisplay}`,
      message: `Your application status for '${opp.title}' has been updated to: ${statusDisplay}.`,
      notificationType: 'info',
      actionLink: '#student/applications',
    });
  }

  return res.json({ message: `Candidate status updated to ${status}.` });
});

router.post('/interviews', requireRecruiter, (req, res) => {
  const rp = store.getRecruiterProfileByUserId(req.user.id);
  const {
    application_id,
    scheduled_time,
    duration_minutes = 45,
    meeting_link = null,
    interview_type = 'technical',
    notes = null,
  } = req.body || {};

  const app = store.applications.find((a) => {
    if (a.id !== parseInt(application_id, 10)) return false;
    const opp = store.opportunities.find((o) => o.id === a.opportunity_id);
    return opp && opp.recruiter_id === rp.id;
  });

  if (!app) {
    return res.status(404).json({ detail: 'Application not found.' });
  }

  const interview = store.createInterview({
    application_id: app.id,
    student_id: app.student_id,
    recruiter_id: rp.id,
    scheduled_time,
    duration_minutes,
    meeting_link,
    interview_type,
    notes,
    status: 'scheduled',
  });

  app.status = 'interview_scheduled';
  app.updated_at = new Date().toISOString();

  const student = store.studentProfiles.find((s) => s.id === app.student_id);
  const opp = store.opportunities.find((o) => o.id === app.opportunity_id);
  const timeStr = new Date(scheduled_time).toUTCString();

  if (student && opp) {
    NotificationService.sendNotification({
      userId: student.user_id,
      title: 'Interview Scheduled!',
      message: `${rp.company_name} scheduled a ${interview_type} interview for '${opp.title}' on ${timeStr}.`,
      notificationType: 'success',
      actionLink: '#student/applications',
    });
  }

  return res.json({ message: 'Interview scheduled successfully.', interview_id: interview.id });
});

export default router;
