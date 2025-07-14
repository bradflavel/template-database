import { setupTemplateLoader } from './templateLoader.js';
import { setupSettings } from './settings.js';
import { renderTemplates } from './templateRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTemplateLoader();
  setupSettings({
    applyTheme: () => {},
    applyColumnCount: (count) => {
      localStorage.setItem("columnCount", count); // save new value
      renderTemplates(document.getElementById("searchBox").value.trim().toLowerCase());
    }
  });
});
