import { addTemplate, exportTemplates, importTemplatesFromFile } from './templateManager.js';
import { renderTemplates, setDeleteMode, isDeleteMode } from './templateRenderer.js';
import { setupSettingsModal } from './settingsManager.js';

export function setupTemplateLoader() {
  const searchBox = document.getElementById("searchBox");
  const manageBtn = document.getElementById("manageTemplatesBtn");
  const closeModal = document.getElementById("closeModal");
  const modal = document.getElementById("templateModal");
  const singleBtn = document.getElementById("singleTemplateMode");
  const bulkBtn = document.getElementById("bulkTemplateMode");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const deleteBtn = document.getElementById("deleteModeBtn");

  const singleSection = document.getElementById("singleTemplateSection");
  const bulkSection = document.getElementById("bulkTemplateSection");

  document.getElementById("addTemplateBtn").onclick = addSingleTemplate;
  document.getElementById("bulkAddBtn").onclick = bulkAddTemplates;
  exportBtn.onclick = exportTemplates;
  importBtn.onclick = () => document.getElementById("jsonFile").click();
  document.getElementById("jsonFile").onchange = (e) =>
    importTemplatesFromFile(e.target.files[0], () =>
      renderTemplates(searchBox.value.trim().toLowerCase())
    );

  manageBtn.onclick = () => {
    if (isDeleteMode()) {
      setDeleteMode(false);
      manageBtn.textContent = "Manage Templates";
      renderTemplates(searchBox.value.trim().toLowerCase());
    } else {
      modal.classList.remove("hidden");
      singleSection.classList.add("hidden");
      bulkSection.classList.add("hidden");
    }
  };

  deleteBtn.onclick = () => {
    setDeleteMode(true);
    modal.classList.add("hidden");
    manageBtn.textContent = "Finished Editing";
    renderTemplates(searchBox.value.trim().toLowerCase());
  };

  closeModal.onclick = () => modal.classList.add("hidden");
  window.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };

  singleBtn.onclick = () => {
    singleSection.classList.remove("hidden");
    bulkSection.classList.add("hidden");
  };

  bulkBtn.onclick = () => {
    bulkSection.classList.remove("hidden");
    singleSection.classList.add("hidden");
  };

  searchBox.addEventListener("input", () => {
    renderTemplates(searchBox.value.trim().toLowerCase());
  });

  // document.getElementById("themeToggle").onclick = () => {
  //   document.body.classList.toggle("dark-theme");
  // };

  // setupSettingsModal(renderTemplates);
  renderTemplates("");
}

// Helpers
function addSingleTemplate() {
  const text = document.getElementById("templateText").value.trim();
  const category = document.getElementById("templateCategory").value.trim();
  const tags = document.getElementById("templateTags").value.trim();
  if (!text) return alert("Template text is required.");
  addTemplate({ text, category, tags });
  clearInputs();
  renderTemplates("");
  alert("✅ Template added!");
}

function bulkAddTemplates() {
  const raw = document.getElementById("bulkInput").value.trim();
  if (!raw) return alert("Please paste some templates first.");
  const lines = raw.split("\n");
  let added = 0;
  lines.forEach((line) => {
    const [text, category = "", tags = ""] = line.split("||").map((v) => v.trim());
    if (text) {
      addTemplate({ text, category, tags });
      added++;
    }
  });
  document.getElementById("bulkInput").value = "";
  renderTemplates("");
  alert(`✅ Added ${added} template(s).`);
}

function clearInputs() {
  document.getElementById("templateText").value = "";
  document.getElementById("templateCategory").value = "";
  document.getElementById("templateTags").value = "";
}
