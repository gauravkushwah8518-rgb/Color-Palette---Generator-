/**
 * ColorCraft Explorer Controller (explorer.html)
 * Deep color exploration, shades/tints/tones ramp, harmony calculators, and visual color wheel.
 */
const Explorer = {
  currentHex: '#6D5EF8',

  init() {
    this.picker = document.getElementById('explorerNativePicker');
    this.hexInput = document.getElementById('explorerHexInput');
    this.wheelCanvas = document.getElementById('harmonyWheelCanvas');

    // Check URL params for pre-seeded color (e.g. ?hex=7C3AED)
    const urlParams = new URLSearchParams(window.location.search);
    const paramHex = urlParams.get('hex');
    if (paramHex) {
      let clean = paramHex.startsWith('#') ? paramHex : '#' + paramHex;
      if (clean.length === 7) this.currentHex = clean.toUpperCase();
    }

    if (this.picker) this.picker.value = this.currentHex;
    if (this.hexInput) this.hexInput.value = this.currentHex;

    this.bindEvents();
    this.updateAll(this.currentHex);
  },

  updateAll(hex) {
    this.currentHex = hex.toUpperCase();
    if (this.picker) this.picker.value = this.currentHex;
    if (this.hexInput && this.hexInput.value.toUpperCase() !== this.currentHex) {
      this.hexInput.value = this.currentHex;
    }

    const rgb = ColorEngine.hexToRgb(this.currentHex);
    const hsl = ColorEngine.hexToHsl(this.currentHex);
    const hsv = ColorEngine.rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = ColorEngine.getColorName(this.currentHex);
    const textContrast = ColorEngine.getReadableTextColor(this.currentHex);

    // Update Hero Preview
    const previewBox = document.getElementById('explorerPreviewBox');
    if (previewBox) {
      previewBox.style.backgroundColor = this.currentHex;
      previewBox.style.color = textContrast;
    }

    const nameEl = document.getElementById('explorerColorName');
    if (nameEl) nameEl.textContent = name;

    const hexDisplay = document.getElementById('explorerHexDisplay');
    if (hexDisplay) hexDisplay.textContent = this.currentHex;

    // Update Values Cards
    this.setText('valRgb', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    this.setText('valHsl', `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`);
    this.setText('valHsv', `hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`);

    // Render Variations (Shades, Tints, Tones)
    this.renderRamps(this.currentHex);

    // Render Harmonies
    this.renderHarmonies(this.currentHex);

    // Draw Harmony Wheel
    this.drawColorWheel(hsl.h);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  renderRamps(hex) {
    const shades = ColorEngine.getShades(hex, 6);
    const tints = ColorEngine.getTints(hex, 6);
    const tones = ColorEngine.getTones(hex, 6);

    const renderRampRow = (containerId, colors) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = colors.map(c => `
        <div class="ramp-swatch" style="background-color: ${c};" onclick="Explorer.selectColor('${c}')" title="${c}">
          <span class="ramp-hex" style="color: ${ColorEngine.getReadableTextColor(c)};">${c}</span>
        </div>
      `).join('');
    };

    renderRampRow('shadesRamp', shades);
    renderRampRow('tintsRamp', tints);
    renderRampRow('tonesRamp', tones);
  },

  renderHarmonies(hex) {
    const renderHarmBlock = (id, colors, name) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = `
        <div style="display: flex; height: 50px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); margin-bottom: 8px;">
          ${colors.map(c => `
            <div style="flex: 1; background-color: ${c}; cursor: pointer; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px;" 
                 onclick="Explorer.selectColor('${c}')" title="Click to inspect ${c}">
              <span style="font-size: 8px; font-family: var(--font-mono); font-weight: 600; color: ${ColorEngine.getReadableTextColor(c)};">${c}</span>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${name}</span>
          <button class="btn btn-ghost btn-sm" onclick="UI.openSaveModal(['${colors.join("','")}'], '${name}')" style="padding: 2px 8px; font-size: 0.75rem;">
            <i data-lucide="bookmark" style="width: 12px; height: 12px;"></i> Save
          </button>
        </div>
      `;
    };

    renderHarmBlock('compHarmonyBox', ColorEngine.getComplementary(hex), 'Complementary');
    renderHarmBlock('analogousHarmonyBox', ColorEngine.getAnalogous(hex, 5, 25), 'Analogous');
    renderHarmBlock('triadicHarmonyBox', ColorEngine.getTriadic(hex), 'Triadic');
    renderHarmBlock('splitHarmonyBox', ColorEngine.getSplitComplementary(hex), 'Split-Complementary');
    renderHarmBlock('tetradicHarmonyBox', ColorEngine.getTetradic(hex), 'Tetradic');
  },

  drawColorWheel(baseHue) {
    if (!this.wheelCanvas) return;
    const ctx = this.wheelCanvas.getContext('2d');
    const width = this.wheelCanvas.width;
    const height = this.wheelCanvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = cx - 16;
    const innerRadius = radius - 24;

    ctx.clearRect(0, 0, width, height);

    // Draw hue circle
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 90%, 55%)`;
      ctx.fill();
    }

    // Function to draw a harmony indicator node on wheel
    const drawNode = (hue, isBase = false, label = '') => {
      const rad = (hue - 90) * Math.PI / 180;
      const nodeRadius = (radius + innerRadius) / 2;
      const nx = cx + nodeRadius * Math.cos(rad);
      const ny = cy + nodeRadius * Math.sin(rad);

      ctx.beginPath();
      ctx.arc(nx, ny, isBase ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#16161A';
      ctx.stroke();

      // Connecting line to center
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = isBase ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = isBase ? 2 : 1;
      ctx.stroke();
    };

    // Draw base and harmony points
    drawNode(baseHue, true, 'Base');
    drawNode((baseHue + 180) % 360, false, 'Comp');
    drawNode((baseHue + 120) % 360, false, 'Triad 1');
    drawNode((baseHue + 240) % 360, false, 'Triad 2');
  },

  selectColor(hex) {
    this.updateAll(hex);
    UI.showToast(`Inspecting ${hex}`, hex);
  },

  bindEvents() {
    if (this.picker) {
      this.picker.addEventListener('input', (e) => {
        this.updateAll(e.target.value);
      });
    }

    if (this.hexInput) {
      this.hexInput.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (val.length === 7 && /^#[0-9A-F]{6}$/i.test(val)) {
          this.updateAll(val);
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Explorer.init();
});

window.Explorer = Explorer;
