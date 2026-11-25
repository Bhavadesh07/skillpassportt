import { api } from '../../api.js';
import { renderRadialGauge, renderProgressBar } from '../../components/charts.js';

export async function renderStudentDashboard(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/student/dashboard');
    const { student, resume_status, skills_summary, roadmap_progress, recommended_opportunities, recent_notifications } = data;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#7C5CFC] font-semibold mb-1">
              <span>STUDENT CAREER INTELLIGENCE</span>
              <span>•</span>
              <span class="text-slate-400">${student.college || 'COLLEGE PORTAL'}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Welcome back, ${student.full_name}</h1>
            <p class="text-sm text-slate-400 mt-1">
              ${student.selected_role ? `Target Career Path: <strong class="text-[#22D3EE]">${student.selected_role}</strong>` : 'Select a target career role to generate your AI readiness report and roadmap.'}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <a href="#student/resume" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition flex items-center gap-2">
              <i data-lucide="upload" class="w-4 h-4 text-[#7C5CFC]"></i>
              <span>${resume_status.has_resume ? 'Update Resume' : 'Upload Resume'}</span>
            </a>
            <a href="#student/role-selection" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="target" class="w-4 h-4"></i>
              <span>${student.selected_role ? 'Change Target Role' : 'Select Target Role'}</span>
            </a>
          </div>
        </div>

        <!-- Top Grid: Readiness Gauge + Key Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
            ${renderRadialGauge({
              score: student.readiness_score || 0,
              size: 164,
              strokeWidth: 12,
              label: student.readiness_level || 'Beginner',
              sublabel: student.readiness_level || 'Readiness',
            })}
            <h3 class="text-base font-bold text-white mt-4">Career Readiness Score</h3>
            <p class="text-xs text-slate-400 mt-1">${student.selected_role || 'No target role chosen yet'}</p>
            ${student.selected_role ? `
              <a href="#student/career-report" class="mt-4 text-xs font-semibold text-[#22D3EE] hover:underline flex items-center gap-1">
                <span>View Full Career Report</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            ` : ''}
          </div>

          <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono uppercase text-slate-400">Verified Skills</span>
                  <i data-lucide="award" class="w-4 h-4 text-[#7C5CFC]"></i>
                </div>
                <div class="text-3xl font-black text-white font-mono">${skills_summary.total_skills}</div>
                <div class="text-xs text-slate-400 mt-1">
                  ${skills_summary.resume_extracted} from resume · ${skills_summary.manual_added} manual
                </div>
              </div>
              <a href="#student/profile" class="mt-4 text-xs font-semibold text-[#7C5CFC] hover:underline">Manage Skills & Profile &rarr;</a>
            </div>

            <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono uppercase text-slate-400">Resume Status</span>
                  <i data-lucide="file-text" class="w-4 h-4 text-[#22D3EE]"></i>
                </div>
                <div class="text-base font-bold text-white truncate">
                  ${resume_status.has_resume ? resume_status.file_name : 'No resume uploaded'}
                </div>
                <div class="text-xs text-slate-400 mt-1">
                  ${resume_status.has_resume ? `Status: ${resume_status.upload_status}` : 'Upload PDF or DOCX for AI skill extraction'}
                </div>
              </div>
              <a href="${resume_status.has_resume ? '#student/analysis' : '#student/resume'}" class="mt-4 text-xs font-semibold text-[#22D3EE] hover:underline">
                ${resume_status.has_resume ? 'Inspect AI Analysis →' : 'Upload Resume Now →'}
              </a>
            </div>

            <div class="sm:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-mono uppercase text-slate-400 block">Active Learning Roadmap</span>
                  <span class="text-base font-bold text-white">
                    ${roadmap_progress.has_roadmap ? `${roadmap_progress.completed_phases} of ${roadmap_progress.total_phases} Phases Completed` : 'No active roadmap generated yet'}
                  </span>
                </div>
                <span class="text-xl font-black font-mono text-[#22C55E]">${Math.round(roadmap_progress.progress_percentage || 0)}%</span>
              </div>
              ${renderProgressBar({ percentage: roadmap_progress.progress_percentage || 0, color: 'bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE]' })}
              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-slate-400">
                  ${skills_summary.missing_skills.length ? `Top Skill Gaps: ${skills_summary.missing_skills.slice(0, 3).join(', ')}` : 'Check off phases as you learn'}
                </span>
                <a href="${roadmap_progress.has_roadmap ? '#student/roadmap' : '#student/role-selection'}" class="text-[#22D3EE] font-semibold hover:underline">
                  ${roadmap_progress.has_roadmap ? 'Open Roadmap →' : 'Generate Roadmap →'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Grid: Recommended Opportunities & Recent Notifications -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="briefcase" class="w-5 h-5 text-[#22D3EE]"></i>
                Recommended Verified Opportunities
              </h3>
              <a href="#opportunities" class="text-xs text-[#22D3EE] font-semibold hover:underline">Browse All &rarr;</a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${recommended_opportunities.map(opp => `
                <a href="#opportunities/${opp.id}" class="p-4 rounded-xl bg-[#111827]/70 border border-white/5 hover:border-[#7C5CFC]/40 transition block">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300">${opp.opportunity_type}</span>
                    <span class="text-xs font-mono font-bold text-[#22C55E]">${opp.match_percentage}% Match</span>
                  </div>
                  <div class="text-sm font-bold text-white truncate">${opp.title}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${opp.company} · ${opp.work_mode}</div>
                </a>
              `).join('')}
            </div>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="bell" class="w-5 h-5 text-[#7C5CFC]"></i>
                Recent Alerts
              </h3>
              <a href="#notifications" class="text-xs text-[#7C5CFC] font-semibold hover:underline">View All</a>
            </div>
            <div class="space-y-3">
              ${recent_notifications.length === 0 ? `
                <p class="text-xs text-slate-500 py-6 text-center">No recent notifications.</p>
              ` : recent_notifications.map(n => `
                <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5 text-xs">
                  <div class="font-bold text-white">${n.title}</div>
                  <div class="text-slate-400 mt-0.5 line-clamp-2">${n.message}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
