import { settings } from '../config.js';

export const KNOWN_SKILLS = {
  languages: [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'go', 'golang',
    'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'sql', 'html', 'css', 'bash', 'shell',
  ],
  frameworks: [
    'react', 'react.js', 'next.js', 'vue', 'vue.js', 'angular', 'node.js', 'express', 'express.js',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'asp.net', 'laravel', 'ruby on rails',
    'tailwind css', 'bootstrap', 'flutter', 'react native',
  ],
  databases: [
    'postgresql', 'postgres', 'mysql', 'mongodb', 'sqlite', 'redis', 'cassandra',
    'dynamodb', 'elasticsearch', 'oracle', 'mariadb', 'firebase',
  ],
  tools: [
    'git', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins', 'terraform',
    'postman', 'linux', 'jira', 'figma', 'webpack', 'vite', 'ci/cd',
  ],
  cloud: [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'cloudflare', 'heroku', 'vercel',
  ],
  aiml: [
    'machine learning', 'deep learning', 'artificial intelligence', 'nlp', 'computer vision',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'opencv',
    'huggingface', 'llm', 'langchain', 'prompt engineering', 'data science', 'data analysis',
  ],
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatSkillName(skill) {
  if (skill === 'javascript') return 'JavaScript';
  if (skill === 'typescript') return 'TypeScript';
  if (skill === 'react' || skill === 'react.js') return 'React.js';
  if (['node.js', 'next.js', 'vue.js', 'express.js'].includes(skill)) {
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  }
  const dbMap = {
    postgresql: 'PostgreSQL',
    mongodb: 'MongoDB',
    mysql: 'MySQL',
    sqlite: 'SQLite',
  };
  if (dbMap[skill]) return dbMap[skill];
  if (['aws', 'gcp', 'ci/cd', 'nlp', 'llm', 'html', 'css', 'sql'].includes(skill)) {
    return skill.toUpperCase();
  }
  if (skill.length <= 3) return skill.toUpperCase();
  return skill
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const AIService = {
  async analyzeResume(extractedText) {
    if (settings.AI_API_KEY && settings.AI_API_KEY.length > 5) {
      try {
        const result = await this._analyzeWithGemini(extractedText);
        if (result) {
          result.ai_provider_used = `Google Gemini (${settings.AI_MODEL})`;
          return result;
        }
      } catch (err) {
        console.warn(`[AI Service Warning] Gemini API call failed: ${err.message}. Falling back to Local Semantic Parser.`);
      }
    }

    const result = this._analyzeWithLocalNlp(extractedText);
    result.ai_provider_used = 'Local Semantic Parser (Development Mode)';
    return result;
  },

  async _analyzeWithGemini(text) {
    const prompt = `
You are an expert AI Resume Analyst for the Skill Passport career intelligence platform.
Analyze the following actual resume text and extract truthful information.
CRITICAL RULES:
1. ONLY identify information explicitly supported by the text below.
2. If information is missing, set the field to "Not found in resume" or an empty list.
3. NEVER invent or hallucinate experience, skills, projects, education, or contact details.
4. Provide constructive, honest quality suggestions based solely on this resume.

Resume Text:
"""${text.slice(0, 10000)}"""

Return ONLY a valid JSON object with the following schema:
{
  "personal_info": {
    "name": "string or 'Not found in resume'",
    "email": "string or 'Not found in resume'",
    "phone": "string or 'Not found in resume'",
    "college": "string or 'Not found in resume'",
    "degree": "string or 'Not found in resume'",
    "graduation_year": "string or 'Not found in resume'"
  },
  "technical_skills": {
    "languages": ["skill1"],
    "frameworks": ["framework1"],
    "databases": ["db1"],
    "tools": ["tool1"],
    "cloud": ["cloud1"],
    "aiml": ["aiml1"]
  },
  "other_info": {
    "projects": [
      {"title": "project title", "description": "details or 'Not found in resume'", "technologies": ["tech1"]}
    ],
    "internships_and_experience": [
      {"role": "role title", "company": "company or 'Not specified'", "duration": "dates", "summary": "details"}
    ],
    "certifications": ["cert1"],
    "achievements": ["achievement1"]
  },
  "quality_analysis": {
    "structure_rating": "Good / Needs Improvement / Weak",
    "ats_readability_score": 75,
    "missing_sections": ["list of sections missing like Projects, Summary, etc."],
    "strong_points": ["bullet points"],
    "improvement_suggestions": ["practical suggestions to improve resume"],
    "keyword_density_summary": "overview of keywords present"
  }
}`;

    const url = `${settings.AI_BASE_URL}/models/${settings.AI_MODEL}:generateContent?key=${settings.AI_API_KEY}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) return JSON.parse(content);
    }
    return null;
  },

  _analyzeWithLocalNlp(text) {
    const lowerText = text.toLowerCase();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : 'Not found in resume';

    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0].trim() : 'Not found in resume';

    let name = 'Not found in resume';
    if (lines.length > 0) {
      const candidateName = lines[0];
      if (
        candidateName.split(/\s+/).length <= 4 &&
        !/resume|curriculum|email|phone|http/i.test(candidateName)
      ) {
        name = candidateName;
      } else if (lines.length > 1 && lines[1].split(/\s+/).length <= 4) {
        name = lines[1];
      }
    }

    let college = 'Not found in resume';
    let degree = 'Not found in resume';
    const collegeKeywords = ['university', 'institute', 'college', 'school of', 'technology', 'polytechnic'];
    const degreeKeywords = ['b.tech', 'bachelor', 'b.e', 'b.s', 'm.tech', 'master', 'm.s', 'ph.d', 'diploma', 'bca', 'mca'];

    for (const line of lines) {
      const ll = line.toLowerCase();
      if (college === 'Not found in resume' && collegeKeywords.some((k) => ll.includes(k))) {
        college = line.slice(0, 120).trim();
      }
      if (degree === 'Not found in resume' && degreeKeywords.some((k) => ll.includes(k))) {
        degree = line.slice(0, 120).trim();
      }
    }

    const gradMatch = text.match(/\b(20\d{2})\b/);
    const gradYear = gradMatch ? gradMatch[1] : 'Not found in resume';

    const extractedSkills = {
      languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      cloud: [],
      aiml: [],
    };

    for (const [category, skillList] of Object.entries(KNOWN_SKILLS)) {
      for (const skill of skillList) {
        const escaped = escapeRegExp(skill);
        const pattern = new RegExp(`(?:^|[\\s,;/|•()])(${escaped})(?:$|[\\s,;/|•()])`, 'i');
        if (pattern.test(lowerText)) {
          const formatted = formatSkillName(skill);
          if (!extractedSkills[category].includes(formatted)) {
            extractedSkills[category].push(formatted);
          }
        }
      }
    }

    // Projects
    const projects = [];
    const projectHeaders = ['projects', 'personal projects', 'academic projects', 'key projects'];
    let inProjects = false;
    let currentProject = null;

    for (const line of lines) {
      const ll = line.toLowerCase();
      if (projectHeaders.some((h) => ll.startsWith(h) || ll === h)) {
        inProjects = true;
        continue;
      }
      if (inProjects && ['experience', 'education', 'skills', 'certifications', 'achievements'].some((h) => ll.startsWith(h))) {
        inProjects = false;
        break;
      }
      if (inProjects && line) {
        if (line.length < 60 && !line.startsWith('-') && !line.startsWith('•')) {
          if (currentProject) projects.push(currentProject);
          currentProject = { title: line, description: '', technologies: [] };
        } else if (currentProject) {
          currentProject.description = `${currentProject.description} ${line}`.trim();
        }
      }
    }
    if (currentProject) projects.push(currentProject);

    for (const p of projects) {
      if (!p.description) p.description = 'Detailed project work documented in resume.';
      const pTechs = new Set();
      for (const catSkills of Object.values(extractedSkills)) {
        for (const s of catSkills) {
          if (p.description.toLowerCase().includes(s.toLowerCase()) || p.title.toLowerCase().includes(s.toLowerCase())) {
            pTechs.add(s);
          }
        }
      }
      p.technologies = Array.from(pTechs).slice(0, 5);
    }

    // Internships & Experience
    const experiences = [];
    const expHeaders = ['experience', 'work experience', 'internships', 'professional experience', 'employment'];
    let inExp = false;
    let currentExp = null;

    for (const line of lines) {
      const ll = line.toLowerCase();
      if (expHeaders.some((h) => ll.startsWith(h) || ll === h)) {
        inExp = true;
        continue;
      }
      if (inExp && ['projects', 'education', 'skills', 'certifications'].some((h) => ll.startsWith(h))) {
        inExp = false;
        break;
      }
      if (inExp && line) {
        if (line.length < 60 && !line.startsWith('-') && !line.startsWith('•')) {
          if (currentExp) experiences.push(currentExp);
          currentExp = {
            role: line,
            company: 'Organization mentioned in resume',
            duration: 'Not specified',
            summary: '',
          };
        } else if (currentExp) {
          currentExp.summary = `${currentExp.summary} ${line}`.trim();
        }
      }
    }
    if (currentExp) experiences.push(currentExp);
    for (const e of experiences) {
      if (!e.summary) e.summary = 'Professional responsibilities outlined in resume.';
    }

    // Certifications & Achievements
    const certifications = [];
    const achievements = [];
    for (const line of lines) {
      const ll = line.toLowerCase();
      if (['certified', 'certification', 'certificate', 'coursera', 'udemy', 'aws certified', 'meta'].some((k) => ll.includes(k))) {
        const cleaned = line.replace(/^[•\-\s]+|[•\-\s]+$/g, '');
        if (line.length < 100 && !certifications.includes(cleaned)) certifications.push(cleaned);
      }
      if (['won', 'winner', 'hackathon', 'first place', 'scholarship', 'ranked', 'award'].some((k) => ll.includes(k))) {
        const cleaned = line.replace(/^[•\-\s]+|[•\-\s]+$/g, '');
        if (line.length < 120 && !achievements.includes(cleaned)) achievements.push(cleaned);
      }
    }

    // Quality Analysis
    const totalSkillsCount = Object.values(extractedSkills).reduce((acc, lst) => acc + lst.length, 0);
    const missingSections = [];
    if (!projects.length) missingSections.push('Dedicated Projects Section');
    if (!experiences.length) missingSections.push('Work Experience or Internship Experience');
    if (!certifications.length) missingSections.push('Certifications / Verified Credentials');
    if (phone === 'Not found in resume') missingSections.push('Phone Number / Direct Contact');
    if (college === 'Not found in resume') missingSections.push('College or Educational Institution');

    let atsScore = 60;
    if (totalSkillsCount >= 5) atsScore += 15;
    if (projects.length) atsScore += 10;
    if (experiences.length) atsScore += 10;
    if (email !== 'Not found in resume' && phone !== 'Not found in resume') atsScore += 5;
    atsScore = Math.min(95, Math.max(40, atsScore));

    const strongPoints = [];
    if (totalSkillsCount >= 6) {
      strongPoints.push(`Identified strong foundational technical stack (${totalSkillsCount} verified tools and technologies).`);
    }
    if (projects.length) {
      strongPoints.push(`Included ${projects.length} distinct practical project mentions.`);
    }
    if (experiences.length) {
      strongPoints.push('Demonstrates practical hands-on experience through internships or work roles.');
    }
    if (!strongPoints.length) {
      strongPoints.push('Clean resume layout with clear contact information.');
    }

    const improvementSuggestions = [];
    if (missingSections.length) {
      improvementSuggestions.push(`Add missing sections: ${missingSections.slice(0, 3).join(', ')}.`);
    }
    if (totalSkillsCount < 6) {
      improvementSuggestions.push(
        'Explicitly list technical skills under categorized headings (Languages, Frameworks, Cloud, Databases) to pass ATS scans.'
      );
    }
    improvementSuggestions.push(
      "Quantify project outcomes with real impact metrics (e.g., 'reduced load time by 30%', 'handled 5,000 requests')."
    );
    improvementSuggestions.push('Include links to your active GitHub repositories or live web demos.');

    return {
      personal_info: {
        name,
        email,
        phone,
        college,
        degree,
        graduation_year: gradYear,
      },
      technical_skills: extractedSkills,
      other_info: {
        projects: projects.slice(0, 5),
        internships_and_experience: experiences.slice(0, 5),
        certifications: certifications.slice(0, 5),
        achievements: achievements.slice(0, 5),
      },
      quality_analysis: {
        structure_rating: atsScore >= 75 ? 'Good' : atsScore >= 55 ? 'Needs Improvement' : 'Weak',
        ats_readability_score: atsScore,
        missing_sections: missingSections,
        strong_points: strongPoints,
        improvement_suggestions: improvementSuggestions,
        keyword_density_summary: `Detected ${totalSkillsCount} technical keywords across ${lines.length} lines of text.`,
      },
    };
  },
};
