import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderStudentProfilePage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const p = await api.get('/student/profile');

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="text-xs font-mono text-[#7C5CFC] font-semibold mb-1">STUDENT SKILL PASSPORT</div>
              <h1 class="text-3xl font-extrabold text-white font-heading">${p.full_name}</h1>
              <p class="text-sm text-slate-400 mt-1">${p.email} · ${p.college || 'University'} ${p.graduation_year ? `(Class of ${p.graduation_year})` : ''}</p>
            </div>
            <a href="#student/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">Back to Dashboard</a>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Profile Details Form -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 class="text-base font-bold text-white">Academic & Personal Details</h3>
              <form id="profile-update-form" class="space-y-3 text-xs">
                <div>
                  <label class="block text-slate-400 uppercase font-mono mb-1">Full Name</label>
                  <input type="text" id="p-name" value="${p.full_name || ''}" class="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-slate-400 uppercase font-mono mb-1">College / University</label>
                    <input type="text" id="p-college" value="${p.college || ''}" class="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
                  </div>
                  <div>
                    <label class="block text-slate-400 uppercase font-mono mb-1">Graduation Year</label>
                    <input type="number" id="p-grad" value="${p.graduation_year || ''}" class="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
                  </div>
                </div>
                <div>
                  <label class="block text-slate-400 uppercase font-mono mb-1">Course / Branch</label>
                  <input type="text" id="p-course" value="${p.course_branch || ''}" class="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 uppercase font-mono mb-1">Bio</label>
                  <textarea id="p-bio" rows="2" class="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white">${p.bio || ''}</textarea>
                </div>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold">Save Profile Changes</button>
              </form>
            </div>

            <!-- Add Manual Skill -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 class="text-base font-bold text-white">Verified Skills & Competencies</h3>
              <form id="add-skill-form" class="flex flex-wrap gap-2 text-xs">
                <input type="text" id="new-skill-name" required placeholder="Add skill (e.g. Kubernetes)" class="flex-1 min-w-[160px] px-3.5 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
                <select id="new-skill-cat" class="px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white">
                  <option value="languages">Language</option>
                  <option value="frameworks" selected>Framework</option>
                  <option value="databases">Database</option>
                  <option value="tools">Tool</option>
                  <option value="cloud">Cloud</option>
                  <option value="aiml">AI / ML</option>
                </select>
                <button type="submit" class="px-4 py-2 rounded-xl bg-[#7C5CFC] text-white font-bold">Add Skill</button>
              </form>

              <div class="space-y-3 pt-2">
                <div>
                  <span class="text-[10px] font-mono uppercase text-[#22D3EE] block mb-1.5">Resume-Extracted Skills (${p.resume_skills.length})</span>
                  <div class="flex flex-wrap gap-1.5">
                    ${p.resume_skills.length ? p.resume_skills.map(s => `
                      <span class="px-2.5 py-1 rounded-lg bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 text-xs font-mono inline-flex items-center gap-1.5">
                        ${s.name}
                        <button data-del-skill="${s.id}" class="hover:text-white">&times;</button>
                      </span>
                    `).join('') : '<span class="text-xs text-slate-500">None extracted yet</span>'}
                  </div>
                </div>

                <div>
                  <span class="text-[10px] font-mono uppercase text-[#7C5CFC] block mb-1.5">Manual Skills (${p.manual_skills.length})</span>
                  <div class="flex flex-wrap gap-1.5">
                    ${p.manual_skills.length ? p.manual_skills.map(s => `
                      <span class="px-2.5 py-1 rounded-lg bg-[#7C5CFC]/15 text-white border border-[#7C5CFC]/30 text-xs font-mono inline-flex items-center gap-1.5">
                        ${s.name}
                        <button data-del-skill="${s.id}" class="hover:text-[#EF4444]">&times;</button>
                      </span>
                    `).join('') : '<span class="text-xs text-slate-500">No manual skills added</span>'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Projects -->
          <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 class="text-base font-bold text-white">Portfolio Projects (${p.projects.length})</h3>
            <form id="add-project-form" class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input type="text" id="proj-title" required placeholder="Project Title *" class="px-3.5 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
              <input type="text" id="proj-tech" placeholder="Tech Stack (e.g. React, Python)" class="px-3.5 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white" />
              <button type="submit" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold">Add Project</button>
            </form>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${p.projects.map(pr => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 text-xs">
                  <div class="font-bold text-white text-sm">${pr.title}</div>
                  ${pr.description ? `<p class="text-slate-400 mt-1">${pr.description}</p>` : ''}
                  ${pr.technologies ? `<div class="text-[#22D3EE] font-mono text-[10px] mt-1.5">${pr.technologies}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      document.getElementById('profile-update-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.put('/student/profile', {
            full_name: document.getElementById('p-name').value.trim(),
            college: document.getElementById('p-college').value.trim() || null,
            graduation_year: document.getElementById('p-grad').value ? parseInt(document.getElementById('p-grad').value, 10) : null,
            course_branch: document.getElementById('p-course').value.trim() || null,
            bio: document.getElementById('p-bio').value.trim() || null,
          });
          toast.success('Profile updated!');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };

      document.getElementById('add-skill-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.post('/student/skills', {
            skill_name: document.getElementById('new-skill-name').value.trim(),
            category: document.getElementById('new-skill-cat').value,
          });
          toast.success('Skill added!');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };

      document.querySelectorAll('[data-del-skill]').forEach(btn => {
        btn.onclick = async () => {
          try {
            await api.delete(`/student/skills/${btn.getAttribute('data-del-skill')}`);
            toast.info('Skill removed.');
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
          }
        };
      });

      document.getElementById('add-project-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.post('/student/projects', {
            title: document.getElementById('proj-title').value.trim(),
            technologies_used: document.getElementById('proj-tech').value.trim() || null,
          });
          toast.success('Project added!');
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
