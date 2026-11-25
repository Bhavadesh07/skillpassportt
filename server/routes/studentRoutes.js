import fs from 'fs';
import path from 'path';
import express from 'express';
import multer from 'multer';
import { store } from '../store.js';
import { settings } from '../config.js';
import { requireStudent, getOptionalCurrentUser } from '../auth.js';
import { DocumentParserService, DocumentParseError } from '../services/documentParser.js';
import { AIService } from '../services/aiService.js';
import { CareerEngine } from '../services/careerEngine.js';
import { RoadmapEngine } from '../services/roadmapEngine.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: settings.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

router.post('/upload-resume', requireStudent, upload.single('file'), async (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(400).json({ detail: 'Student profile not found.' });
  }
  if (!req.file) {
    return res.status(400).json({ detail: 'No resume file uploaded.' });
  }

  const fileName = req.file.originalname || 'resume.pdf';
  const fileBytes = req.file.buffer;

  let ext;
  try {
    ext = DocumentParserService.validateFile(fileName, fileBytes, settings.MAX_FILE_SIZE_MB);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }

  const studentDir = path.join(settings.STORAGE_DIR, `student_${student.id}`);
  fs.mkdirSync(studentDir, { recursive: true });
  const safeName = path.basename(fileName).replace(/\s+/g, '_');
  const targetPath = path.join(studentDir, safeName);
  fs.writeFileSync(targetPath, fileBytes);

  let extractedText, pageCount;
  try {
    const parsed = await DocumentParserService.parseDocument(fileBytes, fileName);
    extractedText = parsed.extractedText;
    pageCount = parsed.pageCount;
  } catch (err) {
    store.createResume({
      student_id: student.id,
      file_name: fileName,
      file_path: targetPath,
      file_size: fileBytes.length,
      file_type: ext,
      upload_status: 'failed',
      error_message: err instanceof DocumentParseError ? err.message : String(err),
    });
    NotificationService.sendNotification({
      userId: req.user.id,
      title: 'Resume Processing Failed',
      message: `Extraction error for '${fileName}': ${err.message}`,
      notificationType: 'error',
      actionLink: '#student/resume',
    });
    return res.status(400).json({ detail: err.message });
  }

  const resumeRecord = store.createResume({
    student_id: student.id,
    file_name: fileName,
    file_path: targetPath,
    file_size: fileBytes.length,
    file_type: ext,
    extracted_text: extractedText,
    page_count: pageCount,
    upload_status: 'parsed',
  });

  const aiResult = await AIService.analyzeResume(extractedText);

  const analysisRecord = store.createResumeAnalysis({
    resume_id: resumeRecord.id,
    student_id: student.id,
    personal_info: aiResult.personal_info,
    technical_skills: aiResult.technical_skills,
    other_info: aiResult.other_info,
    quality_analysis: aiResult.quality_analysis,
    ai_provider_used: aiResult.ai_provider_used || 'Local Semantic Parser',
    status: 'completed',
  });

  const techSkills = aiResult.technical_skills || {};
  const allExtracted = [];
  for (const [cat, skillsList] of Object.entries(techSkills)) {
    for (const s of skillsList || []) {
      allExtracted.push([s, cat]);
    }
  }

  const existingSkills = new Set(
    store.getStudentSkills(student.id).map((s) => s.skill_name.toLowerCase())
  );
  for (const [sName, cat] of allExtracted) {
    if (!existingSkills.has(sName.toLowerCase())) {
      existingSkills.add(sName.toLowerCase());
      store.createStudentSkill({
        student_id: student.id,
        skill_name: sName,
        category: cat,
        source: 'resume_extracted',
        proficiency_level: 'Intermediate',
        verified: true,
      });
    }
  }

  const pInfo = aiResult.personal_info || {};
  if (pInfo.phone && pInfo.phone !== 'Not found in resume' && !student.phone) {
    student.phone = pInfo.phone;
  }
  if (pInfo.college && pInfo.college !== 'Not found in resume' && !student.college) {
    student.college = pInfo.college;
  }
  if (pInfo.degree && pInfo.degree !== 'Not found in resume' && !student.course_branch) {
    student.course_branch = pInfo.degree;
  }

  NotificationService.sendNotification({
    userId: req.user.id,
    title: 'Resume Analysis Completed',
    message: `Successfully analyzed '${fileName}'. Found ${allExtracted.length} technical competencies and quality recommendations.`,
    notificationType: 'success',
    actionLink: '#student/analysis',
  });

  return res.json({
    resume_id: resumeRecord.id,
    file_name: resumeRecord.file_name,
    page_count: resumeRecord.page_count,
    upload_status: resumeRecord.upload_status,
    analysis: {
      personal_info: analysisRecord.personal_info,
      technical_skills: analysisRecord.technical_skills,
      other_info: analysisRecord.other_info,
      quality_analysis: analysisRecord.quality_analysis,
      ai_provider_used: analysisRecord.ai_provider_used,
    },
  });
});

