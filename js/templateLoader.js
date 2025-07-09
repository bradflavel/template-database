let templates = [];
let deleteMode = false;

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
  document.getElementById("jsonFile").onchange = handleJSONUpload;

  // ✅ Manage Templates Button (toggle delete mode or open modal)
  manageBtn.onclick = () => {
    if (deleteMode) {
      deleteMode = false;
      manageBtn.textContent = "Manage Templates";
      renderTemplates(searchBox.value.trim().toLowerCase());
    } else {
      modal.classList.remove("hidden");
      singleSection.classList.add("hidden");
      bulkSection.classList.add("hidden");
    }
  };

  // ✅ Delete Templates mode from inside the modal
  deleteBtn.onclick = () => {
    deleteMode = true;
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

  renderTemplates("");
}


// === TEMPLATE HANDLERS ===
function addSingleTemplate() {
  const text = document.getElementById("templateText").value.trim();
  const category = document.getElementById("templateCategory").value.trim();
  const tags = document.getElementById("templateTags").value.trim();
  if (!text) return alert("Template text is required.");
  templates.push({ text, category, tags });
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
      templates.push({ text, category, tags });
      added++;
    }
  });
  document.getElementById("bulkInput").value = "";
  renderTemplates("");
  alert(`✅ Added ${added} template(s).`);
}

function handleJSONUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      templates = JSON.parse(event.target.result);
      renderTemplates("");
    } catch {
      alert("❌ Invalid JSON file");
    }
  };
  reader.readAsText(file);
}


function exportTemplates() {
  const blob = new Blob([JSON.stringify(templates, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "templates.json";
  a.click();
  URL.revokeObjectURL(url);
}

function clearInputs() {
  document.getElementById("templateText").value = "";
  document.getElementById("templateCategory").value = "";
  document.getElementById("templateTags").value = "";
}

// === RENDER TEMPLATES ===
function renderTemplates(searchQuery) {
  const container = document.getElementById("templateGrid");
  container.innerHTML = "";
  const filtered = templates.filter((t) =>
    [t.text, t.category, t.tags].some((val) =>
      val.toLowerCase().includes(searchQuery)
    )
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No templates found.</p>";
    return;
  }

  filtered.forEach((t, index) => {
    const div = document.createElement("div");
    div.className = "template-box";
    div.textContent = t.text;
    div.title = `Category: ${t.category}\nTags: ${t.tags}`;

    if (deleteMode) {
      const trash = document.createElement("span");
      trash.innerHTML = "🗑️";
      trash.className = "trash-icon";
      trash.onclick = (e) => {
        e.stopPropagation();
        const confirmDelete = confirm("Are you sure you want to delete this template?");
        if (confirmDelete) {
          templates.splice(index, 1);
          renderTemplates(searchQuery);
        }
      };
      div.appendChild(trash);
    }

    div.onclick = () => {
      if (!deleteMode) {
        navigator.clipboard.writeText(t.text);
        div.style.backgroundColor = "#DFF0D8";
        setTimeout(() => (div.style.backgroundColor = ""), 300);
      }
    };

    container.appendChild(div);
  });
}


const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-theme");
};
