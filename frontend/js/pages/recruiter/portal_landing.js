import { appState } from '../../state.js';
import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export function renderRecruiterPortalLanding(container) {
  const { user } = appState.get();

  container.innerHTML = `
    <div class="flex-1 animate-fade-in">
      <!-- Hero Section -->
      <section class="relative pt-16 pb-20 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#111827] via-[#0B0F19] to-[#0B0F19]">
        <!-- Background Glows -->
        <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-[#7C5CFC]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <!-- Top Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-xs font-semibold text-[#22D3EE] mb-6 backdrop-blur-md">
            <i data-lucide="building" class="w-4 h-4"></i>
            <span>Skill Passport for Recruiters & Hiring Teams</span>
          </div>

          <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 font-heading leading-tight max-w-4xl mx-auto">
            Hire Verified College Talent <br/>
            <span class="gradient-text-purple-cyan">Matched by AI Skill Intelligence</span>
          </h1>

          <p class="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate resume screening bottlenecks. Connect with students whose technical proficiencies, roadmap milestones, and projects are systematically verified.
          </p>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
            ${user && user.role === 'recruiter' ? `
              <a href="#recruiter/dashboard" class="px-8 py-4 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] font-bold text-sm shadow-xl shadow-[#22D3EE]/20 hover:opacity-95 transition flex items-center gap-2">
                <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                <span>Open Recruiter Dashboard</span>
              </a>
              <a href="#recruiter/post-job" class="px-6 py-4 rounded-xl bg-[#172033] border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4 text-[#22D3EE]"></i>
                <span>Post an Opportunity</span>
              </a>
            ` : `
              <button id="quick-demo-recruiter-btn" class="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] font-bold text-sm shadow-xl shadow-[#22D3EE]/25 hover:opacity-95 transition flex items-center gap-2">
                <i data-lucide="zap" class="w-4 h-4"></i>
                <span>Instant 1-Click Recruiter Demo</span>
              </button>
              <a href="#register-recruiter" class="px-6 py-3.5 rounded-xl bg-[#172033] border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition flex items-center gap-2">
                <i data-lucide="user-plus" class="w-4 h-4 text-[#22D3EE]"></i>
                <span>Register Company</span>
              </a>
              <a href="#login" class="px-5 py-3.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm font-semibold transition">
                Sign In
              </a>
            `}
          </div>
        </div>
      </section>

      <!-- Recruiter Highlights Grid -->
      <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#22D3EE] mb-2 font-bold">Employer Features</h2>
          <h3 class="text-3xl font-extrabold text-white font-heading">Everything You Need to Hire Job-Ready Graduates</h3>
          <p class="text-slate-400 mt-2 text-sm">A direct bridge between your talent requirements and students' verified competencies.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center mb-5">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">Verified Skill Profiles</h4>
            <p class="text-xs text-slate-400 leading-relaxed">
              Every student profile displays skills extracted directly from multi-page resumes and scored against rigorous role frameworks.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center mb-5">
              <i data-lucide="briefcase" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">Role & Internship Postings</h4>
            <p class="text-xs text-slate-400 leading-relaxed">
              Publish internships, entry-level developer roles, and stipends. Specify mandatory vs optional skill prerequisites easily.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mb-5">
              <i data-lucide="sparkles" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">AI Match Scoring</h4>
            <p class="text-xs text-slate-400 leading-relaxed">
              Our matching engine automatically calculates the candidate readiness score for your vacancy, ranking the best fits instantly.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center mb-5">
              <i data-lucide="calendar" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">Built-in Interview Tracker</h4>
            <p class="text-xs text-slate-400 leading-relaxed">
              Move candidates through Review, Shortlisted, Interview Scheduled, and Hired with direct meeting links and automated candidate alerts.
            </p>
          </div>
        </div>
      </section>

      <!-- Recruiter Portal Workflow -->
      <section class="py-16 bg-[#111827]/50 border-y border-white/5">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
              <div class="w-8 h-8 rounded-lg bg-[#22D3EE] text-[#0B0F19] font-mono font-bold flex items-center justify-center mb-4 text-xs">1</div>
              <h4 class="text-base font-bold text-white mb-2">Create Recruiter Profile</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Sign up with your company name, designation, and official email to receive your corporate hiring passport.</p>
            </div>

            <div class="p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
              <div class="w-8 h-8 rounded-lg bg-[#7C5CFC] text-white font-mono font-bold flex items-center justify-center mb-4 text-xs">2</div>
              <h4 class="text-base font-bold text-white mb-2">Post Verified Openings</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Define requirements, stipends, and work mode (Remote / Hybrid / On-site). Students are instantly matched.</p>
            </div>

            <div class="p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
              <div class="w-8 h-8 rounded-lg bg-[#22C55E] text-white font-mono font-bold flex items-center justify-center mb-4 text-xs">3</div>
              <h4 class="text-base font-bold text-white mb-2">Shortlist & Hire</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Inspect resume breakdowns, view missing skills, schedule Google Meet / Zoom interviews, and extend offers.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Demo Access Banner -->
      <section class="py-16 max-w-4xl mx-auto px-4 text-center">
        <div class="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#172033] via-[#111827] to-[#172033] border border-[#22D3EE]/30 shadow-2xl">
          <div class="w-14 h-14 rounded-2xl bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center mx-auto mb-4">
            <i data-lucide="key" class="w-7 h-7"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-2">Want to test the Recruiter Portal right away?</h3>
          <p class="text-sm text-slate-400 mb-6 max-w-lg mx-auto">
            You can either register your own recruiter profile or use our pre-verified recruiter test credentials to explore all features instantly.
          </p>

          <div class="inline-flex flex-wrap items-center justify-center gap-3">
            <a href="#register-recruiter" class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] font-bold text-xs hover:opacity-95 transition">
              Create Free Recruiter Account
            </a>
            <a href="#login" class="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs hover:bg-white/10 transition">
              Recruiter Sign In
            </a>
          </div>
        </div>
      </section>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const demoBtn = document.getElementById('quick-demo-recruiter-btn');
  if (demoBtn) {
    demoBtn.onclick = async () => {
      demoBtn.disabled = true;
      demoBtn.innerHTML = `<span class="animate-spin mr-2">&#9696;</span> Logging in as Recruiter...`;
      try {
        // Log in as pre-seeded verified recruiter
        const res = await api.post('/auth/login', {
          email: 'veerendrarajuindus@gmail.com',
          password: 'Password123!'
        });
        api.setToken(res.access_token);
        const me = await api.get('/auth/me');
        appState.setUser(me);
        toast.success(`Logged in as Recruiter (${me.company_name || 'BUNNY TECH'})!`);
        window.location.hash = '#recruiter/dashboard';
      } catch (err) {
        // If password is not Password123!, redirect to login form
        window.location.hash = '#login';
        toast.info('Please enter your recruiter credentials on the login screen.');
      }
    };
  }
}