router.get('/resume', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  const resumes = store.resumes
    .filter((r) => r.student_id === student.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const resume = resumes[0];
  if (!resume) {
    return res.json({ has_resume: false, resume: null, analysis: null });
  }
  const analysis = store.resumeAnalyses.find((a) => a.resume_id === resume.id) || null;
  return res.json({
    has_resume: true,
    resume: {
      id: resume.id,
      file_name: resume.file_name,
      file_size: resume.file_size,
      file_type: resume.file_type,
      page_count: resume.page_count,
      upload_status: resume.upload_status,
      created_at: resume.created_at,
    },
    analysis: analysis
      ? {
          personal_info: analysis.personal_info,
          technical_skills: analysis.technical_skills,
          other_info: analysis.other_info,
          quality_analysis: analysis.quality_analysis,
          ai_provider_used: analysis.ai_provider_used,
          created_at: analysis.created_at,
        }
      : null,
  });
});

router.delete('/resume', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  const studentResumes = store.resumes.filter((r) => r.student_id === student.id);
  const resumeIds = new Set(studentResumes.map((r) => r.id));

  for (const r of studentResumes) {
    if (r.file_path && fs.existsSync(r.file_path)) {
      try {
        fs.unlinkSync(r.file_path);
      } catch {
        // ignore cleanup error
      }
    }
  }
  store.resumes = store.resumes.filter((r) => r.student_id !== student.id);
  store.resumeAnalyses = store.resumeAnalyses.filter((a) => !resumeIds.has(a.resume_id));

  return res.json({ message: 'Resume removed successfully. You may now upload a fresh document.' });
});

router.get('/career-roles', getOptionalCurrentUser, (req, res) => {
  const roles = store.careerRoles.filter((r) => r.is_active);
  return res.json(
    roles.map((r) => {
      const reqs = store.getRoleRequirements(r.id);
      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category,
        description: r.description,
        core_skills: reqs.filter((rq) => rq.requirement_type === 'required').slice(0, 4).map((rq) => rq.skill_name),
      };
    })
  );
});

router.post('/select-role', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  const {
    role_id,
    custom_role_title,
    experience_level = 'Beginner',
    career_goal = 'Internship',
    preparation_timeline = '3 months',
  } = req.body || {};

  let role = null;
  if (role_id) {
    role = store.careerRoles.find((r) => r.id === parseInt(role_id, 10)) || null;
  } else if (custom_role_title && custom_role_title.trim()) {
    const clean = custom_role_title.trim();
    role = store.careerRoles.find((r) => r.title.toLowerCase() === clean.toLowerCase()) || null;
    if (!role) {
      role = store.createCareerRole({
        title: clean,
        slug: clean.toLowerCase().replace(/\s+/g, '-'),
        category: 'Specialized Domain',
        description: `Custom career path for ${clean}`,
        is_active: true,
      });
    }
  }

  if (!role) {
    return res.status(400).json({ detail: 'Please select a valid career role.' });
  }

  student.selected_role_id = role.id;
  student.experience_level = experience_level;
  student.career_goal = career_goal;
  student.preparation_timeline = preparation_timeline;

  const studentSkills = store.getStudentSkills(student.id).map((s) => s.skill_name);
  const requirements = store.getRoleRequirements(role.id);

  const evalResult = CareerEngine.evaluateRoleCompatibility({
    studentSkills,
    role,
    requirements,
    experienceLevel: experience_level,
    careerGoal: career_goal,
    preparationTimeline: preparation_timeline,
  });

  student.readiness_score = evalResult.compatibility_score;
  student.readiness_level = evalResult.career_readiness;

  const roadmap = RoadmapEngine.generateRoadmap({
    student,
    role,
    missingSkills: evalResult.missing_skills,
  });

  const activities = store.roadmapActivities.filter((a) => a.roadmap_id === roadmap.id);
  NotificationService.sendNotification({
    userId: req.user.id,
    title: `Career Roadmap Generated for ${role.title}`,
    message: `Career compatibility evaluated at ${evalResult.compatibility_score}%. Your personalized ${activities.length}-phase learning roadmap is ready.`,
    notificationType: 'success',
    actionLink: '#student/roadmap',
  });

  return res.json({
    role_selection: {
      role_id: role.id,
      role_title: role.title,
      experience_level: student.experience_level,
      career_goal: student.career_goal,
      preparation_timeline: student.preparation_timeline,
    },
    compatibility: evalResult,
    roadmap_id: roadmap.id,
  });
});

