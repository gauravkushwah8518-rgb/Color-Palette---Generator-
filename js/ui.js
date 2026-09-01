/**
 * ColorCraft UI Helper & Modal / Toast / Clipboard Controller
 */
const UI = {
  // Show a Stackable Toast Notification
  showToast(message, colorHex = null, iconName = 'copy') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconHtml = `<i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i>`;
    if (colorHex) {
      iconHtml = `<span class="toast-swatch-dot" style="background-color: ${colorHex};"></span>`;
    }

    toast.innerHTML = `
      ${iconHtml}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Auto-dismiss after 2.5s
    setTimeout(() => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 2500);
  },

  // Copy text to clipboard with toast confirmation
  copyToClipboard(text, message = null) {
    if (!navigator.clipboard) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.showToast(message || `Copied ${text}`, text.startsWith('#') ? text : null);
      } catch (err) {
        this.showToast('Failed to copy', '#EF4444', 'alert-circle');
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast(message || `Copied ${text}`, text.startsWith('#') ? text : null);
    }).catch(err => {
      console.warn('Clipboard write error:', err);
      this.showToast(`Copied: ${text}`, text.startsWith('#') ? text : null);
    });
  },

  // Mount modal HTML and bind focus & escape key
  mountModal(htmlString, modalId) {
    // Remove existing if open
    this.closeModal(modalId);

    const temp = document.createElement('div');
    temp.innerHTML = htmlString.trim();
    const modalEl = temp.firstElementChild;
    document.body.appendChild(modalEl);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Focus first input or close button
    setTimeout(() => {
      const focusable = modalEl.querySelector('input:not([type="hidden"]), button.btn-primary, button.modal-close-btn');
      if (focusable) focusable.focus();
    }, 50);

    // Escape listener and backdrop click
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modalId);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        this.closeModal(modalId);
        document.removeEventListener('keydown', handleKeydown);
      }
    });
  },

  // Close and clean up modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('is-open');
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 200);
    }
  },

  // Open Export Modal for any palette
  openExportModal(palette) {
    const colors = palette.colors || [];
    const name = palette.name || 'ColorCraft Palette';

    // 1. CSS Variables format
    const cssVars = `:root {\n` + colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + `\n}`;

    // 2. JSON format
    const jsonStr = JSON.stringify({
      id: palette.id || Utils.generateId(),
      name: name,
      colors: colors,
      createdAt: palette.createdAt || new Date().toISOString()
    }, null, 2);

    // 3. Plain HEX list
    const hexList = colors.join('\n');

    // 4. Tailwind config format
    const tailwindStr = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n` +
      colors.map((c, i) => `        'palette-${i + 1}': '${c}',`).join('\n') +
      `\n      }\n    }\n  }\n};`;

    const modalHtml = `
      <div class="modal-overlay is-open" id="exportModal">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Export Palette</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                Export <strong>${name}</strong> into your production workflow
              </p>
            </div>
            <button class="btn-icon-only modal-close-btn" onclick="UI.closeModal('exportModal')">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <div class="modal-body">
            <!-- Palette Color Preview Strip -->
            <div style="display: flex; height: 44px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 16px; border: 1px solid var(--border);">
              ${colors.map(c => `<div style="flex: 1; background-color: ${c};" title="${c}"></div>`).join('')}
            </div>

            <!-- Export Mode Tabs -->
            <div class="modal-tabs">
              <button class="modal-tab-btn active" onclick="UI.switchExportTab(this, 'tabCss')">CSS Variables</button>
              <button class="modal-tab-btn" onclick="UI.switchExportTab(this, 'tabTailwind')">Tailwind</button>
              <button class="modal-tab-btn" onclick="UI.switchExportTab(this, 'tabJson')">JSON</button>
              <button class="modal-tab-btn" onclick="UI.switchExportTab(this, 'tabHex')">HEX List</button>
            </div>

            <!-- Tab Contents -->
            <div id="tabCss" class="export-tab-content">
              <pre class="code-snippet-box" id="cssExportCode">${cssVars}</pre>
            </div>
            <div id="tabTailwind" class="export-tab-content" style="display: none;">
              <pre class="code-snippet-box" id="tailwindExportCode">${tailwindStr}</pre>
            </div>
            <div id="tabJson" class="export-tab-content" style="display: none;">
              <pre class="code-snippet-box" id="jsonExportCode">${jsonStr}</pre>
            </div>
            <div id="tabHex" class="export-tab-content" style="display: none;">
              <pre class="code-snippet-box" id="hexExportCode">${hexList}</pre>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('exportModal')">Close</button>
            <button class="btn btn-primary btn-sm" onclick="UI.copyActiveExport()">
              <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    `;

    this.mountModal(modalHtml, 'exportModal');
  },

  // Switch tabs in Export Modal
  switchExportTab(btn, targetTabId) {
    const container = btn.closest('.modal-container');
    container.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    container.querySelectorAll('.export-tab-content').forEach(el => el.style.display = 'none');
    const target = container.querySelector('#' + targetTabId);
    if (target) target.style.display = 'block';
  },

  // Copy whatever is in the active export tab
  copyActiveExport() {
    const exportModal = document.getElementById('exportModal');
    if (!exportModal) return;
    const activeTab = exportModal.querySelector('.export-tab-content:not([style*="display: none"]) pre');
    if (activeTab) {
      this.copyToClipboard(activeTab.textContent.trim(), 'Export snippet copied to clipboard!');
    }
  },

  // Open Save Palette Modal
  openSaveModal(colors, defaultName = '') {
    if (!colors || colors.length === 0) return;

    if (!defaultName) {
      const firstColorName = ColorEngine.getColorName(colors[0]);
      defaultName = `${firstColorName} Flow`;
    }

    const modalHtml = `
      <div class="modal-overlay is-open" id="saveModal">
        <div class="modal-container" style="max-width: 460px;">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Save Palette to Workspace</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                Add this color palette to your personal collection
              </p>
            </div>
            <button class="btn-icon-only modal-close-btn" onclick="UI.closeModal('saveModal')">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <form onsubmit="UI.handleSaveSubmit(event)">
            <div class="modal-body">
              <!-- Preview -->
              <div style="display: flex; height: 50px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                ${colors.map(c => `
                  <div style="flex: 1; background-color: ${c}; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px;">
                    <span style="font-size: 9px; font-family: var(--font-mono); font-weight: 700; color: ${ColorEngine.getReadableTextColor(c)};">${c}</span>
                  </div>
                `).join('')}
              </div>

              <div class="form-group">
                <label class="form-label" for="savePaletteNameInput">Palette Name</label>
                <input type="text" id="savePaletteNameInput" class="form-input" value="${defaultName}" required maxlength="40" />
              </div>

              <div class="form-group">
                <label class="form-label" for="savePaletteTagsInput">Tags / Category (optional)</label>
                <input type="text" id="savePaletteTagsInput" class="form-input" placeholder="e.g. UI Design, Dark Mode, Brand" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" onclick="UI.closeModal('saveModal')">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">
                <i data-lucide="bookmark" style="width: 14px; height: 14px;"></i> Save Palette
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this._pendingColorsToSave = colors;
    this.mountModal(modalHtml, 'saveModal');
  },

  // Submit Save
  handleSaveSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('savePaletteNameInput');
    const tagsInput = document.getElementById('savePaletteTagsInput');
    const name = nameInput ? nameInput.value.trim() : 'My Palette';
    const tags = tagsInput && tagsInput.value.trim() ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) : ['Custom'];

    const colors = this._pendingColorsToSave || [];
    if (colors.length === 0) return;

    // Load existing
    const palettes = Utils.storage.get('colorcraft-palettes', []);
    const newPalette = {
      id: Utils.generateId(),
      name: name,
      colors: colors,
      tags: tags,
      createdAt: new Date().toISOString()
    };

    palettes.unshift(newPalette);
    Utils.storage.set('colorcraft-palettes', palettes);

    this.closeModal('saveModal');
    this.showToast(`Saved "${name}" to your workspace!`, colors[0], 'check-circle');

    // Notify any active saved view
    window.dispatchEvent(new CustomEvent('colorcraft-palette-saved', { detail: newPalette }));
  },

  // Initialize or re-trigger scroll observer for dynamically loaded views
  initScrollObserver() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-visible'));
    }
  }
};

window.UI = UI;
