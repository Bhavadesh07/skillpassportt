import { api } from '../../api.js';
import { renderRadialGauge } from '../../components/charts.js';

export async function renderCareerReportPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/student/career-analysis');
    if (!data.has_selected_role || !data.analysis) {
      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full text-center py-20 space-y-4">
          <i data-lucide="target" class="w-12 h-12 text-slate-600 mx-auto"></i>
          <h2 class="text-2xl font-bold text-white">No Target Role Selected</h2>
          <p class="text-sm text-slate-400">Choose a career role to view your weighted skill compatibility and gap breakdown.</p>
          <a href="#student/role-selection" class="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold">Select Target Role</a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const { role, student_preferences, analysis } = data;
    const achieve = analysis.what_student_can_achieve || {};
    const recs = analysis.recommendations || {};

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="text-xs font-mono text-[#22D3EE] font-semibold mb-1">CAREER COMPATIBILITY REPORT · ${role.category}</div>
            <h1 class="text-3xl font-extrabold text-white font-heading">${role.title}</h1>
            <p class="text-sm text-slate-400 mt-1">${student_preferences.experience_level} · ${student_preferences.career_goal} · ${student_preferences.preparation_timeline} timeline</p>
          </div>
          <div class="flex items-center gap-3">
            <a href="#student/role-selection" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">Change Role</a>
            <a href="#student/roadmap" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold">Open Learning Roadmap &rarr;</a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            ${renderRadialGauge({
              score: analysis.compatibility_score,
              size: 164,
              strokeWidth: 12,
              label: analysis.career_readiness,
              sublabel: analysis.career_readiness,
            })}
            <h3 class="text-base font-bold text-white mt-4">${analysis.career_readiness}</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">${analysis.score_explanation}</p>
          </div>

          <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
            <div>
              <h3 class="text-xs font-mono uppercase text-[#22C55E] font-bold mb-2">Matched Skills (${analysis.matched_skills.length})</h3>
              <div class="flex flex-wrap gap-1.5">
                ${analysis.matched_skills.length ? analysis.matched_skills.map(s => `<span class="px-2.5 py-1 rounded-lg bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs font-mono">✓ ${s}</span>`).join('') : '<span class="text-xs text-slate-500">No direct matches yet</span>'}
              </div>
            </div>

            <div>
              <h3 class="text-xs font-mono uppercase text-[#EF4444] font-bold mb-2">Missing / Priority Skills to Learn (${analysis.missing_skills.length})</h3>
              <div class="flex flex-wrap gap-1.5">
                ${analysis.missing_skills.length ? analysis.missing_skills.map(s => `<span class="px-2.5 py-1 rounded-lg bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-xs font-mono">${s}</span>`).join('') : '<span class="text-xs text-[#22C55E]">All core requirements covered!</span>'}
              </div>
            </div>

            <div>
              <h3 class="text-xs font-mono uppercase text-[#22D3EE] font-bold mb-2">Related Competencies (${analysis.related_skills.length})</h3>
              <div class="flex flex-wrap gap-1.5">
                ${analysis.related_skills.map(s => `<span class="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-mono">${s}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 class="text-base font-bold text-white">What You Can Achieve</h3>
            <p class="text-xs text-slate-300 leading-relaxed">${achieve.narrative || ''}</p>
            <div class="text-xs space-y-2 pt-2">
              <div><strong class="text-[#22C55E]">Ready to Apply:</strong> <span class="text-slate-300">${(achieve.roles_ready_to_apply || []).join(', ')}</span></div>
              <div><strong class="text-[#22D3EE]">With Preparation:</strong> <span class="text-slate-300">${(achieve.roles_requiring_preparation || []).join(', ')}</span></div>
              <div><strong class="text-[#7C5CFC]">Long-Term Trajectory:</strong> <span class="text-slate-300">${(achieve.long_term_goals || []).join(', ')}</span></div>
            </div>
            <p class="text-[11px] text-slate-500 pt-2 border-t border-white/5">${achieve.disclaimer || ''}</p>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 class="text-base font-bold text-white">Recommended Projects & Prep</h3>
            <ul class="space-y-2 text-xs text-slate-300 list-disc pl-4">
              ${(recs.recommended_projects || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
            <div class="text-xs text-[#22D3EE] font-mono pt-2 border-t border-white/5">${recs.suggested_pacing || ''}</div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
