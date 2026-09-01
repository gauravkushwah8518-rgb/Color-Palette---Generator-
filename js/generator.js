/**
 * ColorCraft Main Generator Controller (index.html)
 * Controls 5-swatch palette generation, locks, spacebar trigger, harmony modes, and export/save.
 */
const Generator = {
  colors: ['#6D5EF8', '#F472B6', '#FBBF24', '#34D399', '#16161A'],
  locked: [false, false, false, false, false],
  currentMode: 'random',

  // Initialize Generator
  init() {
    this.container = document.getElementById('paletteGrid');
    this.modeSelect = document.getElementById('harmonyModeSelect');
    this.generateBtn = document.getElementById('generateBtn');
    this.saveBtn = document.getElementById('savePaletteBtn');
    this.exportBtn = document.getElementById('exportPaletteBtn');
    this.heroSearchInput = document.getElementById('heroSearchInput');
    this.heroSearchBtn = document.getElementById('heroSearchBtn');

    if (!this.container) return;

    // Render initial sleek balanced palette
    this.render(false);

    // Bind event listeners
    this.bindEvents();
  },

  // Generate palette
  generateNewPalette(animated = true) {
    if (!Auth.isLoggedIn()) {
      Auth.requireAuth(() => this.generateNewPalette(animated), 'generate color palettes');
      return;
    }

    let newPalette = [];
    const baseColor = this.colors.find((c, i) => this.locked[i]) || ColorEngine.getRandomPalette(1)[0];

    switch (this.currentMode) {
      case 'monochromatic':
        newPalette = ColorEngine.getMonochromatic(baseColor, 5);
        break;
      case 'complementary':
        newPalette = ColorEngine.getComplementary(baseColor);
        break;
      case 'analogous':
        newPalette = ColorEngine.getAnalogous(baseColor, 5, 26);
        break;
      case 'triadic':
        newPalette = ColorEngine.getTriadic(baseColor);
        break;
      case 'split':
        newPalette = ColorEngine.getSplitComplementary(baseColor);
        break;
      case 'tetradic':
        newPalette = ColorEngine.getTetradic(baseColor);
        break;
      case 'random':
      default:
        newPalette = ColorEngine.getRandomPalette(5);
        break;
    }

    // Merge locked colors
    for (let i = 0; i < 5; i++) {
      if (!this.locked[i] || !this.colors[i]) {
        this.colors[i] = newPalette[i] || '#6D5EF8';
      }
    }

    this.render(animated);
  },

  // Render swatches into DOM
  render(animated = true) {
    if (!this.container) return;

    this.container.innerHTML = this.colors.map((hex, index) => {
      const isLocked = this.locked[index];
      const textColor = ColorEngine.getReadableTextColor(hex);
      const colorName = ColorEngine.getColorName(hex);
      const rgb = ColorEngine.hexToRgb(hex);
      const hsl = ColorEngine.hexToHsl(hex);

      return `
        <div class="swatch-card ${isLocked ? 'is-locked' : ''} ${animated ? 'swatch-updating' : ''}" 
             style="background-color: ${hex}; color: ${textColor};" 
             data-index="${index}">
          
          <!-- Top Swatch Controls -->
          <div class="swatch-top-actions">
            <button class="swatch-action-btn ${isLocked ? 'active-lock' : ''}" 
                    title="${isLocked ? 'Unlock color' : 'Lock color'}" 
                    onclick="Generator.toggleLock(${index}, event)"
                    aria-label="${isLocked ? 'Unlock' : 'Lock'}">
              <i data-lucide="${isLocked ? 'lock' : 'unlock'}" style="width: 14px; height: 14px;"></i>
            </button>

            <div style="display: flex; gap: 6px;">
              <button class="swatch-action-btn" 
                      title="Edit Color" 
                      onclick="Generator.editColor(${index}, event)"
                      aria-label="Edit Color">
                <i data-lucide="sliders" style="width: 14px; height: 14px;"></i>
              </button>
              <button class="swatch-action-btn" 
                      title="Copy HEX (${hex})" 
                      onclick="Generator.copyColor('${hex}', event)"
                      aria-label="Copy HEX">
                <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
          </div>

          <!-- Swatch Middle Info -->
          <div class="swatch-center-info" onclick="Generator.copyColor('${hex}', event)">
            <div class="swatch-hex-display">${hex}</div>
            <div class="swatch-color-name">${colorName}</div>
          </div>

          <!-- Bottom Meta & Quick Stats -->
          <div class="swatch-bottom-meta">
            <div>RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}</div>
            <div>HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%</div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // Toggle lock state of a card
  toggleLock(index, e) {
    if (e) e.stopPropagation();
    this.locked[index] = !this.locked[index];
    this.render(false);
    UI.showToast(this.locked[index] ? `Locked ${this.colors[index]}` : `Unlocked color slot`, this.colors[index], this.locked[index] ? 'lock' : 'unlock');
  },

  // Copy color with toast feedback
  copyColor(hex, e) {
    if (e) e.stopPropagation();
    UI.copyToClipboard(hex, `Copied ${hex}`);
  },

  // Edit single color in modal
  editColor(index, e) {
    if (e) e.stopPropagation();
    const currentColor = this.colors[index];

    const modalHtml = `
      <div class="modal-overlay is-open" id="editColorModal">
        <div class="modal-container" style="max-width: 400px;">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Edit Color #${index + 1}</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">Select custom color value</p>
            </div>
            <button class="btn-icon-only modal-close-btn" onclick="UI.closeModal('editColorModal')">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <div class="modal-body">
            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
              <input type="color" id="modalNativePicker" value="${currentColor}" style="width: 64px; height: 64px; border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; padding: 0; background: none;" onchange="Generator.updateModalHex(this.value)" />
              <div style="flex: 1;">
                <label class="form-label" for="modalHexInput">HEX Code</label>
                <input type="text" id="modalHexInput" class="form-input" value="${currentColor}" oninput="Generator.handleModalHexInput(this.value)" maxlength="7" style="font-family: var(--font-mono); font-weight: 700;" />
              </div>
            </div>

            <!-- Quick Shade Ramp -->
            <div>
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Variations</div>
              <div style="display: flex; height: 32px; border-radius: var(--radius-xs); overflow: hidden; border: 1px solid var(--border);" id="modalShadesStrip">
                ${ColorEngine.getShades(currentColor, 5).concat(ColorEngine.getTints(currentColor, 5)).map(c => `
                  <div style="flex: 1; background-color: ${c}; cursor: pointer;" title="${c}" onclick="Generator.setModalColor('${c}')"></div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('editColorModal')">Cancel</button>
            <button class="btn btn-primary btn-sm" onclick="Generator.saveEditedColor(${index})">Apply Color</button>
          </div>
        </div>
      </div>
    `;

    UI.mountModal(modalHtml, 'editColorModal');
  },

  updateModalHex(hex) {
    const input = document.getElementById('modalHexInput');
    if (input) input.value = hex.toUpperCase();
  },

  handleModalHexInput(val) {
    if (val.length === 7 && val.startsWith('#')) {
      const picker = document.getElementById('modalNativePicker');
      if (picker) picker.value = val;
    }
  },

  setModalColor(hex) {
    const input = document.getElementById('modalHexInput');
    const picker = document.getElementById('modalNativePicker');
    if (input) input.value = hex.toUpperCase();
    if (picker) picker.value = hex;
  },

  saveEditedColor(index) {
    const input = document.getElementById('modalHexInput');
    if (input && input.value) {
      let hex = input.value.trim().toUpperCase();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (hex.length === 7) {
        this.colors[index] = hex;
        this.render(false);
        UI.closeModal('editColorModal');
        UI.showToast(`Updated color to ${hex}`, hex);
      }
    }
  },

  // AI / Keyword prompt palette generator
  generateFromPrompt(query) {
    if (!query) return;
    if (!Auth.isLoggedIn()) {
      Auth.requireAuth(() => this.generateFromPrompt(query), 'generate themed palettes');
      return;
    }
    const lower = query.toLowerCase().trim();

    // Thematic presets or hash-based cohesive generation
    const themes = {
      'cyberpunk': ['#050505', '#FF0055', '#7A04EB', '#120E43', '#00FFF5'],
      'sunset': ['#2B0938', '#631056', '#BF3A62', '#E86A58', '#FFBC6B'],
      'forest': ['#1B2E24', '#2C4A3E', '#4B7F52', '#7CB674', '#D4EAC8'],
      'minimal': ['#121214', '#3E3E44', '#71717A', '#E4E4E7', '#FAFAFA'],
      'nordic': ['#2E3440', '#3B4252', '#88C0D0', '#81A1C1', '#ECEFF4'],
      'coffee': ['#2C1D11', '#5B3924', '#8C6239', '#C89666', '#F5E6CC'],
      'pastel': ['#FFB5E8', '#FF9CEE', '#B28DFF', '#85E3FF', '#BFFCC6'],
      'ocean': ['#031B28', '#073B4C', '#118AB2', '#06D6A0', '#EDF2F4'],
      'luxury': ['#0D0D11', '#1F1E24', '#D4AF37', '#F3E5AB', '#FAF9F6']
    };

    let matched = null;
    for (const [key, pal] of Object.entries(themes)) {
      if (lower.includes(key)) {
        matched = pal;
        break;
      }
    }

    if (!matched) {
      // Calculate seed from hash
      let hash = 0;
      for (let i = 0; i < query.length; i++) {
        hash = query.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      const base = ColorEngine.hslToHex(hue, 70, 50);
      matched = ColorEngine.getTriadic(base);
    }

    // Assign unlocked
    for (let i = 0; i < 5; i++) {
      if (!this.locked[i]) {
        this.colors[i] = matched[i] || '#6D5EF8';
      }
    }

    this.render(true);
    UI.showToast(`Generated palette for "${query}"`, this.colors[0], 'sparkles');
  },

  // Bind UI Events
  bindEvents() {
    // Generate Button
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => this.generateNewPalette(true));
    }

    // Harmony Selector
    if (this.modeSelect) {
      this.modeSelect.addEventListener('change', (e) => {
        this.currentMode = e.target.value;
        this.generateNewPalette(true);
      });
    }

    // Save Button
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        Auth.requireAuth(() => UI.openSaveModal(this.colors), 'save palettes to your workspace');
      });
    }

    // Export Button
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        Auth.requireAuth(() => {
          UI.openExportModal({
            name: 'ColorCraft Palette',
            colors: this.colors
          });
        }, 'export palette code');
      });
    }

    // Hero Search / AI prompt bar
    if (this.heroSearchBtn && this.heroSearchInput) {
      const handleSearch = () => {
        const query = this.heroSearchInput.value.trim();
        if (query) {
          this.generateFromPrompt(query);
          const genSection = document.getElementById('generatorSection');
          if (genSection) {
            genSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };

      this.heroSearchBtn.addEventListener('click', handleSearch);
      this.heroSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
      });
    }

    // Trending Tag pills
    document.querySelectorAll('.trending-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-tag') || tag.textContent.trim();
        if (this.heroSearchInput) this.heroSearchInput.value = query;
        this.generateFromPrompt(query);
        const genSection = document.getElementById('generatorSection');
        if (genSection) {
          genSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Spacebar generator trigger (when not in an input)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        this.generateNewPalette(true);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Generator.init();
});

window.Generator = Generator;
