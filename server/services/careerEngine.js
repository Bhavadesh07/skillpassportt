export const CareerEngine = {
  _skillMatches(reqSkill, studentSkillsSet) {
    if (studentSkillsSet.has(reqSkill)) return true;
    for (const s of studentSkillsSet) {
      if (reqSkill.includes(s) || s.includes(reqSkill)) return true;
    }
    return false;
  },

  evaluateRoleCompatibility({
    studentSkills,
    role,
    requirements = [],
    experienceLevel = 'Beginner',
    careerGoal = 'Internship',
    preparationTimeline = '3 months',
  }) {
    const studentSkillsNormalized = new Set(studentSkills.map((s) => s.toLowerCase().trim()));
    const requiredReqs = requirements.filter((r) => r.requirement_type === 'required');
    const preferredReqs = requirements.filter((r) => r.requirement_type === 'preferred');
    const relatedReqs = requirements.filter((r) => r.requirement_type === 'related');

    const matchedSkills = [];
    const relatedSkills = [];
    const missingSkills = [];

    let totalWeight = 0;
    let earnedWeight = 0;

    for (const req of requiredReqs) {
      const w = req.weight || 1.5;
      totalWeight += w;
      const reqLower = req.skill_name.toLowerCase().trim();
      if (this._skillMatches(reqLower, studentSkillsNormalized)) {
        earnedWeight += w;
        matchedSkills.push(req.skill_name);
      } else {
        missingSkills.push(req.skill_name);
      }
    }

    for (const req of preferredReqs) {
      const w = req.weight || 1.0;
      totalWeight += w;
      const reqLower = req.skill_name.toLowerCase().trim();
      if (this._skillMatches(reqLower, studentSkillsNormalized)) {
        earnedWeight += w;
        matchedSkills.push(req.skill_name);
      } else {
        missingSkills.push(req.skill_name);
      }
    }

    for (const req of relatedReqs) {
      const w = req.weight || 0.5;
      totalWeight += w;
      const reqLower = req.skill_name.toLowerCase().trim();
      if (this._skillMatches(reqLower, studentSkillsNormalized)) {
        earnedWeight += w;
        relatedSkills.push(req.skill_name);
      } else {
        relatedSkills.push(req.skill_name);
      }
    }

    if (totalWeight === 0) {
      totalWeight = 1.0;
      earnedWeight = 0.5;
    }

    const rawPercentage = (earnedWeight / totalWeight) * 100.0;
    const score = Math.round(Math.min(100.0, Math.max(5.0, rawPercentage)) * 10) / 10;

    let readiness = 'Beginner';
    if (score >= 85.0) readiness = 'Strong Match';
    else if (score >= 65.0) readiness = 'Nearly Ready';
    else if (score >= 40.0) readiness = 'Developing';

    const scoreExplanation =
      `Compatibility score of ${score}% is derived by evaluating ${matchedSkills.length} matched competencies ` +
      `against ${requiredReqs.length} core required and ${preferredReqs.length} preferred skills for ${role.title}. ` +
      `Note: This score assesses skill overlap and curriculum alignment; it is not a guaranteed hiring probability.`;

    const whatStudentCanAchieve = this._buildAchievablePaths({
      roleTitle: role.title,
      matchedSkills,
      missingSkills,
      score,
      careerGoal,
      experienceLevel,
    });

    const recommendations = this._generateRecommendations({
      roleTitle: role.title,
      missingSkills,
      matchedSkills,
      timeline: preparationTimeline,
    });

    return {
      role_id: role.id,
      role_title: role.title,
      compatibility_score: score,
      score_explanation: scoreExplanation,
      matched_skills: Array.from(new Set(matchedSkills)),
      related_skills: Array.from(new Set(relatedSkills)),
      missing_skills: Array.from(new Set(missingSkills)),
      career_readiness: readiness,
      what_student_can_achieve: whatStudentCanAchieve,
      recommendations,
    };
  },

  _buildAchievablePaths({ roleTitle, matchedSkills, missingSkills, score, careerGoal }) {
    const matchedStr = matchedSkills.length ? matchedSkills.slice(0, 3).join(', ') : 'your current coursework';
    let readyRoles, prepRoles, longTerm, narrative;

    if (score >= 65.0) {
      readyRoles = [`Junior ${roleTitle}`, `${roleTitle} Intern`, 'Associate Developer'];
      prepRoles = [`Mid-Level ${roleTitle}`, 'Specialized Domain Roles'];
      longTerm = [`Senior ${roleTitle}`, `Lead ${roleTitle} / Architect`];
      narrative =
        `Based on your verified skills in ${matchedStr}, your profile exhibits high alignment for ${roleTitle} ` +
        `${careerGoal.toLowerCase()} positions. You have the foundational requirements to start applying for entry-level opportunities.`;
    } else if (score >= 40.0) {
      readyRoles = [`Junior Support / Associate in ${roleTitle.split(' ')[0]}`, `Foundational ${roleTitle} Intern`];
      prepRoles = [`Full ${roleTitle}`, 'High-Growth Startup Engineering Roles'];
      longTerm = [`Senior ${roleTitle}`, 'Specialized Architect'];
      narrative =
        `Your background in ${matchedStr} provides a viable starting point. With targeted preparation focusing on ` +
        `missing skills (${missingSkills.slice(0, 3).join(', ')}), you can reach entry-level job readiness.`;
    } else {
      readyRoles = ['Campus Technical Ambassador', 'Foundational Lab Assistant', 'Entry Tech Explorer'];
      prepRoles = [`Junior ${roleTitle}`, `${roleTitle} Intern`];
      longTerm = [`Professional ${roleTitle}`, 'Technical Specialist'];
      narrative =
        `You are at the introductory stage for ${roleTitle}. By systematically following your roadmap and acquiring core ` +
        `skills like ${missingSkills.slice(0, 3).join(', ')}, you can build strong competency for upcoming placements.`;
    }

    return {
      narrative,
      roles_ready_to_apply: readyRoles,
      roles_requiring_preparation: prepRoles,
      long_term_goals: longTerm,
      disclaimer:
        'Skill Passport provides educational and readiness guidance based on skill matching. We never guarantee employment, salary brackets, or interview selection.',
    };
  },

  _generateRecommendations({ roleTitle, missingSkills, timeline }) {
    const topMissing = missingSkills.length
      ? missingSkills.slice(0, 4)
      : ['Advanced System Architecture', 'Performance Profiling'];

    const projectsCatalog = {
      'AI Engineer': [
        'End-to-End Multimodal RAG Pipeline with Vector Search and FastAPI',
        'Fine-Tuned LLM Domain Chatbot with PyTorch and HuggingFace',
        'Automated Document Intelligence System with PyMuPDF and Embeddings',
      ],
      'Machine Learning Engineer': [
        'Real-Time Fraud Detection Pipeline with Scikit-Learn and Kafka',
        'Computer Vision Defect Detection using PyTorch and OpenCV',
        'Model Deployment & Monitoring Dashboard with Docker and MLflow',
      ],
      'Full Stack Developer': [
        'SaaS Multi-Tenant Collaboration Platform with React, FastAPI & PostgreSQL',
        'Real-Time Collaborative Code Editor with WebSockets and Redis',
        'E-Commerce Platform with Stripe Checkout and Automated Testing',
      ],
      'Frontend Developer': [
        'High-Performance Analytics Dashboard with Tailwind CSS and D3/Chart.js',
        'Accessible Component Library with Storybook and Unit Tests',
        'Modern Neo-Editorial Portfolio with Responsive Dark Mode',
      ],
      'Backend Developer': [
        'Distributed Task Queue with Redis and Asynchronous Workers',
        'Secure REST API Microservice with Rate Limiting and JWT Auth',
        'High-Throughput URL Shortener with Caching and PostgreSQL',
      ],
      'Cybersecurity Analyst': [
        'Vulnerability Assessment & Network Traffic Monitor with Scapy/Wireshark',
        'Automated Security Incident & Event Management (SIEM) Log Parser',
        'Web Application Security Audit following OWASP Top 10',
      ],
      'Data Scientist': [
        'Predictive Customer Churn Model with Feature Engineering and SHAP',
        'Automated Exploratory Data Analysis Dashboard with Streamlit',
        'Time-Series Forecasting for Financial Market Trends',
      ],
      'Cloud Engineer': [
        'Automated Multi-Region Cloud Infrastructure using Terraform',
        'Kubernetes Cluster Deployment with Prometheus & Grafana Monitoring',
        'Serverless REST API with AWS Lambda, API Gateway and DynamoDB',
      ],
      'DevOps Engineer': [
        'Zero-Downtime CI/CD Pipeline with GitHub Actions and Docker',
        'Infrastructure as Code Configuration Management with Ansible',
        'Centralized Log Aggregation and Alerting Stack',
      ],
    };

    const recommendedProjects = projectsCatalog[roleTitle] || [
      `End-to-End ${roleTitle} Showcase Application demonstrating clean architecture`,
      'Production-ready deployment pipeline with containerization and automated testing',
    ];

    const certifications = [
      `Relevant industry credentials for ${roleTitle} (e.g. AWS Certified, Google Cloud, Meta Developer, DeepLearning.AI)`,
      'Verified open-source contributions or peer-reviewed GitHub repositories',
    ];

    const interviewTopics = [
      'Data Structures & Algorithmic Complexity (Big-O analysis)',
      `Core ${roleTitle} domain architecture and system design patterns`,
      'Behavioral STAR method responses for technical projects and collaboration',
    ];

    return {
      skills_to_learn_first: topMissing,
      recommended_projects: recommendedProjects,
      certifications_to_consider: certifications,
      technologies_to_practice: topMissing,
      interview_preparation_topics: interviewTopics,
      suggested_pacing: `Allocate 8-12 hours per week over your selected ${timeline} timeline.`,
    };
  },
};
