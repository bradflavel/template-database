import { getTemplates, setTemplates } from './templateManager.js';

let deleteMode = false;

function setDeleteMode(value) {
  deleteMode = value;
}

function isDeleteMode() {
  return deleteMode;
}

function renderTemplates(searchQuery = "") {
  const container = document.getElementById("templateGrid");
  container.innerHTML = "";

  const templates = getTemplates();
  const filtered = templates.filter((t) =>
    [t.text, t.category, t.tags].some((val) =>
      val.toLowerCase().includes(searchQuery)
    )
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No templates found.</p>";
    return;
  }

  // Group templates by category
  const grouped = {};
  filtered.forEach((t) => {
    const cat = t.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  // Reset container layout
  container.className = "template-scroll-row";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.overflowX = "auto";
  container.style.gap = "1rem";
  container.style.padding = "1rem";
  container.style.boxSizing = "border-box";
  container.style.width = "100%";
  container.style.minWidth = "unset";
  container.style.maxWidth = "unset";

  // Render each category column
  Object.entries(grouped).forEach(([category, items]) => {
    const colDiv = document.createElement("div");
    colDiv.className = "template-column";

    const header = document.createElement("h4");
    header.textContent = category;
    colDiv.appendChild(header);

    items.forEach((t) => {
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
          if (confirm("Delete this template?")) {
            const all = getTemplates();
            const updated = all.filter((tpl) => tpl !== t);
            setTemplates(updated);
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

      colDiv.appendChild(div);
    });

    container.appendChild(colDiv);
  });
}

export {
  renderTemplates,
  setDeleteMode,
  isDeleteMode
};
