let templates = [];

export function getTemplates() {
  return templates;
}

export function setTemplates(newTemplates) {
  templates = newTemplates;
}

export function addTemplate(template) {
  templates.push(template);
}

export function deleteTemplate(index) {
  templates.splice(index, 1);
}

export function importTemplatesFromFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const parsed = JSON.parse(event.target.result);
      setTemplates(parsed);
      callback();
    } catch {
      alert("❌ Invalid JSON file");
    }
  };
  reader.readAsText(file);
}

export function exportTemplates() {
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
