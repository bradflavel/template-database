let templateData = {
  categoryOrder: [],
  templatesByCategory: {}
};

// Load from localStorage
export function loadTemplates() {
  const saved = localStorage.getItem("templateData");
  if (saved) {
    try {
      templateData = JSON.parse(saved);
    } catch {
      console.warn("Invalid templateData in storage");
    }
  }
  return templateData;
}

// Save to localStorage
export function saveTemplates() {
  localStorage.setItem("templateData", JSON.stringify(templateData));
}

// Get current structure
export function getTemplates() {
  return templateData;
}

// Set new structure (used for import or reorder)
export function setTemplates(newData) {
  templateData = newData;
  saveTemplates();
}

// Add a new template
export function addTemplate({ text, category, tags }) {
  const cat = category || "Uncategorized";

  if (!templateData.templatesByCategory[cat]) {
    templateData.templatesByCategory[cat] = [];
    if (!templateData.categoryOrder.includes(cat)) {
      templateData.categoryOrder.push(cat);
    }
  }

  templateData.templatesByCategory[cat].push({ text, tags });
  saveTemplates();
}

// Delete a template by category + index
export function deleteTemplate(category, index) {
  if (templateData.templatesByCategory[category]) {
    templateData.templatesByCategory[category].splice(index, 1);

    // Remove empty category
    if (templateData.templatesByCategory[category].length === 0) {
      delete templateData.templatesByCategory[category];
      templateData.categoryOrder = templateData.categoryOrder.filter(c => c !== category);
    }

    saveTemplates();
  }
}

// Reorder entire category list
export function reorderCategories(newOrder) {
  templateData.categoryOrder = newOrder;
  saveTemplates();
}

// Reorder templates within a category
export function reorderTemplatesInCategory(category, newTemplateList) {
  if (templateData.templatesByCategory[category]) {
    templateData.templatesByCategory[category] = newTemplateList;
    saveTemplates();
  }
}

// Export to JSON file
export async function exportTemplates(templates) {
  const fileName = "templates.json";
  const json = JSON.stringify(templates, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  // Check if the browser supports the File System Access API
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] }
          }
        ]
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      alert("Templates saved successfully!");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Export failed:", err);
        alert("Export failed. See console for details.");
      }
    }
  } else {
    // Fallback for Firefox, Safari, etc.
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    alert("Download started (fallback method).");
  }
}


// Import from file and overwrite local data
export function importTemplatesFromFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.categoryOrder && data.templatesByCategory) {
        setTemplates(data);
        callback?.(true);
      } else {
        alert("Invalid template file format.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}