router.get('/career-analysis', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  if (!student.selected_role_id) {
    return res.json({ has_selected_role: false, analysis: null });
  }

  const role = store.careerRoles.find((r) => r.id === student.selected_role_id);
  if (!role) {
    return res.json({ has_selected_role: false, analysis: null });
  }

  const studentSkills = store.getStudentSkills(student.id).map((s) => s.skill_name);
  const requirements = store.getRoleRequirements(role.id);
  const evalResult = CareerEngine.evaluateRoleCompatibility({
    studentSkills,
    role,
    requirements,
    experienceLevel: student.experience_level || 'Beginner',
    careerGoal: student.career_goal || 'Internship',
    preparationTimeline: student.preparation_timeline || '3 months',
  });

  return res.json({
    has_selected_role: true,
    role: {
      id: role.id,
      title: role.title,
      category: role.category,
      description: role.description,
    },
    student_preferences: {
      experience_level: student.experience_level,
      career_goal: student.career_goal,
      preparation_timeline: student.preparation_timeline,
    },
    analysis: evalResult,
  });
});

router.get('/roadmap', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  const roadmaps = store.learningRoadmaps
    .filter((r) => r.student_id === student.id && r.is_active)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const roadmap = roadmaps[0];
  if (!roadmap) {
    return res.json({ has_roadmap: false, roadmap: null });
  }

  const role = store.careerRoles.find((r) => r.id === roadmap.career_role_id);
  const activities = store.roadmapActivities
    .filter((a) => a.roadmap_id === roadmap.id)
    .sort((a, b) => a.order_index - b.order_index);

  return res.json({
    has_roadmap: true,
    roadmap: {
      id: roadmap.id,
      title: roadmap.title,
      summary: roadmap.summary,
      role_title: role ? role.title : '',
      total_phases: roadmap.total_phases,
      completed_phases: roadmap.completed_phases,
      progress_percentage: roadmap.progress_percentage,
      activities: activities.map((a) => ({
        id: a.id,
        phase_number: a.phase_number,
        phase_title: a.phase_title,
        topic: a.topic,
        description: a.description,
        learning_objective: a.learning_objective,
        estimated_duration: a.estimated_duration,
        recommended_resources: a.recommended_resources,
        practical_task: a.practical_task,
        is_completed: a.is_completed,
        completed_at: a.completed_at,
        order_index: a.order_index,
      })),
    },
  });
});

router.patch('/roadmap/activity/:activityId', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  const activityId = parseInt(req.params.activityId, 10);
  const { is_completed } = req.body || {};

  try {
    const { activity, roadmap } = RoadmapEngine.updateActivityStatus({
      activityId,
      isCompleted: Boolean(is_completed),
      studentId: student.id,
    });
    return res.json({
      activity_id: activity.id,
      is_completed: activity.is_completed,
      completed_at: activity.completed_at,
      roadmap_progress: {
        progress_percentage: roadmap.progress_percentage,
        completed_phases: roadmap.completed_phases,
        total_phases: roadmap.total_phases,
      },
    });
  } catch (err) {
    return res.status(404).json({ detail: err.message });
  }
});

