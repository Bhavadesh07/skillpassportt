import { store } from '../store.js';

export const ROADMAP_TEMPLATES = {
  'AI Engineer': [
    {
      phase_number: 1,
      phase_title: 'Phase 1: Advanced Python & Software Foundations',
      topic: 'Modern Python, OOP & Clean Code for AI',
      description: 'Master object-oriented programming, async I/O, type hinting, decorators, and clean code practices necessary for scalable AI systems.',
      learning_objective: 'Write modular, production-ready Python packages with type safety and unit testing.',
      estimated_duration: '2 weeks',
      practical_task: 'Build an asynchronous CLI data processing tool using Python 3, argparse, and dataclasses.',
      resources: [
        { title: 'Official Python 3 Documentation', url: 'https://docs.python.org/3/tutorial/', type: 'Documentation' },
        { title: 'Real Python Advanced Tutorials', url: 'https://realpython.com/', type: 'Articles' },
        { title: 'Python for Everybody (FreeCodeCamp)', url: 'https://www.freecodecamp.org/news/python-curriculum/', type: 'Course' },
      ],
    },
    {
      phase_number: 2,
      phase_title: 'Phase 2: Mathematics & Statistics for AI',
      topic: 'Linear Algebra, Multivariate Calculus & Probability',
      description: 'Develop core mathematical intuition: matrix transformations, eigenvalues, partial gradients, Bayes theorem, and probability distributions.',
      learning_objective: 'Understand how gradient descent optimizes loss functions and how vectors represent high-dimensional embeddings.',
      estimated_duration: '2 weeks',
      practical_task: 'Implement gradient descent and matrix multiplication from scratch in pure Python without third-party ML libraries.',
      resources: [
        { title: '3Blue1Brown - Essence of Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', type: 'Video Series' },
        { title: 'Khan Academy Multivariable Calculus', url: 'https://www.khanacademy.org/math/multivariable-calculus', type: 'Course' },
      ],
    },
    {
      phase_number: 3,
      phase_title: 'Phase 3: Data Analysis & Feature Engineering',
      topic: 'NumPy, Pandas, Matplotlib & Exploratory Data Analysis',
      description: 'Learn vectorized computations, tabular data wrangling, missing data imputation, outlier detection, and statistical visualizations.',
      learning_objective: 'Transform messy raw datasets into clean, benchmarkable features for machine learning models.',
      estimated_duration: '2 weeks',
      practical_task: 'Perform end-to-end EDA on a 50,000+ row dataset from Kaggle and publish an informative visualization report.',
      resources: [
        { title: 'Kaggle Python & Pandas Micro-Courses', url: 'https://www.kaggle.com/learn', type: 'Interactive Labs' },
        { title: 'Official Pandas Documentation', url: 'https://pandas.pydata.org/docs/', type: 'Documentation' },
      ],
    },
    {
      phase_number: 4,
      phase_title: 'Phase 4: Machine Learning Fundamentals',
      topic: 'Supervised, Unsupervised Learning & Scikit-Learn',
      description: 'Master regression, classification (Random Forests, Gradient Boosting, SVM), clustering (K-Means), and rigorous cross-validation.',
      learning_objective: 'Train, tune hyperparameters, prevent overfitting, and evaluate models using ROC-AUC, F1-score, and confusion matrices.',
      estimated_duration: '3 weeks',
      practical_task: 'Build an end-to-end customer churn or fraud prediction pipeline with feature importance analysis using Scikit-Learn.',
      resources: [
        { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', type: 'Documentation' },
        { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'Course' },
      ],
    },
    {
      phase_number: 5,
      phase_title: 'Phase 5: Deep Learning & Neural Networks',
      topic: 'PyTorch, CNNs, RNNs & Transformers',
      description: 'Understand computational graphs, backpropagation, convolutional layers, attention mechanisms, and transformer architectures.',
      learning_objective: 'Train custom PyTorch deep neural networks with GPU acceleration and learn rate scheduling.',
      estimated_duration: '3 weeks',
      practical_task: 'Train a multi-class image classifier using transfer learning on ResNet/MobileNet with PyTorch.',
      resources: [
        { title: 'Deep Learning Specialization by Andrew Ng', url: 'https://www.deeplearning.ai/', type: 'Course' },
        { title: 'PyTorch Official Tutorials', url: 'https://pytorch.org/tutorials/', type: 'Documentation' },
        { title: 'Fast.ai Practical Deep Learning', url: 'https://course.fast.ai/', type: 'Course' },
      ],
    },
    {
      phase_number: 6,
      phase_title: 'Phase 6: Generative AI & Large Language Models',
      topic: 'RAG, Vector Databases, HuggingFace & Prompt Engineering',
      description: 'Construct retrieval-augmented generation pipelines, semantic search engines with ChromaDB/Pinecone, and fine-tune open weights models.',
      learning_objective: 'Architect enterprise AI assistants that query company documents accurately without hallucination.',
      estimated_duration: '3 weeks',
      practical_task: 'Build a functional multi-document Q&A assistant using LangChain/LlamaIndex, OpenAI/Gemini embeddings, and FastAPI.',
      resources: [
        { title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'Course' },
        { title: 'LangChain Documentation', url: 'https://python.langchain.com/docs/', type: 'Documentation' },
      ],
    },
    {
      phase_number: 7,
      phase_title: 'Phase 7: Model Deployment & MLOps',
      topic: 'FastAPI, Docker, ONNX & Cloud Serving',
      description: 'Containerize models with Docker, serve low-latency REST/gRPC endpoints, implement model monitoring, and manage inference latency.',
      learning_objective: 'Deploy scalable AI microservices to cloud platforms with CI/CD and automated health checks.',
      estimated_duration: '2 weeks',
      practical_task: 'Containerize your PyTorch model using Docker and deploy it to a live cloud host with Prometheus metrics.',
      resources: [
        { title: 'FastAPI Production Guide', url: 'https://fastapi.tiangolo.com/deployment/', type: 'Documentation' },
        { title: 'Docker Get Started Guide', url: 'https://docs.docker.com/get-started/', type: 'Guide' },
      ],
    },
    {
      phase_number: 8,
      phase_title: 'Phase 8: Portfolio Projects & Interview Preparation',
      topic: 'System Design, Coding Challenges & Technical Interviews',
      description: 'Polish your GitHub repositories, write comprehensive project documentation, practice LeetCode problem solving, and conduct mock system design interviews.',
      learning_objective: 'Confidently communicate architectural trade-offs, algorithmic complexity, and project results to recruiters and engineering managers.',
      estimated_duration: '2 weeks',
      practical_task: 'Record a 5-minute video walkthrough of your capstone AI project and publish a technical post on GitHub.',
      resources: [
        { title: 'NeetCode AI & Coding Roadmap', url: 'https://neetcode.io/roadmap', type: 'Practice' },
        { title: 'Machine Learning Systems Design Interview', url: 'https://github.com/chiphuyen/machine-learning-systems-design', type: 'Book' },
      ],
    },
  ],
  'Full Stack Developer': [
    {
      phase_number: 1,
      phase_title: 'Phase 1: Modern Web Foundations',
      topic: 'Semantic HTML5, Modern CSS, Responsive Design & JavaScript ES6+',
      description: 'Master flexbox, grid, asynchronous JS, promises, DOM manipulation, and modern web standards.',
      learning_objective: 'Build responsive, accessible frontend layouts that adapt to any screen size.',
      estimated_duration: '2 weeks',
      practical_task: 'Build a responsive web dashboard with dark mode and zero UI frameworks.',
      resources: [
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', type: 'Documentation' },
        { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'Guide' },
      ],
    },
    {
      phase_number: 2,
      phase_title: 'Phase 2: Frontend Engineering with React & Tailwind',
      topic: 'Component Architecture, State Management & Hooks',
      description: 'Deep dive into React components, custom hooks, context API, client routing, and utility-first styling with Tailwind CSS.',
      learning_objective: 'Architect high-performance single page applications with clean component hierarchies.',
      estimated_duration: '3 weeks',
      practical_task: 'Develop an interactive Kanban task board with drag-and-drop and local persistence.',
      resources: [
        { title: 'React Official Docs', url: 'https://react.dev/', type: 'Documentation' },
        { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', type: 'Documentation' },
      ],
    },
    {
      phase_number: 3,
      phase_title: 'Phase 3: Backend Development & REST APIs',
      topic: 'Node.js/Express or Python FastAPI, Routing & Validation',
      description: 'Build modular server backends, handle request validation, middleware, error handling, and file uploads.',
      learning_objective: 'Build secure, self-documenting REST APIs with comprehensive status codes and error responses.',
      estimated_duration: '3 weeks',
      practical_task: 'Build a full REST API for a content management system with automated validation and swagger docs.',
      resources: [
        { title: 'FastAPI Official Documentation', url: 'https://fastapi.tiangolo.com/', type: 'Documentation' },
        { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', type: 'Documentation' },
      ],
    },
    {
      phase_number: 4,
      phase_title: 'Phase 4: Relational & NoSQL Databases',
      topic: 'PostgreSQL, SQLAlchemy/Prisma, Indexing & Migrations',
      description: 'Design normalized database schemas, write optimized SQL queries, handle database migrations, and configure Redis caching.',
      learning_objective: 'Design scalable database schemas with foreign keys, indexes, and ACID compliance.',
      estimated_duration: '2 weeks',
      practical_task: 'Design a relational schema for an e-commerce platform with orders, items, inventory, and users with Alembic migrations.',
      resources: [
        { title: 'PostgreSQL Official Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', type: 'Tutorial' },
        { title: 'SQLBolt Interactive Lessons', url: 'https://sqlbolt.com/', type: 'Interactive' },
      ],
    },
    {
      phase_number: 5,
      phase_title: 'Phase 5: Authentication, Security & Real-Time Web',
      topic: 'JWT, OAuth2, WebSockets & Security Best Practices',
      description: 'Implement secure authentication, role-based access control, CSRF/CORS protection, and bidirectional WebSocket communication.',
      learning_objective: 'Secure full-stack applications against OWASP Top 10 vulnerabilities.',
      estimated_duration: '2 weeks',
      practical_task: 'Implement secure JWT login, refresh tokens, and real-time chat with WebSockets.',
      resources: [
        { title: 'OWASP Top 10 Security Guide', url: 'https://owasp.org/www-project-top-ten/', type: 'Guide' },
      ],
    },
    {
      phase_number: 6,
      phase_title: 'Phase 6: Deployment, CI/CD & Portfolio Showcase',
      topic: 'Docker, GitHub Actions, Cloud Hosting & System Design',
      description: 'Containerize the full stack, set up continuous integration pipelines, deploy to cloud hosts (AWS/Vercel/Render), and prepare for interviews.',
      learning_objective: 'Deploy production full-stack systems with custom domains and SSL.',
      estimated_duration: '2 weeks',
      practical_task: 'Deploy your complete full-stack capstone project to a live URL and link it to your GitHub portfolio.',
      resources: [
        { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'Documentation' },
      ],
    },
  ],
};

export const RoadmapEngine = {
  generateRoadmap({ student, role, missingSkills = [] }) {
    // Deactivate existing active roadmaps for this student (and role)
    for (const rm of store.learningRoadmaps) {
      if (rm.student_id === student.id && rm.career_role_id === role.id) {
        rm.is_active = false;
      }
      // Also deactivate prior active roadmaps so the latest selected role roadmap is active
      if (rm.student_id === student.id) {
        rm.is_active = false;
      }
    }

    const template = ROADMAP_TEMPLATES[role.title] || this._generateGenericTemplate(role, missingSkills);

    const roadmap = store.createLearningRoadmap({
      student_id: student.id,
      career_role_id: role.id,
      title: `Personalized ${role.title} Career Roadmap`,
      summary: `Customized ${student.preparation_timeline} action plan tailored for ${student.career_goal} readiness.`,
      total_phases: template.length,
      completed_phases: 0,
      progress_percentage: 0.0,
      is_active: true,
    });

    template.forEach((item, idx) => {
      store.createRoadmapActivity({
        roadmap_id: roadmap.id,
        phase_number: item.phase_number,
        phase_title: item.phase_title,
        topic: item.topic,
        description: item.description,
        learning_objective: item.learning_objective || null,
        estimated_duration: item.estimated_duration || '2 weeks',
        recommended_resources: item.resources || [],
        practical_task: item.practical_task || null,
        is_completed: false,
        completed_at: null,
        order_index: idx,
      });
    });

    return roadmap;
  },

  updateActivityStatus({ activityId, isCompleted, studentId }) {
    const activity = store.roadmapActivities.find((a) => a.id === activityId);
    if (!activity) {
      throw new Error('Roadmap activity not found or unauthorized.');
    }
    const roadmap = store.learningRoadmaps.find(
      (r) => r.id === activity.roadmap_id && r.student_id === studentId
    );
    if (!roadmap) {
      throw new Error('Roadmap activity not found or unauthorized.');
    }

    activity.is_completed = Boolean(isCompleted);
    activity.completed_at = isCompleted ? new Date().toISOString() : null;

    const activities = store.roadmapActivities.filter((a) => a.roadmap_id === roadmap.id);
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.is_completed).length;

    roadmap.progress_percentage =
      totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 1000) / 10 : 0.0;
    roadmap.completed_phases = completedActivities;
    roadmap.updated_at = new Date().toISOString();

    return { activity, roadmap };
  },

  _generateGenericTemplate(role, missingSkills) {
    const missingSlice = missingSkills && missingSkills.length
      ? missingSkills
      : ['Core Technologies', 'Tooling', 'Architecture'];
    const p1Skills = missingSlice.slice(0, 2).join(', ');
    const p2Skills = missingSlice.length > 2 ? missingSlice.slice(2, 4).join(', ') : 'Advanced Frameworks & Testing';

    return [
      {
        phase_number: 1,
        phase_title: 'Phase 1: Domain Foundations & Syntax',
        topic: `Foundations for ${role.title}`,
        description: `Master foundational principles, development environment setup, and primary languages required for ${role.title} (${p1Skills}).`,
        learning_objective: 'Establish rock-solid programming and domain foundations.',
        estimated_duration: '2 weeks',
        practical_task: `Complete hands-on coding exercises demonstrating fundamentals in ${p1Skills}.`,
        resources: [
          { title: `${role.title} Resource Guide`, url: 'https://roadmap.sh', type: 'Roadmap Reference' },
          { title: 'FreeCodeCamp Interactive Library', url: 'https://www.freecodecamp.org', type: 'Curriculum' },
        ],
      },
      {
        phase_number: 2,
        phase_title: 'Phase 2: Core Tooling & Frameworks',
        topic: `Specialized Competencies: ${p2Skills}`,
        description: `Dive into the essential framework and tooling ecosystem required for modern ${role.title} positions.`,
        learning_objective: 'Build interactive modules utilizing industry-standard libraries.',
        estimated_duration: '3 weeks',
        practical_task: 'Develop a functional prototype utilizing key frameworks and push code to GitHub.',
        resources: [
          { title: 'Official Framework Documentation', url: 'https://devdocs.io', type: 'Documentation' },
        ],
      },
      {
        phase_number: 3,
        phase_title: 'Phase 3: Production Projects & Architecture',
        topic: 'End-to-End System Integration',
        description: 'Combine frontend, backend, databases, and deployment pipelines into a coherent portfolio project.',
        learning_objective: 'Design and build a real-world project addressing genuine user problems.',
        estimated_duration: '3 weeks',
        practical_task: `Construct a portfolio-grade ${role.title} project with unit tests and clear README.`,
        resources: [
          { title: 'GitHub Guides & Open Source', url: 'https://github.com', type: 'Repository' },
        ],
      },
      {
        phase_number: 4,
        phase_title: 'Phase 4: Interview & Job Readiness',
        topic: 'Technical Interview Preparation & Showcase',
        description: 'Prepare for technical interviews, coding challenges, behavioral questions, and resume optimization for the target role.',
        learning_objective: 'Gain confidence to clear entry-level and internship screening rounds.',
        estimated_duration: '2 weeks',
        practical_task: 'Conduct a mock interview and apply to 5 verified target opportunities on Skill Passport.',
        resources: [
          { title: 'Technical Interview Preparation', url: 'https://leetcode.com', type: 'Practice' },
        ],
      },
    ];
  },
};
