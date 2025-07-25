import {
  getTemplates,
  setTemplates,
  deleteTemplate,
  reorderCategories,
  reorderTemplatesInCategory,
  addTemplate
} from './templateManager.js';

let editMode = false;
let currentEditCategory = null;
let currentEditIndex = null;


export function setEditMode(value) {
  editMode = value;
}

export function isEditMode() {
  return editMode;
}

export function renderTemplates(searchQuery = "") {
  const container = document.getElementById("templateGrid");
  container.innerHTML = "";

  const { categoryOrder, templatesByCategory } = getTemplates();

  // Flatten templates for search
  const flatTemplates = categoryOrder.flatMap((category) =>
    (templatesByCategory[category] || []).map((t) => ({
      ...t,
      category
    }))
  );

  // Filter if a search query is present
  const filtered = searchQuery
    ? flatTemplates.filter((t) =>
        [t.text, t.category, t.tags].some((val) =>
          val?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : flatTemplates;

  // Regroup after filtering
  const grouped = {};
  filtered.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  // Skip if no matches
  const visibleCategories = categoryOrder.filter((cat) => grouped[cat]);
  if (visibleCategories.length === 0) {
    container.innerHTML = "<p>No templates found.</p>";
    return;
  }

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
  visibleCategories.forEach((category, colIndex) => {
    const colDiv = document.createElement("div");
    colDiv.className = "template-column";
    colDiv.dataset.category = category;
    // colDiv.style.maxWidth = "380px";
    // colDiv.style.flex = "0 0 auto";

    if (editMode) {
      colDiv.setAttribute("draggable", "true");
      colDiv.classList.add("draggable-column");
    }

    const header = document.createElement("h3");

    if (editMode) {
      const handle = document.createElement("span");
      handle.className = "drag-handle";
      handle.innerHTML = "☰";
      handle.setAttribute("draggable", "false");
      handle.style.pointerEvents = "none";
      header.appendChild(handle);
    }

    header.appendChild(document.createTextNode(category));
    colDiv.appendChild(header);

    const items = grouped[category];
    items.forEach((t, indexInCategory) => {
      const div = document.createElement("div");
      div.className = "template-box";
      // --- Color Styling ---
      const isDarkMode = document.body.classList.contains("dark-theme");
      const baseColor = t.color || "";
      div.setAttribute("data-base-color", baseColor);

      // Always show a default border (fallback grey)
      div.style.border = `3px solid ${baseColor || "#999"}`;

      if (isDarkMode) {
        // Dark mode: background stays transparent, border is colored
        div.style.backgroundColor = "transparent";
        if (baseColor) {
          div.style.border = `3px solid ${baseColor}`;
        }
      } else {
        // Light mode: apply color to background and border
        if (baseColor) {
          div.style.backgroundColor = baseColor;
          div.style.border = "3px solid rgba(0,0,0,0.2)";
        } else {
          div.style.backgroundColor = "transparent";
        }
      }

      div.style.transition = "all 0.2s ease";

      div.setAttribute("data-base-color", t.color || "");
      div.title = `Category: ${t.category}\nTags: ${t.tags}`;
      div.dataset.index = indexInCategory;
      div.dataset.category = t.category;
      div.dataset.tags = t.tags || "";

      if (editMode) {
        const handle = document.createElement("span");
        handle.className = "drag-handle";
        handle.innerHTML = "☰";
        handle.setAttribute("draggable", "false");
        handle.style.pointerEvents = "none";
        div.appendChild(handle);
      }

      const textNode = document.createElement("span");
      textNode.className = "template-text"; 
      textNode.textContent = t.text;
      div.appendChild(textNode);

      if (editMode) {
        div.setAttribute("draggable", "true");
        div.classList.add("draggable-template");

        const trash = document.createElement("span");
        trash.innerHTML = "🗑️";
        trash.className = "trash-icon";
        trash.onclick = (e) => {
          e.stopPropagation();
          if (confirm("Delete this template?")) {
            deleteTemplate(t.category, indexInCategory);
            renderTemplates(searchQuery);
          }
        };
        div.appendChild(trash);
      }

      div.onclick = () => {
        if (editMode) {
          openEditModal(t, t.category, indexInCategory);
        } else {
          navigator.clipboard.writeText(t.text);
          div.style.backgroundColor = "#DFF0D8";
          setTimeout(() => (div.style.backgroundColor = ""), 300);
        }
      };


      colDiv.appendChild(div);
    });

    container.appendChild(colDiv);
  });

  if (editMode) {
    setupColumnDrag(container);
    setupTemplateDrag();
  }

  const size = parseFloat(localStorage.getItem("textSize")) || 1.0;
  const boxes = document.querySelectorAll(".template-box");
  boxes.forEach(box => {
    box.style.fontSize = size + "em";
  });

}

function setupColumnDrag(container) {
  let draggedCol = null;

  container.querySelectorAll(".template-column").forEach((col) => {
    col.addEventListener("dragstart", () => {
      draggedCol = col;
      col.classList.add("dragging");
    });

    col.addEventListener("dragend", () => {
      draggedCol = null;
      col.classList.remove("dragging");

      // Save new order
      const newOrder = [...container.children].map(
        (c) => c.dataset.category
      );
      reorderCategories(newOrder);
    });

    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      const after = col;
      if (after === draggedCol) return;

      const all = [...container.children];
      const draggedIndex = all.indexOf(draggedCol);
      const targetIndex = all.indexOf(after);

      if (draggedIndex < targetIndex) {
        container.insertBefore(draggedCol, after.nextSibling);
      } else {
        container.insertBefore(draggedCol, after);
      }
    });
  });
}

