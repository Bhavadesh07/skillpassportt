import { settings } from './config.js';

export const CAREER_ROLES_DATA = [
  {
    title: 'Software Developer',
    slug: 'software-developer',
    category: 'Engineering',
    description: 'Designs, develops, tests, and maintains software applications and core algorithms.',
    requirements: [
      ['Python', 'required', 1.8],
      ['Java', 'required', 1.8],
      ['Data Structures', 'required', 2.0],
      ['Algorithms', 'required', 2.0],
      ['Git', 'required', 1.2],
      ['SQL', 'preferred', 1.2],
      ['Docker', 'preferred', 1.0],
      ['Unit Testing', 'preferred', 1.0],
      ['Linux', 'related', 0.8],
      ['CI/CD', 'related', 0.8],
    ],
  },
  {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Engineering',
    description: 'Builds both client-facing interfaces and server-side systems, APIs, and databases.',
    requirements: [
      ['JavaScript', 'required', 1.8],
      ['TypeScript', 'preferred', 1.2],
      ['React.js', 'required', 1.8],
      ['Node.js', 'required', 1.5],
      ['Python', 'preferred', 1.2],
      ['FastAPI', 'preferred', 1.2],
      ['PostgreSQL', 'required', 1.5],
      ['MongoDB', 'preferred', 1.0],
      ['Git', 'required', 1.2],
      ['REST APIs', 'required', 1.5],
      ['Tailwind CSS', 'preferred', 1.0],
      ['Docker', 'preferred', 1.0],
    ],
  },
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    category: 'Engineering',
    description: 'Creates responsive, accessible, interactive web interfaces and client experiences.',
    requirements: [
      ['HTML', 'required', 1.5],
      ['CSS', 'required', 1.5],
      ['JavaScript', 'required', 2.0],
      ['TypeScript', 'preferred', 1.5],
      ['React.js', 'required', 2.0],
      ['Tailwind CSS', 'required', 1.4],
      ['Next.js', 'preferred', 1.2],
      ['Git', 'required', 1.2],
      ['Figma', 'related', 0.8],
      ['Web Performance', 'preferred', 1.0],
    ],
  },
  {
    title: 'Backend Developer',
    slug: 'backend-developer',
    category: 'Engineering',
    description: 'Constructs robust server architectures, business logic, microservices, and databases.',
    requirements: [
      ['Python', 'required', 1.8],
      ['FastAPI', 'required', 1.5],
      ['SQL', 'required', 1.8],
      ['PostgreSQL', 'required', 1.8],
      ['Redis', 'preferred', 1.2],
      ['Docker', 'required', 1.5],
      ['Git', 'required', 1.2],
      ['REST APIs', 'required', 1.8],
      ['Microservices', 'preferred', 1.2],
      ['Linux', 'related', 1.0],
    ],
  },
  {
    title: 'Python Developer',
    slug: 'python-developer',
    category: 'Engineering',
    description: 'Builds backend services, automation scripts, data pipelines, and web tools with Python.',
    requirements: [
      ['Python', 'required', 2.0],
      ['Django', 'preferred', 1.5],
      ['FastAPI', 'required', 1.8],
      ['SQL', 'required', 1.5],
      ['PostgreSQL', 'preferred', 1.2],
      ['Git', 'required', 1.2],
      ['Docker', 'preferred', 1.0],
      ['Unit Testing', 'preferred', 1.2],
      ['AsyncIO', 'preferred', 1.2],
    ],
  },
  {
    title: 'Java Developer',
    slug: 'java-developer',
    category: 'Engineering',
    description: 'Develops enterprise-grade backends, microservices, and distributed applications in Java.',
    requirements: [
      ['Java', 'required', 2.0],
      ['Spring Boot', 'required', 2.0],
      ['SQL', 'required', 1.6],
      ['Hibernate', 'preferred', 1.4],
      ['PostgreSQL', 'preferred', 1.2],
      ['Docker', 'preferred', 1.2],
      ['Git', 'required', 1.2],
      ['Microservices', 'preferred', 1.4],
      ['REST APIs', 'required', 1.5],
    ],
  },
  {
    title: 'AI Engineer',
    slug: 'ai-engineer',
    category: 'Data & AI',
    description: 'Builds and deploys generative AI models, LLM pipelines, RAG systems, and AI microservices.',
    requirements: [
      ['Python', 'required', 2.0],
      ['Machine Learning', 'required', 1.8],
      ['Deep Learning', 'required', 1.8],
      ['PyTorch', 'required', 1.8],
      ['LLM', 'required', 1.8],
      ['LangChain', 'preferred', 1.4],
      ['FastAPI', 'required', 1.5],
      ['Docker', 'preferred', 1.2],
      ['Vector Databases', 'preferred', 1.2],
      ['TensorFlow', 'related', 1.0],
      ['HuggingFace', 'preferred', 1.4],
    ],
  },
  {
    title: 'Machine Learning Engineer',
    slug: 'ml-engineer',
    category: 'Data & AI',
    description: 'Designs ML architectures, trains predictive models, and automates production ML pipelines.',
    requirements: [
      ['Python', 'required', 2.0],
      ['Scikit-Learn', 'required', 1.8],
      ['PyTorch', 'required', 1.8],
      ['TensorFlow', 'preferred', 1.4],
      ['Machine Learning', 'required', 2.0],
      ['Pandas', 'required', 1.5],
      ['NumPy', 'required', 1.5],
      ['MLOps', 'preferred', 1.4],
      ['Docker', 'preferred', 1.2],
      ['SQL', 'preferred', 1.2],
    ],
  },
  {
    title: 'Data Scientist',
    slug: 'data-scientist',
    category: 'Data & AI',
    description: 'Extracts actionable insights from complex datasets using statistics, ML, and experiments.',
    requirements: [
      ['Python', 'required', 2.0],
      ['R', 'related', 0.8],
      ['SQL', 'required', 2.0],
      ['Pandas', 'required', 1.8],
      ['NumPy', 'required', 1.5],
      ['Machine Learning', 'required', 1.8],
      ['Statistics', 'required', 1.8],
      ['Data Visualization', 'preferred', 1.4],
      ['Scikit-Learn', 'required', 1.5],
    ],
  },
  {
    title: 'Data Analyst',
    slug: 'data-analyst',
    category: 'Data & AI',
    description: 'Analyzes trends, creates interactive dashboards, and communicates key business metrics.',
    requirements: [
      ['SQL', 'required', 2.0],
      ['Python', 'preferred', 1.5],
      ['Pandas', 'preferred', 1.4],
      ['Excel', 'required', 1.5],
      ['Tableau', 'preferred', 1.5],
      ['Power BI', 'preferred', 1.5],
      ['Statistics', 'preferred', 1.2],
      ['Data Visualization', 'required', 1.5],
    ],
  },
  {
    title: 'Data Engineer',
    slug: 'data-engineer',
    category: 'Data & AI',
    description: 'Builds robust ETL pipelines, data warehouses, and streaming platforms for analytics.',
    requirements: [
      ['Python', 'required', 1.8],
      ['SQL', 'required', 2.0],
      ['PostgreSQL', 'required', 1.5],
      ['Apache Spark', 'preferred', 1.6],
      ['Kafka', 'preferred', 1.4],
      ['Docker', 'preferred', 1.2],
      ['AWS', 'preferred', 1.4],
      ['Airflow', 'preferred', 1.4],
      ['Data Warehousing', 'preferred', 1.5],
    ],
  },
  {
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    category: 'Cloud & Security',
    description: 'Protects digital assets, monitors network activity, and responds to vulnerabilities.',
    requirements: [
      ['Linux', 'required', 1.8],
      ['Networking', 'required', 2.0],
      ['Python', 'preferred', 1.4],
      ['Bash', 'preferred', 1.4],
      ['Vulnerability Assessment', 'required', 1.8],
      ['SIEM', 'preferred', 1.4],
      ['OWASP Top 10', 'required', 1.6],
      ['Cryptography', 'preferred', 1.2],
    ],
  },
  {
    title: 'Cloud Engineer',
    slug: 'cloud-engineer',
    category: 'Cloud & Security',
    description: 'Architects, scales, and manages reliable infrastructure on AWS, Azure, or GCP.',
    requirements: [
      ['AWS', 'required', 2.0],
      ['GCP', 'preferred', 1.2],
      ['Terraform', 'required', 1.8],
      ['Docker', 'required', 1.6],
      ['Kubernetes', 'preferred', 1.6],
      ['Linux', 'required', 1.5],
      ['CI/CD', 'preferred', 1.4],
      ['Python', 'preferred', 1.2],
    ],
  },
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    category: 'Cloud & Security',
    description: 'Bridges development and operations through automation, CI/CD, and monitoring.',
    requirements: [
      ['Docker', 'required', 2.0],
      ['Kubernetes', 'required', 1.8],
      ['CI/CD', 'required', 2.0],
      ['Linux', 'required', 1.8],
      ['Git', 'required', 1.5],
      ['Terraform', 'preferred', 1.5],
      ['AWS', 'preferred', 1.5],
      ['Prometheus', 'preferred', 1.2],
      ['Python', 'preferred', 1.2],
    ],
  },
  {
    title: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    category: 'Design',
    description: 'Designs intuitive, visually appealing user journeys, wireframes, and prototypes.',
    requirements: [
      ['Figma', 'required', 2.0],
      ['UI Design', 'required', 2.0],
      ['User Research', 'required', 1.6],
      ['Prototyping', 'required', 1.8],
      ['Wireframing', 'required', 1.6],
      ['Design Systems', 'required', 1.6],
      ['HTML', 'related', 0.8],
      ['CSS', 'related', 0.8],
    ],
  },
  {
    title: 'Mobile App Developer',
    slug: 'mobile-app-developer',
    category: 'Engineering',
    description: 'Builds high-performance native and cross-platform apps for iOS and Android.',
    requirements: [
      ['React Native', 'required', 1.8],
      ['Flutter', 'preferred', 1.6],
      ['JavaScript', 'required', 1.5],
      ['TypeScript', 'preferred', 1.2],
      ['REST APIs', 'required', 1.5],
      ['Git', 'required', 1.2],
      ['Mobile UI Design', 'preferred', 1.2],
    ],
  },
];