router.post('/roadmap/regenerate', requireStudent, (req, res) => {
  const student = store.getStudentProfileByUserId(req.user.id);
  if (!student.selected_role_id) {
    return res.status(400).json({ detail: 'No career role selected yet.' });
  }

  const role = store.careerRoles.find((r) => r.id === student.selected_role_id);
  const studentSkills = store.getStudentSkills(student.id).map((s) => s.skill_name);
  const requirements = store.getRoleRequirements(role.id);
  const evalResult = CareerEngine.evaluateRoleCompatibility({
    studentSkills,
    role,
    requirements,
    experienceLevel: student.experience_level || 'Beginner',
    careerGoal: student.career_goal || 'Internship',
    preparationTimeline: student.preparation_timeline || '3 months',
  });

  const roadmap = RoadmapEngine.generateRoadmap({
    student,
    role,
    missingSkills: evalResult.missing_skills,
  });

  return res.json({ message: 'Roadmap regenerated successfully.', roadmap_id: roadmap.id });
});

router.get('/profile', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const skills = store.getStudentSkills(sp.id);
  const projects = store.projects.filter((p) => p.student_id === sp.id);
  const certs = store.certifications.filter((c) => c.student_id === sp.id);
  const selectedRole = sp.selected_role_id
    ? store.careerRoles.find((r) => r.id === sp.selected_role_id)
    : null;

  return res.json({
    id: sp.id,
    full_name: sp.full_name,
    email: req.user.email,
    college: sp.college,
    course_branch: sp.course_branch,
    graduation_year: sp.graduation_year,
    bio: sp.bio,
    phone: sp.phone,
    linkedin_url: sp.linkedin_url,
    github_url: sp.github_url,
    experience_level: sp.experience_level,
    career_goal: sp.career_goal,
    preparation_timeline: sp.preparation_timeline,
    readiness_score: sp.readiness_score,
    readiness_level: sp.readiness_level,
    selected_role: selectedRole ? { id: selectedRole.id, title: selectedRole.title } : null,
    resume_skills: skills
      .filter((s) => s.source === 'resume_extracted')
      .map((s) => ({ id: s.id, name: s.skill_name, category: s.category, source: s.source, proficiency: s.proficiency_level })),
    manual_skills: skills
      .filter((s) => s.source === 'manual')
      .map((s) => ({
        id: s.id,
        name: s.skill_name,
        category: s.category,
        source: s.source,
        proficiency: s.proficiency_level,
        evidence: s.evidence_note,
      })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      technologies: p.technologies_used,
      url: p.project_url,
      source: p.source,
    })),
    certifications: certs.map((c) => ({
      id: c.id,
      title: c.title,
      organization: c.issuing_organization,
      date: c.issue_date,
      url: c.certificate_url,
      credential_id: c.credential_id,
    })),
  });
});

router.put('/profile', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const allowed = [
    'full_name', 'college', 'course_branch', 'graduation_year', 'bio',
    'phone', 'linkedin_url', 'github_url', 'experience_level', 'career_goal', 'preparation_timeline',
  ];
  for (const key of allowed) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
      sp[key] = req.body[key];
    }
  }
  sp.updated_at = new Date().toISOString();
  return res.json({ message: 'Profile updated successfully.' });
});

router.post('/skills', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const { skill_name, category = 'framework', proficiency_level = 'Intermediate', evidence_note = null } = req.body || {};
  if (!skill_name || !skill_name.trim()) {
    return res.status(400).json({ detail: 'Skill name is required.' });
  }
  const skill = store.createStudentSkill({
    student_id: sp.id,
    skill_name: skill_name.trim(),
    category,
    source: 'manual',
    proficiency_level,
    evidence_note,
    verified: true,
  });
  return res.json({
    message: 'Skill added.',
    skill: { id: skill.id, name: skill.skill_name, category: skill.category, source: skill.source },
  });
});

router.delete('/skills/:skillId', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const skillId = parseInt(req.params.skillId, 10);
  const idx = store.studentSkills.findIndex((s) => s.id === skillId && s.student_id === sp.id);
  if (idx === -1) {
    return res.status(404).json({ detail: 'Skill not found.' });
  }
  store.studentSkills.splice(idx, 1);
  return res.json({ message: 'Skill deleted.' });
});