function setupTemplateDrag() {
  let draggedCard = null;

  document.querySelectorAll(".template-box").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedCard = card;
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      if (!draggedCard) return;

      const category = draggedCard.dataset.category;
      const container = draggedCard.parentElement;
      draggedCard.classList.remove("dragging");

      const newList = [...container.querySelectorAll(".template-box")].map((el) => {
        return {
          text: el.querySelector(".template-text")?.textContent || "",
          tags: el.dataset.tags || "",
          category 
        };
      });


      reorderTemplatesInCategory(category, newList);
      draggedCard = null;
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      const current = card;
      if (current === draggedCard) return;

      const parent = current.parentElement;
      const nodes = [...parent.querySelectorAll(".template-box")];
      const draggedIndex = nodes.indexOf(draggedCard);
      const targetIndex = nodes.indexOf(current);

      if (draggedIndex < targetIndex) {
        parent.insertBefore(draggedCard, current.nextSibling);
      } else {
        parent.insertBefore(draggedCard, current);
      }
    });
  });
}

function openEditModal(template, category, index) {
  currentEditCategory = category;
  currentEditIndex = index;

  document.getElementById("editTemplateText").value = template.text;
  document.getElementById("editTemplateCategory").value = template.category;
  document.getElementById("editTemplateTags").value = template.tags || "";

  document.getElementById("editTemplateColor").value = template.color || "";
  buildColorPalette(template.color || "");
  document.getElementById("editModal").classList.remove("hidden");

}

document.getElementById("closeEditModal").onclick = () => {
  document.getElementById("editModal").classList.add("hidden");
};

document.getElementById("saveEditBtn").onclick = () => {
  const text = document.getElementById("editTemplateText").value.trim();
  const category = document.getElementById("editTemplateCategory").value.trim() || "Uncategorized";
  const tags = document.getElementById("editTemplateTags").value.trim();
  const color = document.getElementById("editTemplateColor").value || "";

  if (!text) return alert("Text cannot be empty.");

  deleteTemplate(currentEditCategory, currentEditIndex);
  addTemplate({ text, category, tags, color }, currentEditCategory === category ? currentEditIndex : null);

  document.getElementById("editModal").classList.add("hidden");
  renderTemplates(document.getElementById("searchBox").value.trim().toLowerCase());
};


const COLOR_OPTIONS = [
  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
  "#D5BAFF", "#FFBAED", "#BFFFFF", "#CFCFCF", "#FFAEC9"
];

function buildColorPalette(selectedColor) {
  const palette = document.getElementById("colorPalette");
  palette.innerHTML = "";

  COLOR_OPTIONS.forEach(color => {
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    swatch.title = color;

    if (color === selectedColor) {
      swatch.classList.add("selected");
    }

    swatch.onclick = () => {
      document.getElementById("editTemplateColor").value = color;
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
    };

    palette.appendChild(swatch);
  });

  // ✅ Add Reset Color Button Logic Here
  const resetBtn = document.getElementById("resetColorBtn");
  if (resetBtn) {
    resetBtn.onclick = () => {
      document.getElementById("editTemplateColor").value = "";
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
    };
  }
}

