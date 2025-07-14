export function setupSettingsModal(renderTemplates) {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettings = document.getElementById("closeSettings");
  const toggleThemeCheckbox = document.getElementById("toggleTheme");
  const columnCountInput = document.getElementById("columnCount");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");

  settingsBtn.onclick = () => {
    const settings = getSettings();
    toggleThemeCheckbox.checked = document.body.classList.contains("dark-theme");
    columnCountInput.value = settings.columns;
    settingsModal.classList.remove("hidden");
  };

  closeSettings.onclick = () => settingsModal.classList.add("hidden");

  saveSettingsBtn.onclick = () => {
    const columns = parseInt(columnCountInput.value);
    const dark = toggleThemeCheckbox.checked;

    localStorage.setItem("templateSettings", JSON.stringify({ columns }));

    document.body.classList.toggle("dark-theme", dark);
    settingsModal.classList.add("hidden");
    renderTemplates(document.getElementById("searchBox").value.trim().toLowerCase());
  };
}

export function getSettings() {
  const saved = localStorage.getItem("templateSettings");
  try {
    return saved ? JSON.parse(saved) : { columns: 4 };
  } catch {
    return { columns: 4 };
  }
}
