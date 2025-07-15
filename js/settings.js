export function setupSettings({ applyTheme, applyColumnCount }) {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettings = document.getElementById("closeSettings");
  const themeToggle = document.getElementById("themeToggleSwitch");
  const columnInput = document.getElementById("columnCount");

  // Apply saved settings on load
  const savedTheme = localStorage.getItem("theme");
  const savedColumns = localStorage.getItem("columnCount");

  if (savedTheme === "dark" && themeToggle) {
    document.body.classList.add("dark-theme");
    themeToggle.checked = true;
  }

  if (savedColumns && columnInput) {
    columnInput.value = savedColumns;
    applyColumnCount(parseInt(savedColumns, 10));
  }

  // Show modal
  if (settingsBtn && settingsModal) {
    settingsBtn.onclick = () => settingsModal.classList.remove("hidden");
  }

  // Close modal
  if (closeSettings && settingsModal) {
    closeSettings.onclick = () => settingsModal.classList.add("hidden");

    window.addEventListener("click", (e) => {
      if (e.target === settingsModal) settingsModal.classList.add("hidden");
    });
  }

  // Immediate theme toggle
  if (themeToggle) {
    themeToggle.onchange = () => {
      const isDark = themeToggle.checked;
      document.body.classList.toggle("dark-theme", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
      applyTheme?.(isDark);
    };
  }

  // Immediate column count update
  if (columnInput) {
    columnInput.oninput = () => {
      const count = parseInt(columnInput.value, 10);
      if (!isNaN(count) && count > 0) {
        localStorage.setItem("columnCount", count);
        applyColumnCount(count);
      }
    };
  }
}