export const OPPORTUNITIES_SEED = [
  {
    title: 'AI/ML Engineering Intern',
    company: 'DeepPulse Intelligence',
    opportunity_type: 'internship',
    work_mode: 'remote',
    location: 'Remote (Global)',
    stipend_or_salary: '$1,800 - $2,500 / month',
    eligibility: 'Enrolled in Computer Science or related degree; strong Python and PyTorch foundations.',
    deadline: '2026-12-31',
    application_link: 'https://careers.deeppulse.io/apply/intern-aiml',
    description: 'Join our AI research team to build and evaluate LLM agent workflows and document extraction pipelines using PyTorch and FastAPI.',
    required_skills: ['Python', 'PyTorch', 'Machine Learning', 'FastAPI'],
    source: 'Verified Partner',
  },
  {
    title: 'Junior Full Stack Developer',
    company: 'Nexus Flow Technologies',
    opportunity_type: 'full_time',
    work_mode: 'hybrid',
    location: 'Bengaluru / Hybrid',
    stipend_or_salary: '$18,000 - $24,000 / year',
    eligibility: 'Recent graduate or final year student with hands-on React and Node.js or Python backend projects.',
    deadline: '2026-12-15',
    application_link: 'https://nexusflow.tech/careers/fullstack-junior',
    description: 'Collaborate on modern web applications utilizing React, Tailwind CSS, and Python microservices.',
    required_skills: ['JavaScript', 'React.js', 'Python', 'SQL', 'Git'],
    source: 'Verified Partner',
  },
  {
    title: 'Data Analytics Intern',
    company: 'Aura Global Metrics',
    opportunity_type: 'internship',
    work_mode: 'remote',
    location: 'Remote',
    stipend_or_salary: '$1,200 / month',
    eligibility: 'Passionate about data modeling, SQL queries, and visualization dashboards.',
    deadline: '2026-11-30',
    application_link: 'https://aurametrics.com/jobs/data-intern',
    description: 'Build high-impact visual reports and KPI tracking dashboards for international operations.',
    required_skills: ['SQL', 'Python', 'Pandas', 'Data Visualization'],
    source: 'Verified Partner',
  },
  {
    title: 'Cloud & DevOps Associate',
    company: 'Skyline Cloud Labs',
    opportunity_type: 'full_time',
    work_mode: 'remote',
    location: 'Remote',
    stipend_or_salary: '$20,000 - $28,000 / year',
    eligibility: 'Familiarity with containerization (Docker), Linux shell scripting, and CI/CD pipelines.',
    deadline: '2026-12-20',
    application_link: 'https://skylinecloud.io/careers/devops-assoc',
    description: 'Assist our infrastructure team with automated deployments, Docker containers, and cloud monitoring.',
    required_skills: ['Docker', 'Linux', 'Git', 'CI/CD', 'AWS'],
    source: 'Verified Partner',
  },
  {
    title: 'Frontend Engineering Intern (React / UI)',
    company: 'VividCraft Interactive',
    opportunity_type: 'internship',
    work_mode: 'remote',
    location: 'Remote',
    stipend_or_salary: '$1,500 / month',
    eligibility: 'Strong visual aesthetic, modern JavaScript / React experience, and passion for UI/UX.',
    deadline: '2026-12-25',
    application_link: 'https://vividcraft.design/jobs/frontend-intern',
    description: 'Build responsive web interfaces using React and Tailwind CSS for client products.',
    required_skills: ['JavaScript', 'React.js', 'HTML', 'CSS', 'Tailwind CSS'],
    source: 'Verified Partner',
  },
];

