/**
 * ColorCraft Gradient Studio Controller (gradient.html)
 * Linear / Radial / Conic gradient generator, multi-stop controls, angle dial, live preview, and CSS export.
 */
const GradientStudio = {
  type: 'linear', // 'linear', 'radial', 'conic'
  angle: 135,
  radialShape: 'circle at center',
  stops: [
    { color: '#6D5EF8', pos: 0 },
    { color: '#EC4899', pos: 50 },
    { color: '#F59E0B', pos: 100 }
  ],

  init() {
    this.previewBox = document.getElementById('gradientLivePreview');
    this.cssCodeBlock = document.getElementById('gradientCssCode');
    this.stopsContainer = document.getElementById('gradientStopsList');
    this.angleInput = document.getElementById('gradientAngleRange');
    this.angleVal = document.getElementById('gradientAngleValue');
    this.angleRow = document.getElementById('angleControlRow');

    this.bindEvents();
    this.render();
  },

  setGradientType(type) {
    this.type = type;
    document.querySelectorAll('.gradient-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    if (this.angleRow) {
      this.angleRow.style.display = type === 'radial' ? 'none' : 'flex';
    }

    this.render();
  },

  getCssString() {
    const stopsStr = this.stops
      .sort((a, b) => a.pos - b.pos)
      .map(s => `${s.color} ${s.pos}%`)
      .join(', ');

    if (this.type === 'linear') {
      return `background: linear-gradient(${this.angle}deg, ${stopsStr});`;
    } else if (this.type === 'radial') {
      return `background: radial-gradient(${this.radialShape}, ${stopsStr});`;
    } else if (this.type === 'conic') {
      return `background: conic-gradient(from ${this.angle}deg at 50% 50%, ${stopsStr});`;
    }
    return '';
  },

  render() {
    const css = this.getCssString();

    // Update Live Preview
    if (this.previewBox) {
      if (this.type === 'linear') {
        this.previewBox.style.background = `linear-gradient(${this.angle}deg, ${this.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
      } else if (this.type === 'radial') {
        this.previewBox.style.background = `radial-gradient(circle, ${this.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
      } else if (this.type === 'conic') {
        this.previewBox.style.background = `conic-gradient(from ${this.angle}deg at 50% 50%, ${this.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
      }
    }

    // Update CSS Snippet
    if (this.cssCodeBlock) {
      this.cssCodeBlock.textContent = css;
    }

    // Render Stops Controls
    if (this.stopsContainer) {
      this.stopsContainer.innerHTML = this.stops.map((stop, index) => `
        <div class="gradient-stop-row">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="color" value="${stop.color}" class="stop-color-input" 
                   oninput="GradientStudio.updateStopColor(${index}, this.value)" />
            <input type="text" value="${stop.color}" class="form-input stop-hex-input" 
                   onchange="GradientStudio.updateStopHex(${index}, this.value)" maxlength="7" />
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <input type="range" min="0" max="100" value="${stop.pos}" class="stop-pos-slider" 
                   oninput="GradientStudio.updateStopPos(${index}, this.value)" />
            <span class="stop-pos-val">${stop.pos}%</span>
          </div>

          ${this.stops.length > 2 ? `
            <button class="btn-icon-only btn-sm" onclick="GradientStudio.removeStop(${index})" title="Remove Stop" style="color: var(--danger);">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          ` : '<div style="width: 32px;"></div>'}
        </div>
      `).join('');

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  },

  updateStopColor(index, color) {
    this.stops[index].color = color.toUpperCase();
    this.render();
  },

  updateStopHex(index, val) {
    let clean = val.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (clean.length === 7) {
      this.stops[index].color = clean.toUpperCase();
      this.render();
    }
  },

  updateStopPos(index, val) {
    this.stops[index].pos = parseInt(val, 10);
    this.render();
  },

  addStop() {
    if (this.stops.length >= 5) {
      UI.showToast('Maximum 5 gradient color stops reached', '#F59E0B', 'alert-circle');
      return;
    }
    const newColor = ColorEngine.getRandomPalette(1)[0];
    const newPos = Math.round((this.stops[this.stops.length - 1].pos + this.stops[0].pos) / 2);
    this.stops.push({ color: newColor, pos: newPos });
    this.render();
    UI.showToast('Added gradient color stop', newColor, 'plus');
  },

  removeStop(index) {
    if (this.stops.length <= 2) return;
    this.stops.splice(index, 1);
    this.render();
  },

  generateRandomGradient() {
    const pal = ColorEngine.getRandomPalette(Utils.randomInt(2, 4));
    this.stops = pal.map((color, i) => ({
      color: color,
      pos: Math.round(i * (100 / (pal.length - 1)))
    }));
    this.angle = Utils.randomInt(0, 360);
    if (this.angleInput) this.angleInput.value = this.angle;
    if (this.angleVal) this.angleVal.textContent = `${this.angle}°`;
    this.render();
    UI.showToast('Generated fresh gradient style', this.stops[0].color, 'sparkles');
  },

  saveAsPalette() {
    const colors = this.stops.map(s => s.color);
    UI.openSaveModal(colors, 'Gradient Blend');
  },

  copyCss() {
    const css = this.getCssString();
    UI.copyToClipboard(css, 'Gradient CSS copied to clipboard!');
  },

  bindEvents() {
    if (this.angleInput) {
      this.angleInput.addEventListener('input', (e) => {
        this.angle = parseInt(e.target.value, 10);
        if (this.angleVal) this.angleVal.textContent = `${this.angle}°`;
        this.render();
      });
    }

    const randomBtn = document.getElementById('randomGradientBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => this.generateRandomGradient());
    }

    const copyBtn = document.getElementById('copyGradientCssBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyCss());
    }

    const savePalBtn = document.getElementById('saveGradientPaletteBtn');
    if (savePalBtn) {
      savePalBtn.addEventListener('click', () => this.saveAsPalette());
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  GradientStudio.init();
});

window.GradientStudio = GradientStudio;
