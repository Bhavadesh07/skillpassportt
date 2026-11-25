import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderRoleSelectionPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const roles = await api.get('/student/career-roles');
    let selectedRoleId = roles[0]?.id || null;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="text-xs font-mono text-[#7C5CFC] font-semibold mb-1">CAREER TARGETING</div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Select Your Target Career Role</h1>
            <p class="text-sm text-slate-400 mt-1">Choose a career path and your preparation parameters to compute skill compatibility and generate a phased roadmap.</p>
          </div>
          <a href="#student/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">Back to Dashboard</a>
        </div>

        <form id="role-select-form" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="roles-grid">
            ${roles.map((r, idx) => `
              <button type="button" data-role-id="${r.id}" class="role-card text-left p-5 rounded-2xl border transition ${idx === 0 ? 'bg-[#172033] border-[#7C5CFC] shadow-lg shadow-[#7C5CFC]/15' : 'bg-[#111827]/70 border-white/5 hover:border-white/20'}">
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#22D3EE]">${r.category}</span>
                </div>
                <h3 class="text-base font-bold text-white mb-1">${r.title}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 mb-3">${r.description}</p>
                <div class="flex flex-wrap gap-1">
                  ${(r.core_skills || []).map(s => `<span class="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">${s}</span>`).join('')}
                </div>
              </button>
            `).join('')}
          </div>

          <!-- Preparation Preferences -->
          <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <h3 class="text-base font-bold text-white">Your Career Preferences</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Current Experience Level</label>
                <select id="exp-level" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Primary Career Goal</label>
                <select id="career-goal" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm">
                  <option value="Internship">Internship</option>
                  <option value="Entry-level job">Entry-level job</option>
                  <option value="Placement preparation">Placement preparation</option>
                  <option value="Advanced career preparation">Advanced career preparation</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Preparation Timeline</label>
                <select id="prep-timeline" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm">
                  <option value="1 month">1 month</option>
                  <option value="3 months" selected>3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Or Enter a Custom Role Title (Optional)</label>
              <input type="text" id="custom-role" placeholder="e.g. Blockchain Protocol Engineer" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
            </div>

            <button type="submit" id="generate-career-btn" class="w-full py-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Evaluate Compatibility & Generate Roadmap</span>
            </button>
          </div>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.querySelectorAll('.role-card').forEach(card => {
      card.onclick = () => {
        selectedRoleId = parseInt(card.getAttribute('data-role-id'), 10);
        document.querySelectorAll('.role-card').forEach(c => {
          c.className = 'role-card text-left p-5 rounded-2xl border transition bg-[#111827]/70 border-white/5 hover:border-white/20';
        });
        card.className = 'role-card text-left p-5 rounded-2xl border transition bg-[#172033] border-[#7C5CFC] shadow-lg shadow-[#7C5CFC]/15';
      };
    });

    document.getElementById('role-select-form').onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById('generate-career-btn');
      btn.disabled = true;
      const customTitle = document.getElementById('custom-role').value.trim();

      try {
        await api.post('/student/select-role', {
          role_id: customTitle ? null : selectedRoleId,
          custom_role_title: customTitle || null,
          experience_level: document.getElementById('exp-level').value,
          career_goal: document.getElementById('career-goal').value,
          preparation_timeline: document.getElementById('prep-timeline').value,
        });
        toast.success('Career compatibility evaluated and roadmap generated!');
        window.location.hash = '#student/career-report';
      } catch (err) {
        toast.error(err.message);
        btn.disabled = false;
      }
    };
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