class InMemoryStore {
  constructor() {
    this.counters = {
      users: 0,
      studentProfiles: 0,
      recruiterProfiles: 0,
      ownerAccounts: 0,
      resumes: 0,
      resumeAnalyses: 0,
      skills: 0,
      studentSkills: 0,
      careerRoles: 0,
      roleRequirements: 0,
      projects: 0,
      certifications: 0,
      learningRoadmaps: 0,
      roadmapActivities: 0,
      opportunities: 0,
      opportunityRequirements: 0,
      applications: 0,
      interviews: 0,
      notifications: 0,
      auditLogs: 0,
      platformSettings: 0,
    };

    this.users = [];
    this.studentProfiles = [];
    this.recruiterProfiles = [];
    this.ownerAccounts = [];
    this.resumes = [];
    this.resumeAnalyses = [];
    this.skills = [];
    this.studentSkills = [];
    this.careerRoles = [];
    this.roleRequirements = [];
    this.projects = [];
    this.certifications = [];
    this.learningRoadmaps = [];
    this.roadmapActivities = [];
    this.opportunities = [];
    this.opportunityRequirements = [];
    this.applications = [];
    this.interviews = [];
    this.notifications = [];
    this.auditLogs = [];
    this.platformSettings = [];
    this.seeded = false;
  }

