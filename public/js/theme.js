/**
 * ColorCraft Theme Manager (Light / Dark)
 * Loads early in head to prevent Flash of Wrong Theme (FOUC)
 */
(function() {
  const THEME_KEY = 'colorcraft-theme';
  const ACCENT_KEY = 'colorcraft-accent';

  /** HeroUI-style accent palettes shown in the picker popover */
  const ACCENTS = [
    { id: 'violet', label: 'Violet', swatch: '#6D5EF8' },
    { id: 'blue',   label: 'Blue',   swatch: '#3B82F6' },
    { id: 'sky',    label: 'Sky',    swatch: '#0EA5E9' },
    { id: 'mint',   label: 'Mint',   swatch: '#10B981' },
    { id: 'amber',  label: 'Amber',  swatch: '#F59E0B' },
    { id: 'rose',   label: 'Rose',   swatch: '#F43F5E' },
    { id: 'pink',   label: 'Pink',   swatch: '#EC4899' },
    { id: 'purple', label: 'Purple', swatch: '#A855F7' },
    { id: 'teal',    label: 'Teal',    swatch: '#14B8A6' },
    { id: 'lime',    label: 'Lime',    swatch: '#84CC16' },
    { id: 'orange',  label: 'Orange',  swatch: '#F97316' },
    { id: 'cyan',    label: 'Cyan',    swatch: '#06B6D4' },
    { id: 'crimson', label: 'Crimson', swatch: '#DC143C' },
    { id: 'indigo',  label: 'Indigo',  swatch: '#4F46E5' }
  ];

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

  function getSavedAccent() {
    try {
      const saved = localStorage.getItem(ACCENT_KEY);
      if (saved && ACCENTS.some(a => a.id === saved)) return saved;
    } catch (e) { /* private mode */ }
    return 'violet';
  }

  function applyAccent(accentId, options) {
    const opts = options || {};
    if (!ACCENTS.some(a => a.id === accentId)) accentId = 'violet';
    document.documentElement.setAttribute('data-accent', accentId);
    try {
      localStorage.setItem(ACCENT_KEY, accentId);
    } catch (e) { /* private mode */ }
    updatePickerState(accentId);
    window.dispatchEvent(new CustomEvent('colorcraft-accent-change', { detail: { accent: accentId } }));
    if (opts.ripple && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playAccentRipple(opts.ripple.x, opts.ripple.y, accentId);
    }
  }

  /** Page-wide circular color wipe, expanding from the click point */
  function playAccentRipple(x, y, accentId) {
    const accent = ACCENTS.find(a => a.id === accentId);
    if (!accent) return;

    // Update existing ripple color mid-flight instead of stacking duplicates
    const existing = document.querySelector('.accent-ripple[data-accent-live]');
    if (existing) {
      existing.dataset.accentLive = accent.swatch;
      existing.style.background =
        'radial-gradient(circle, ' + accent.swatch + ' 0%, ' + accent.swatch + 'CC 60%, transparent 72%)';
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const radius = Math.sqrt(Math.pow(Math.max(x, vw - x), 2) + Math.pow(Math.max(y, vh - y), 2));

    const ripple = document.createElement('div');
    ripple.className = 'accent-ripple';
    ripple.dataset.accentLive = accent.swatch;
    ripple.style.width = ripple.style.height = radius * 2 + 'px';
    ripple.style.left = x - radius + 'px';
    ripple.style.top = y - radius + 'px';
    ripple.style.background =
      'radial-gradient(circle, ' + accent.swatch + ' 0%, ' + accent.swatch + 'CC 60%, transparent 72%)';

    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => {
      const next = document.querySelector('.accent-ripple[data-accent-live="' + accent.swatch + '"]');
      if (next === ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple);
    });
    // Safety cleanup
    setTimeout(() => { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 1200);
  }

  function updatePickerState(accentId) {
    document.querySelectorAll('.accent-dot').forEach(dot => {
      const isActive = dot.dataset.accentId === accentId;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    // Keep popover footer label in sync with the active accent
    const labelEl = document.querySelector('.accent-picker-current');
    const meta = ACCENTS.find(a => a.id === accentId);
    if (labelEl && meta) labelEl.textContent = meta.label;
  }

  /** Build the HeroUI-style popover and wire the navbar trigger */
  function initAccentPicker() {
    if (document.querySelector('.accent-picker-popover')) return; // already built

    const triggers = document.querySelectorAll('.accent-picker-btn');
    if (!triggers.length) return;

    const popover = document.createElement('div');
    popover.className = 'accent-picker-popover';
    popover.setAttribute('role', 'menu');
    popover.setAttribute('aria-label', 'Choose accent theme');
    popover.innerHTML =
      '<div class="accent-picker-grid">' +
      ACCENTS.map(function(a, i) {
        return '<button type="button" class="accent-dot" role="menuitemradio" ' +
          'data-accent-id="' + a.id + '" aria-label="' + a.label + ' theme" ' +
          'title="' + a.label + '" style="--dot-color: ' + a.swatch + '; --dot-index: ' + i + '">' +
          '<span class="accent-dot-check"><i data-lucide="check"></i></span>' +
          '<span class="accent-dot-label">' + a.label + '</span>' +
          '</button>';
      }).join('') +
      '</div>' +
      '<div class="accent-picker-footer">' +
      '<span class="accent-picker-hint">Accent theme</span>' +
      '<span class="accent-picker-count"><span class="accent-picker-current">Violet</span></span>' +
      '</div>';

    document.body.appendChild(popover);

    if (window.lucide) window.lucide.createIcons({ nameAttr: 'data-lucide' });

    let hideTimer = null;
    const showPopover = (trigger) => {
      clearTimeout(hideTimer);
      positionPopover(popover, trigger);
      popover.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const hidePopover = (trigger) => {
      hideTimer = setTimeout(() => {
        popover.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }, 140);
    };

    triggers.forEach(btn => {
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (popover.classList.contains('is-open')) {
          popover.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          showPopover(btn);
        }
      });
      btn.addEventListener('mouseenter', () => showPopover(btn));
      btn.addEventListener('mouseleave', () => hidePopover(btn));
    });

    popover.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    popover.addEventListener('mouseleave', () => hidePopover(triggers[0]));

    // Close on outside click / Escape
    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && !e.target.closest('.accent-picker-btn')) {
        popover.classList.remove('is-open');
        triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popover.classList.contains('is-open')) {
        popover.classList.remove('is-open');
        triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
      }
    });

    // Accent selection with animated ripple
    const onDotClick = (dot, e) => {
        const id = dot.dataset.accentId;
        applyAccent(id, { ripple: { x: e.clientX, y: e.clientY } });
        const labelEl = popover.querySelector('.accent-picker-current');
        if (labelEl) {
          const meta = ACCENTS.find(a => a.id === id);
          if (meta) labelEl.textContent = meta.label;
        }
        // Keep popover open briefly so user sees the check mark move
        setTimeout(() => {
          popover.classList.remove('is-open');
          triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
        }, 450);
    };

    popover.querySelectorAll('.accent-dot').forEach(dot => {
      dot.addEventListener('click', (e) => onDotClick(dot, e));
    });

    // Mobile drawer dots (compact row)
    const mobileDots = document.getElementById('mobileAccentDots');
    if (mobileDots && !mobileDots.childElementCount) {
      mobileDots.innerHTML = ACCENTS.map(function(a) {
        return '<button type="button" class="accent-dot" data-accent-id="' + a.id + '" ' +
          'aria-label="' + a.label + ' theme" title="' + a.label + '" ' +
          'style="--dot-color: ' + a.swatch + '"></button>';
      }).join('');
      mobileDots.querySelectorAll('.accent-dot').forEach(dot => {
        dot.addEventListener('click', (e) => onDotClick(dot, e));
      });
    }
  }

  function positionPopover(popover, trigger) {
    const rect = trigger.getBoundingClientRect();
    const popH = popover.offsetHeight || 300;
    let top = rect.bottom + 10;
    if (top + popH > window.innerHeight - 12) top = rect.top - popH - 10;
    let left = rect.right - popover.offsetWidth;
    left = Math.max(12, Math.min(left, window.innerWidth - popover.offsetWidth - 12));
    popover.style.top = top + 'px';
    popover.style.left = left + 'px';
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
  document.documentElement.setAttribute('data-accent', getSavedAccent());
  const currentTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Setup DOM Event Listeners when ready
  document.addEventListener('DOMContentLoaded', () => {
    updateToggleButtons(document.documentElement.getAttribute('data-theme') || 'light');
    initAccentPicker();
    updatePickerState(getSavedAccent());

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
    },
    getAccent: () => document.documentElement.getAttribute('data-accent') || 'violet',
    setAccent: (id, opts) => applyAccent(id, opts),
    accents: ACCENTS
  };
})();
