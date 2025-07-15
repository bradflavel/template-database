import { setupTemplateLoader } from './templateLoader.js';
import { setupSettingsModal } from './settingsManager.js'; // ✅ updated import
import { renderTemplates } from './templateRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTemplateLoader();
  setupSettingsModal(renderTemplates); // ✅ full setup: theme + text size + modal logic
  renderTemplates(document.getElementById("searchBox").value.trim().toLowerCase()); // ✅ initial render
});