  _nextId(table) {
    this.counters[table] += 1;
    return this.counters[table];
  }

  _now() {
    return new Date().toISOString();
  }

  createUser(data) {
    const now = this._now();
    const record = {
      id: this._nextId('users'),
      is_active: true,
      is_verified: false,
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.users.push(record);
    return record;
  }

  createStudentProfile(data) {
    const now = this._now();
    const record = {
      id: this._nextId('studentProfiles'),
      college: null,
      course_branch: null,
      graduation_year: null,
      bio: null,
      phone: null,
      linkedin_url: null,
      github_url: null,
      experience_level: 'Beginner',
      career_goal: 'Internship',
      preparation_timeline: '3 months',
      selected_role_id: null,
      readiness_score: 0.0,
      readiness_level: 'Beginner',
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.studentProfiles.push(record);
    return record;
  }

  createRecruiterProfile(data) {
    const now = this._now();
    const record = {
      id: this._nextId('recruiterProfiles'),
      company_website: null,
      designation: null,
      company_description: null,
      is_verified: false,
      verification_notes: null,
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.recruiterProfiles.push(record);
    return record;
  }

  createOwnerAccount(data) {
    const record = {
      id: this._nextId('ownerAccounts'),
      is_bootstrapped: true,
      bootstrapped_at: this._now(),
      ...data,
    };
    this.ownerAccounts.push(record);
    return record;
  }

  createResume(data) {
    const now = this._now();
    const record = {
      id: this._nextId('resumes'),
      extracted_text: null,
      page_count: 1,
      upload_status: 'uploaded',
      error_message: null,
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.resumes.push(record);
    return record;
  }

  createResumeAnalysis(data) {
    const record = {
      id: this._nextId('resumeAnalyses'),
      ai_provider_used: 'Local Semantic Parser',
      status: 'completed',
      created_at: this._now(),
      ...data,
    };
    this.resumeAnalyses.push(record);
    return record;
  }

  createSkill(data) {
    const record = {
      id: this._nextId('skills'),
      is_verified: true,
      ...data,
    };
    this.skills.push(record);
    return record;
  }

  createStudentSkill(data) {
    const record = {
      id: this._nextId('studentSkills'),
      source: 'resume_extracted',
      proficiency_level: 'Intermediate',
      evidence_note: null,
      verified: true,
      created_at: this._now(),
      ...data,
    };
    this.studentSkills.push(record);
    return record;
  }

  createCareerRole(data) {
    const now = this._now();
    const record = {
      id: this._nextId('careerRoles'),
      is_active: true,
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.careerRoles.push(record);
    return record;
  }

  createRoleRequirement(data) {
    const record = {
      id: this._nextId('roleRequirements'),
      requirement_type: 'required',
      weight: 1.0,
      minimum_proficiency: 'Intermediate',
      ...data,
    };
    this.roleRequirements.push(record);
    return record;
  }

  createProject(data) {
    const record = {
      id: this._nextId('projects'),
      source: 'manual',
      created_at: this._now(),
      ...data,
    };
    this.projects.push(record);
    return record;
  }

  createCertification(data) {
    const record = {
      id: this._nextId('certifications'),
      source: 'manual',
      created_at: this._now(),
      ...data,
    };
    this.certifications.push(record);
    return record;
  }

  createLearningRoadmap(data) {
    const now = this._now();
    const record = {
      id: this._nextId('learningRoadmaps'),
      total_phases: 0,
      completed_phases: 0,
      progress_percentage: 0.0,
      is_active: true,
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.learningRoadmaps.push(record);
    return record;
  }

  createRoadmapActivity(data) {
    const record = {
      id: this._nextId('roadmapActivities'),
      is_completed: false,
      completed_at: null,
      order_index: 0,
      ...data,
    };
    this.roadmapActivities.push(record);
    return record;
  }

  createOpportunity(data) {
    const now = this._now();
    const record = {
      id: this._nextId('opportunities'),
      recruiter_id: null,
      opportunity_type: 'internship',
      work_mode: 'remote',
      location: 'Remote / Hybrid',
      stipend_or_salary: null,
      eligibility: null,
      deadline: null,
      application_link: null,
      verification_status: 'verified',
      source: 'Verified Partner',
      is_active: true,
      last_verified_at: now,
      created_at: now,
      ...data,
    };
    this.opportunities.push(record);
    return record;
  }

  createOpportunityRequirement(data) {
    const record = {
      id: this._nextId('opportunityRequirements'),
      is_mandatory: true,
      ...data,
    };
    this.opportunityRequirements.push(record);
    return record;
  }

  createApplication(data) {
    const now = this._now();
    const record = {
      id: this._nextId('applications'),
      status: 'applied',
      notes: null,
      applied_at: now,
      updated_at: now,
      ...data,
    };
    this.applications.push(record);
    return record;
  }

  createInterview(data) {
    const record = {
      id: this._nextId('interviews'),
      duration_minutes: 45,
      interview_type: 'technical',
      status: 'scheduled',
      created_at: this._now(),
      ...data,
    };
    this.interviews.push(record);
    return record;
  }

  createNotification(data) {
    const record = {
      id: this._nextId('notifications'),
      notification_type: 'info',
      action_link: null,
      is_read: false,
      created_at: this._now(),
      ...data,
    };
    this.notifications.push(record);
    return record;
  }

  createAuditLog(data) {
    const record = {
      id: this._nextId('auditLogs'),
      user_id: null,
      resource_type: null,
      resource_id: null,
      details: null,
      ip_address: null,
      created_at: this._now(),
      ...data,
    };
    this.auditLogs.push(record);
    return record;
  }

  createPlatformSetting(data) {
    const record = {
      id: this._nextId('platformSettings'),
      updated_by_user_id: null,
      updated_at: this._now(),
      ...data,
    };
    this.platformSettings.push(record);
    return record;
  }

  // Lookup helpers
  getUserById(id) {
    return this.users.find((u) => u.id === id) || null;
  }

  getUserByEmail(email) {
    const clean = (email || '').toLowerCase().trim();
    return this.users.find((u) => u.email.toLowerCase() === clean) || null;
  }

  getStudentProfileByUserId(userId) {
    return this.studentProfiles.find((s) => s.user_id === userId) || null;
  }

  getRecruiterProfileByUserId(userId) {
    return this.recruiterProfiles.find((r) => r.user_id === userId) || null;
  }

  getRoleRequirements(roleId) {
    return this.roleRequirements.filter((r) => r.role_id === roleId);
  }

  getOpportunityRequirements(oppId) {
    return this.opportunityRequirements.filter((r) => r.opportunity_id === oppId);
  }

  getStudentSkills(studentId) {
    return this.studentSkills.filter((s) => s.student_id === studentId);
  }
}

export const store = new InMemoryStore();

export function seedDatabase(hashPassword) {
  if (store.seeded) return;
  store.seeded = true;

  // 1. Seed Career Roles & Requirements
  for (const rData of CAREER_ROLES_DATA) {
    let role = store.careerRoles.find((r) => r.title === rData.title);
    if (!role) {
      role = store.createCareerRole({
        title: rData.title,
        slug: rData.slug,
        category: rData.category,
        description: rData.description,
        is_active: true,
      });

      for (const [skillName, reqType, weight] of rData.requirements) {
        store.createRoleRequirement({
          role_id: role.id,
          skill_name: skillName,
          requirement_type: reqType,
          weight,
        });

        if (!store.skills.find((s) => s.name === skillName)) {
          let cat = 'framework';
          if (reqType === 'required' && ['Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'HTML', 'CSS'].includes(skillName)) {
            cat = 'language';
          } else if (['PostgreSQL', 'MongoDB', 'Redis', 'SQLite'].includes(skillName)) {
            cat = 'database';
          } else if (['Docker', 'Kubernetes', 'Git', 'Linux', 'CI/CD', 'Terraform'].includes(skillName)) {
            cat = 'tool';
          } else if (['AWS', 'GCP', 'Azure'].includes(skillName)) {
            cat = 'cloud';
          } else if (['Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'LLM', 'NLP'].includes(skillName)) {
            cat = 'aiml';
          }
          store.createSkill({ name: skillName, category: cat, is_verified: true });
        }
      }
    }
  }

  // 2. Seed Verified Opportunities
  for (const oppData of OPPORTUNITIES_SEED) {
    const exists = store.opportunities.find(
      (o) => o.title === oppData.title && o.company === oppData.company
    );
    if (!exists) {
      const opp = store.createOpportunity({
        title: oppData.title,
        company: oppData.company,
        description: oppData.description,
        opportunity_type: oppData.opportunity_type,
        work_mode: oppData.work_mode,
        location: oppData.location,
        stipend_or_salary: oppData.stipend_or_salary,
        eligibility: oppData.eligibility,
        deadline: oppData.deadline,
        application_link: oppData.application_link,
        verification_status: 'verified',
        source: oppData.source,
        is_active: true,
      });
      for (const s of oppData.required_skills) {
        store.createOpportunityRequirement({
          opportunity_id: opp.id,
          skill_name: s,
          is_mandatory: true,
        });
      }
    }
  }

  // 3. Seed Platform Settings
  const settingsSeed = [
    ['maintenance_mode', 'false', 'Global maintenance mode flag'],
    ['ai_analysis_enabled', 'true', 'Controls whether AI resume analysis engine is active'],
    ['max_resume_size_mb', '10', 'Maximum uploaded resume file size limit in megabytes'],
    ['announcement_banner', 'Welcome to Skill Passport 1.0! Upload your resume to discover your AI career roadmap.', 'Site-wide announcement banner'],
  ];
  for (const [key, val, desc] of settingsSeed) {
    if (!store.platformSettings.find((p) => p.setting_key === key)) {
      store.createPlatformSetting({
        setting_key: key,
        setting_value: val,
        description: desc,
      });
    }
  }

  // 4. Bootstrap Website Owner Account
  if (settings.OWNER_EMAIL && settings.OWNER_BOOTSTRAP_SECRET) {
    if (!store.getUserByEmail(settings.OWNER_EMAIL)) {
      const ownerUser = store.createUser({
        email: settings.OWNER_EMAIL,
        password_hash: hashPassword(settings.OWNER_BOOTSTRAP_SECRET),
        role: 'admin',
        is_active: true,
        is_verified: true,
      });
      store.createOwnerAccount({
        user_id: ownerUser.id,
        bootstrap_secret_hash: hashPassword(settings.OWNER_BOOTSTRAP_SECRET),
        is_bootstrapped: true,
      });
    }
  }

  // 5. Seed Demo Student Account (matches auth_pages.js Fill Demo)
  const demoStudentEmail = 'student_test@university.edu';
  if (!store.getUserByEmail(demoStudentEmail)) {
    const stuUser = store.createUser({
      email: demoStudentEmail,
      password_hash: hashPassword('Password123!'),
      role: 'student',
      is_active: true,
      is_verified: true,
    });
    const aiRole = store.careerRoles.find((r) => r.title === 'AI Engineer') || store.careerRoles[0];
    const stuProfile = store.createStudentProfile({
      user_id: stuUser.id,
      full_name: 'Alex Mercer',
      college: 'National Institute of Technology',
      course_branch: 'B.Tech Computer Science & Engineering',
      graduation_year: 2026,
      bio: 'Final-year CS undergraduate passionate about AI systems, full-stack web apps, and distributed tooling.',
      experience_level: 'Intermediate',
      career_goal: 'Internship',
      preparation_timeline: '3 months',
      selected_role_id: aiRole ? aiRole.id : null,
      readiness_score: 52.0,
      readiness_level: 'Developing',
    });

    const seedSkills = [
      ['Python', 'languages', 'resume_extracted'],
      ['JavaScript', 'languages', 'resume_extracted'],
      ['SQL', 'languages', 'resume_extracted'],
      ['React.js', 'frameworks', 'resume_extracted'],
      ['FastAPI', 'frameworks', 'resume_extracted'],
      ['Git', 'tools', 'resume_extracted'],
      ['Docker', 'tools', 'manual'],
      ['Machine Learning', 'aiml', 'manual'],
    ];
    for (const [name, cat, src] of seedSkills) {
      store.createStudentSkill({
        student_id: stuProfile.id,
        skill_name: name,
        category: cat,
        source: src,
        proficiency_level: 'Intermediate',
        verified: true,
      });
    }

    store.createProject({
      student_id: stuProfile.id,
      title: 'Intelligent Document Q&A Engine',
      description: 'Built a semantic search and document Q&A pipeline using Python, FastAPI, and vector embeddings.',
      technologies_used: 'Python, FastAPI, Docker, SQL',
      project_url: 'https://github.com/example/doc-qa',
      source: 'manual',
    });

    store.createNotification({
      user_id: stuUser.id,
      title: 'Welcome to Skill Passport',
      message: 'Your Career Passport is active. Upload a resume or refine your target role to update your roadmap.',
      notification_type: 'info',
      action_link: '#student/dashboard',
    });
  }

  // 6. Seed Demo Verified Recruiter Accounts (matches auth_pages.js & portal_landing.js)
  const seedRecruiter = (email, password, fullName, companyName, designation, website) => {
    if (store.getUserByEmail(email)) return null;
    const recUser = store.createUser({
      email,
      password_hash: hashPassword(password),
      role: 'recruiter',
      is_active: true,
      is_verified: true,
    });
    const recProfile = store.createRecruiterProfile({
      user_id: recUser.id,
      full_name: fullName,
      official_email: email,
      company_name: companyName,
      company_website: website,
      designation,
      is_verified: true,
      verification_notes: 'Pre-verified partner recruiter',
    });
    return { recUser, recProfile };
  };

  const quantum = seedRecruiter(
    'recruiter@demo.com',
    'Recruiter123!',
    'Elena Rostova',
    'Quantum Labs',
    'University Talent Lead',
    'https://quantumlabs.ai'
  );
  seedRecruiter(
    'veerendrarajuindus@gmail.com',
    'Password123!',
    'Veerendra Raju',
    'BUNNY TECH',
    'Head of Engineering Hiring',
    'https://bunnytech.io'
  );

  // Attach one sample recruiter posting + application from demo student so recruiter dashboard has real interactive data
  if (quantum) {
    const opp = store.createOpportunity({
      recruiter_id: quantum.recProfile.id,
      title: 'Applied AI Engineering Intern',
      company: quantum.recProfile.company_name,
      description: 'Work alongside our applied ML team on document intelligence, FastAPI services, and RAG pipelines.',
      opportunity_type: 'internship',
      work_mode: 'remote',
      location: 'Remote',
      stipend_or_salary: '$2,000 / month',
      eligibility: 'Undergraduate or graduate CS/AI student with Python and FastAPI skills.',
      deadline: '2026-12-30',
      verification_status: 'verified',
      source: `Verified Recruiter (${quantum.recProfile.company_name})`,
      is_active: true,
    });
    for (const s of ['Python', 'FastAPI', 'Machine Learning', 'Docker']) {
      store.createOpportunityRequirement({
        opportunity_id: opp.id,
        skill_name: s,
        is_mandatory: true,
      });
    }

    const demoStudent = store.studentProfiles.find((s) => s.full_name === 'Alex Mercer');
    if (demoStudent) {
      store.createApplication({
        student_id: demoStudent.id,
        opportunity_id: opp.id,
        status: 'shortlisted',
        notes: 'Strong Python and FastAPI background.',
      });
    }
  }

  console.log('[Skill Passport] In-memory store initialized and seeded.');
}
