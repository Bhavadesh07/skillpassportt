import { api } from '../../api.js';
import { toast } from '../../components/toast.js';
import { renderProgressBar } from '../../components/charts.js';

export async function renderRoadmapPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const data = await api.get('/student/roadmap');
      if (!data.has_roadmap || !data.roadmap) {
        container.innerHTML = `
          <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full text-center py-20 space-y-4">
            <i data-lucide="map" class="w-12 h-12 text-slate-600 mx-auto"></i>
            <h2 class="text-2xl font-bold text-white">No Active Learning Roadmap</h2>
            <p class="text-sm text-slate-400">Select your target career role to generate a step-by-step interactive roadmap.</p>
            <a href="#student/role-selection" class="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold">Select Target Role</a>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      const rm = data.roadmap;

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in space-y-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="text-xs font-mono text-[#7C5CFC] font-semibold mb-1">PERSONALIZED LEARNING PLAN · ${rm.role_title.toUpperCase()}</div>
              <h1 class="text-3xl font-extrabold text-white font-heading">${rm.title}</h1>
              <p class="text-sm text-slate-400 mt-1">${rm.summary || ''}</p>
            </div>
            <button id="regen-roadmap-btn" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition flex items-center gap-2">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-[#22D3EE]"></i>
              <span>Regenerate Roadmap</span>
            </button>
          </div>

          <!-- Progress Overview -->
          <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="font-bold text-white">${rm.completed_phases} of ${rm.total_phases} Phases Completed</span>
              <span class="font-mono font-black text-[#22C55E] text-lg">${Math.round(rm.progress_percentage)}%</span>
            </div>
            ${renderProgressBar({ percentage: rm.progress_percentage, color: 'bg-gradient-to-r from-[#7C5CFC] to-[#22C55E]' })}
          </div>

          <!-- Phases List -->
          <div class="space-y-4">
            ${rm.activities.map(act => `
              <div class="glass-panel p-6 rounded-2xl border transition ${act.is_completed ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-white/5'} space-y-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3.5">
                    <input type="checkbox" data-activity-id="${act.id}" ${act.is_completed ? 'checked' : ''} class="activity-toggle mt-1 w-5 h-5 rounded accent-[#22C55E] cursor-pointer" />
                    <div>
                      <div class="flex flex-wrap items-center gap-2 mb-1">
                        <span class="text-xs font-mono text-[#22D3EE] font-bold">${act.phase_title}</span>
                        <span class="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">${act.estimated_duration}</span>
                      </div>
                      <h3 class="text-base font-bold text-white ${act.is_completed ? 'line-through opacity-70' : ''}">${act.topic}</h3>
                      <p class="text-xs text-slate-300 mt-1 leading-relaxed">${act.description}</p>
                    </div>
                  </div>
                </div>

                ${act.practical_task ? `
                  <div class="p-3.5 rounded-xl bg-[#111827]/70 border border-white/5 text-xs">
                    <strong class="text-[#7C5CFC] font-mono uppercase text-[10px] block mb-1">Hands-On Practical Task</strong>
                    <span class="text-slate-300">${act.practical_task}</span>
                  </div>
                ` : ''}

                ${(act.recommended_resources && act.recommended_resources.length) ? `
                  <div class="flex flex-wrap items-center gap-2 pt-1">
                    <span class="text-[10px] font-mono uppercase text-slate-500">Resources:</span>
                    ${act.recommended_resources.map(res => `
                      <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#22D3EE] font-medium transition inline-flex items-center gap-1">
                        <span>${res.title}</span>
                        <i data-lucide="external-link" class="w-3 h-3"></i>
                      </a>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      document.querySelectorAll('.activity-toggle').forEach(cb => {
        cb.onchange = async () => {
          const id = cb.getAttribute('data-activity-id');
          try {
            await api.patch(`/student/roadmap/activity/${id}`, { is_completed: cb.checked });
            toast.success(cb.checked ? 'Phase marked completed!' : 'Phase unmarked.');
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
            cb.checked = !cb.checked;
          }
        };
      });

      document.getElementById('regen-roadmap-btn').onclick = async () => {
        try {
          await api.post('/student/roadmap/regenerate');
          toast.success('Roadmap regenerated!');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };
    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
