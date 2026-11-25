import { api } from '../../api.js';
import { renderRadialGauge } from '../../components/charts.js';

export async function renderResumeAnalysisPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/student/resume');
    if (!data.has_resume || !data.analysis) {
      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full text-center py-20 space-y-4">
          <i data-lucide="file-search" class="w-12 h-12 text-slate-600 mx-auto"></i>
          <h2 class="text-2xl font-bold text-white">No Resume Analysis Yet</h2>
          <p class="text-sm text-slate-400">Upload a PDF or DOCX resume to unlock extracted skills and ATS readability insights.</p>
          <a href="#student/resume" class="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold">Upload Resume</a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const { resume, analysis } = data;
    const pInfo = analysis.personal_info || {};
    const skills = analysis.technical_skills || {};
    const other = analysis.other_info || {};
    const qa = analysis.quality_analysis || {};

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="text-xs font-mono text-[#22D3EE] font-semibold mb-1">AI RESUME EXTRACTION · ${analysis.ai_provider_used}</div>
            <h1 class="text-3xl font-extrabold text-white font-heading">${resume.file_name}</h1>
            <p class="text-sm text-slate-400 mt-1">${resume.page_count} page(s) parsed · Honest extraction strictly from document content</p>
          </div>
          <div class="flex items-center gap-3">
            <a href="#student/resume" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">Upload New</a>
            <a href="#student/role-selection" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold">Select Target Role &rarr;</a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
            ${renderRadialGauge({
              score: qa.ats_readability_score || 60,
              size: 150,
              strokeWidth: 11,
              label: qa.structure_rating || 'Good',
              sublabel: 'ATS Score',
            })}
            <h3 class="text-base font-bold text-white mt-4">ATS Structure: ${qa.structure_rating || 'Good'}</h3>
            <p class="text-xs text-slate-400 mt-1">${qa.keyword_density_summary || ''}</p>
          </div>

          <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 class="text-base font-bold text-white">Extracted Candidate Details</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5"><span class="text-slate-400 block">Name</span><strong class="text-white">${pInfo.name || 'Not found'}</strong></div>
              <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5"><span class="text-slate-400 block">Email</span><strong class="text-white">${pInfo.email || 'Not found'}</strong></div>
              <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5"><span class="text-slate-400 block">Phone</span><strong class="text-white">${pInfo.phone || 'Not found'}</strong></div>
              <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5"><span class="text-slate-400 block">College</span><strong class="text-white">${pInfo.college || 'Not found'}</strong></div>
              <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5"><span class="text-slate-400 block">Degree</span><strong class="text-white">${pInfo.degree || 'Not found'}</strong></div>
              <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5"><span class="text-slate-400 block">Graduation Year</span><strong class="text-white">${pInfo.graduation_year || 'Not found'}</strong></div>
            </div>
          </div>
        </div>

        <!-- Categorized Technical Skills -->
        <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 class="text-base font-bold text-white">Extracted Technical Skills</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${Object.entries(skills).map(([cat, list]) => `
              <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5">
                <div class="text-[11px] font-mono uppercase text-[#22D3EE] font-bold mb-2">${cat}</div>
                <div class="flex flex-wrap gap-1.5">
                  ${(list && list.length) ? list.map(s => `<span class="px-2 py-0.5 rounded bg-[#7C5CFC]/20 text-white text-xs font-mono">${s}</span>`).join('') : '<span class="text-xs text-slate-500">None detected</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quality Feedback -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 class="text-base font-bold text-[#22C55E]">Strengths Identified</h3>
            <ul class="space-y-2 text-xs text-slate-300 list-disc pl-4">
              ${(qa.strong_points || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 class="text-base font-bold text-[#F59E0B]">Actionable Improvement Suggestions</h3>
            <ul class="space-y-2 text-xs text-slate-300 list-disc pl-4">
              ${(qa.improvement_suggestions || []).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>

        ${(other.projects && other.projects.length) ? `
          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 class="text-base font-bold text-white">Detected Projects</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${other.projects.map(p => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 text-xs">
                  <div class="font-bold text-white text-sm">${p.title}</div>
                  <p class="text-slate-400 mt-1">${p.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
