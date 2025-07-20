import {
  addTemplate,
  exportTemplates,
  importTemplatesFromFile,
  getTemplates 
} from './templateManager.js';


import {
  renderTemplates,
  setEditMode,
  isEditMode
} from './templateRenderer.js';

export function setupTemplateLoader() {
  const searchBox = document.getElementById("searchBox");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  clearSearchBtn.onclick = () => {
    searchBox.value = "";
    renderTemplates(""); // re-render all templates with no filter
  };
  
  const manageBtn = document.getElementById("manageTemplatesBtn");
  const closeModal = document.getElementById("closeModal");
  const modal = document.getElementById("templateModal");
  const singleBtn = document.getElementById("singleTemplateMode");
  const bulkBtn = document.getElementById("bulkTemplateMode");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");

  const singleSection = document.getElementById("singleTemplateSection");
  const bulkSection = document.getElementById("bulkTemplateSection");

  // Add single template
  document.getElementById("addTemplateBtn").onclick = addSingleTemplate;

  // Bulk add
  document.getElementById("bulkAddBtn").onclick = bulkAddTemplates;

  // Export
  exportBtn.onclick = async () => {
    const templates = getTemplates();
    await exportTemplates(templates);
  };

  // Import
  importBtn.onclick = () => document.getElementById("jsonFile").click();
  document.getElementById("jsonFile").onchange = (e) =>
    importTemplatesFromFile(e.target.files[0], () =>
      renderTemplates(searchBox.value.trim().toLowerCase())
    );

  // Toggle modal for adding templates
  manageBtn.onclick = () => {
    if (isEditMode()) {
      setEditMode(false);
      manageBtn.textContent = "Manage Templates";
      renderTemplates(searchBox.value.trim().toLowerCase());
    } else {
      modal.classList.remove("hidden");
      singleSection.classList.add("hidden");
      bulkSection.classList.add("hidden");
    }
  };

  // Enter Edit Mode (used for reorder/delete)
  document.getElementById("editModeBtn").onclick = () => {
    setEditMode(true);
    modal.classList.add("hidden");
    manageBtn.textContent = "Finished Editing";
    renderTemplates(searchBox.value.trim().toLowerCase());
  };

  // Modal close
  closeModal.onclick = () => modal.classList.add("hidden");
  // window.onclick = (e) => {
  //   if (e.target === modal) modal.classList.add("hidden");
  // };

  // Show sections
  singleBtn.onclick = () => {
    singleSection.classList.remove("hidden");
    bulkSection.classList.add("hidden");
  };

  bulkBtn.onclick = () => {
    bulkSection.classList.remove("hidden");
    singleSection.classList.add("hidden");
  };

  // Search filtering
  searchBox.addEventListener("input", () => {
    renderTemplates(searchBox.value.trim().toLowerCase());
  });

  // Initial render
  renderTemplates("");
}

// === Helper Functions ===

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
