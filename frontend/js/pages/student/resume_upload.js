import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderResumeUploadPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const current = await api.get('/student/resume');

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="text-xs font-mono text-[#7C5CFC] font-semibold mb-1">RESUME INTELLIGENCE</div>
              <h1 class="text-3xl font-extrabold text-white font-heading">Upload & Parse Your Resume</h1>
              <p class="text-sm text-slate-400 mt-1">Upload a multi-page PDF or DOCX resume to extract verified skills, projects, and ATS feedback.</p>
            </div>
            <a href="#student/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">Back to Dashboard</a>
          </div>

          ${current.has_resume ? `
            <div class="glass-panel p-6 rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center">
                  <i data-lucide="file-check-2" class="w-6 h-6"></i>
                </div>
                <div>
                  <div class="text-sm font-bold text-white">${current.resume.file_name}</div>
                  <div class="text-xs text-slate-400 font-mono">
                    ${current.resume.page_count} page(s) · ${(current.resume.file_size / 1024).toFixed(1)} KB · ${current.resume.upload_status.toUpperCase()}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a href="#student/analysis" class="px-4 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-bold hover:opacity-95 transition">View Analysis</a>
                <button id="delete-resume-btn" class="px-3.5 py-2 rounded-xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-xs font-semibold hover:bg-[#EF4444]/25 transition">Remove</button>
              </div>
            </div>
          ` : ''}

          <!-- Upload Dropzone -->
          <div id="dropzone" class="glass-panel p-10 rounded-3xl border-2 border-dashed border-white/15 hover:border-[#7C5CFC]/60 transition text-center cursor-pointer space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-[#7C5CFC]/20 text-[#7C5CFC] mx-auto flex items-center justify-center">
              <i data-lucide="upload-cloud" class="w-8 h-8"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Drop your PDF or DOCX resume here</h3>
              <p class="text-xs text-slate-400 mt-1">Supports multi-page documents up to 10 MB. Stored privately in your student workspace.</p>
            </div>
            <input type="file" id="resume-file-input" accept=".pdf,.docx" class="hidden" />
            <button type="button" id="browse-file-btn" class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition">
              Select Resume File
            </button>
            <div id="upload-status-text" class="text-xs text-[#22D3EE] font-mono hidden"></div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Next step after upload: review extracted competencies and select your target career role.</span>
            <a href="#student/role-selection" class="text-[#22D3EE] font-semibold hover:underline">Proceed to Role Selection &rarr;</a>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      const dropzone = document.getElementById('dropzone');
      const fileInput = document.getElementById('resume-file-input');
      const browseBtn = document.getElementById('browse-file-btn');
      const statusText = document.getElementById('upload-status-text');

      const uploadFile = async (file) => {
        if (!file) return;
        statusText.classList.remove('hidden');
        statusText.textContent = `Parsing and analyzing "${file.name}"...`;
        browseBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
          await api.upload('/student/upload-resume', formData);
          toast.success('Resume analyzed and skills synced to your profile!');
          window.location.hash = '#student/analysis';
        } catch (err) {
          toast.error(err.message, 'Upload Failed');
          statusText.textContent = err.message;
          browseBtn.disabled = false;
        }
      };

      browseBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) uploadFile(e.target.files[0]);
      };

      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      };
      dropzone.ondragleave = () => dropzone.classList.remove('drag-active');
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          uploadFile(e.dataTransfer.files[0]);
        }
      };

      const delBtn = document.getElementById('delete-resume-btn');
      if (delBtn) {
        delBtn.onclick = async () => {
          try {
            await api.delete('/student/resume');
            toast.info('Resume removed.');
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
          }
        };
      }
    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
