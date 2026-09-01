/**
 * ColorCraft Theme Manager (Light / Dark)
 * Loads early in head to prevent Flash of Wrong Theme (FOUC)
 */
(function() {
  const THEME_KEY = 'colorcraft-theme';

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {
      console.warn('LocalStorage error reading theme:', e);
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('LocalStorage error writing theme:', e);
    }
    updateToggleButtons(theme);
    window.dispatchEvent(new CustomEvent('colorcraft-theme-change', { detail: { theme } }));
  }

  function updateToggleButtons(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(btn => {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }

  // Initial early execution
  const currentTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Setup DOM Event Listeners when ready
  document.addEventListener('DOMContentLoaded', () => {
    updateToggleButtons(document.documentElement.getAttribute('data-theme') || 'light');

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const active = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(active);
      });
    });

    // Listen to OS theme changes if user hasn't explicitly set preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        try {
          if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        } catch (err) {}
      });
    }
  });

  // Expose global helper
  window.ColorCraftTheme = {
    get: () => document.documentElement.getAttribute('data-theme') || 'light',
    set: applyTheme,
    toggle: () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }
  };
})();
