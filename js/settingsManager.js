export function setupSettingsModal(renderTemplates) {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettings = document.getElementById("closeSettings");
  const toggleThemeCheckbox = document.getElementById("themeToggleSwitch");

  const increaseBtn = document.getElementById("increaseTextSize");
  const decreaseBtn = document.getElementById("decreaseTextSize");
  const textSizeValue = document.getElementById("textSizeValue");

  const MIN_SIZE = 0.5;
  const MAX_SIZE = 1.5;
  const STEP = 0.1;

  let currentSize = parseFloat(localStorage.getItem("textSize")) || 1.0;

  function applyTextSize(size) {
    size = Math.round(size * 10) / 10;
    const boxes = document.querySelectorAll(".template-box");
    boxes.forEach(box => {
      box.style.fontSize = size + "em";
    });

    textSizeValue.textContent = size.toFixed(1);
    localStorage.setItem("textSize", size);
    currentSize = size;
  }

  // Theme toggle
  toggleThemeCheckbox.onchange = () => {
    const isDark = toggleThemeCheckbox.checked;
    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Re-render templates to apply updated styling
    if (typeof renderTemplates === "function") {
      renderTemplates(document.getElementById("searchBox")?.value.trim().toLowerCase() || "");
    }
  };

  // Font size buttons
  increaseBtn.onclick = () => {
    if (currentSize < MAX_SIZE) {
      applyTextSize(currentSize + STEP);
    }
  };

  decreaseBtn.onclick = () => {
    if (currentSize > MIN_SIZE) {
      applyTextSize(currentSize - STEP);
    }
  };

  // Open modal
  settingsBtn.onclick = () => {
    toggleThemeCheckbox.checked = document.body.classList.contains("dark-theme");
    applyTextSize(currentSize);
    settingsModal.classList.remove("hidden");
  };

  // Close modal
  closeSettings.onclick = () => settingsModal.classList.add("hidden");
  // window.addEventListener("click", (e) => {
  //   if (e.target === settingsModal) settingsModal.classList.add("hidden");
  // });

  // Apply settings on load
  applyTextSize(currentSize);
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    toggleThemeCheckbox.checked = true;
  }
}

export function getSettings() {
  const saved = localStorage.getItem("templateSettings");
  try {
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}