router.post('/projects', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const { title, description = null, technologies_used = null, project_url = null } = req.body || {};
  if (!title || title.trim().length < 2) {
    return res.status(400).json({ detail: 'Project title is required.' });
  }
  store.createProject({
    student_id: sp.id,
    title: title.trim(),
    description,
    technologies_used,
    project_url,
    source: 'manual',
  });
  return res.json({ message: 'Project added successfully.' });
});

router.post('/certifications', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const { title, issuing_organization = null, issue_date = null, certificate_url = null, credential_id = null } = req.body || {};
  if (!title || title.trim().length < 2) {
    return res.status(400).json({ detail: 'Certification title is required.' });
  }
  store.createCertification({
    student_id: sp.id,
    title: title.trim(),
    issuing_organization,
    issue_date,
    certificate_url,
    credential_id,
    source: 'manual',
  });
  return res.json({ message: 'Certification added successfully.' });
});

router.get('/dashboard', requireStudent, (req, res) => {
  const sp = store.getStudentProfileByUserId(req.user.id);
  const resumes = store.resumes
    .filter((r) => r.student_id === sp.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestResume = resumes[0] || null;
  const activeRoadmap = store.learningRoadmaps.find((r) => r.student_id === sp.id && r.is_active) || null;

  const studentSkillsObjs = store.getStudentSkills(sp.id);
  const allSkills = studentSkillsObjs.map((s) => s.skill_name);
  const selectedRole = sp.selected_role_id
    ? store.careerRoles.find((r) => r.id === sp.selected_role_id)
    : null;

  let missingSkills = [];
  if (selectedRole) {
    const reqs = store.getRoleRequirements(selectedRole.id);
    const evalRes = CareerEngine.evaluateRoleCompatibility({
      studentSkills: allSkills,
      role: selectedRole,
      requirements: reqs,
      experienceLevel: sp.experience_level || 'Beginner',
      careerGoal: sp.career_goal || 'Internship',
      preparationTimeline: sp.preparation_timeline || '3 months',
    });
    missingSkills = (evalRes.missing_skills || []).slice(0, 5);
  }

  const opportunities = store.opportunities.filter((o) => o.is_active).slice(0, 4);
  const recommendedOpps = opportunities.map((opp) => {
    const reqSkills = store.getOpportunityRequirements(opp.id).map((r) => r.skill_name);
    const matched = reqSkills.filter((s) =>
      allSkills.some((sk) => s.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(s.toLowerCase()))
    );
    const matchPct = reqSkills.length ? Math.round((matched.length / reqSkills.length) * 100) : 50;
    return {
      id: opp.id,
      title: opp.title,
      company: opp.company,
      opportunity_type: opp.opportunity_type,
      work_mode: opp.work_mode,
      location: opp.location,
      stipend_or_salary: opp.stipend_or_salary,
      match_percentage: matchPct,
      matched_skills: matched,
    };
  });

  const notifications = NotificationService.getUserNotifications(req.user.id, 5);

  return res.json({
    student: {
      id: sp.id,
      full_name: sp.full_name,
      college: sp.college,
      readiness_score: sp.readiness_score,
      readiness_level: sp.readiness_level,
      selected_role: selectedRole ? selectedRole.title : null,
    },
    resume_status: {
      has_resume: latestResume !== null,
      file_name: latestResume ? latestResume.file_name : null,
      upload_status: latestResume ? latestResume.upload_status : null,
      uploaded_at: latestResume ? latestResume.created_at : null,
    },
    skills_summary: {
      total_skills: studentSkillsObjs.length,
      resume_extracted: studentSkillsObjs.filter((s) => s.source === 'resume_extracted').length,
      manual_added: studentSkillsObjs.filter((s) => s.source === 'manual').length,
      missing_skills: missingSkills,
    },
    roadmap_progress: {
      has_roadmap: activeRoadmap !== null,
      progress_percentage: activeRoadmap ? activeRoadmap.progress_percentage : 0.0,
      completed_phases: activeRoadmap ? activeRoadmap.completed_phases : 0,
      total_phases: activeRoadmap ? activeRoadmap.total_phases : 0,
    },
    recommended_opportunities: recommendedOpps,
    recent_notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.notification_type,
      is_read: n.is_read,
      created_at: n.created_at,
    })),
  });
});

export default router;
