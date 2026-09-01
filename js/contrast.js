/**
 * ColorCraft Accessibility & Contrast Analyzer Controller (contrast.html)
 * Real WCAG 2.1 relative luminance math, AA/AAA scoring badges, live mock UI preview, and color fixer.
 */
const ContrastAnalyzer = {
  fg: '#16161A',
  bg: '#FFFFFF',

  init() {
    this.fgPicker = document.getElementById('contrastFgPicker');
    this.fgInput = document.getElementById('contrastFgInput');
    this.bgPicker = document.getElementById('contrastBgPicker');
    this.bgInput = document.getElementById('contrastBgInput');
    this.swapBtn = document.getElementById('contrastSwapBtn');
    this.ratioDisplay = document.getElementById('contrastRatioNumber');
    this.previewArea = document.getElementById('contrastLiveArea');

    this.bindEvents();
    this.calculate();
  },

  calculate() {
    const ratio = ColorEngine.getContrastRatio(this.fg, this.bg);
    const wcag = ColorEngine.getWcagResult(ratio);

    if (this.ratioDisplay) {
      this.ratioDisplay.textContent = `${ratio.toFixed(2)} : 1`;
    }

    // Update Scores
    this.updateBadge('badgeAaNormal', wcag.aaNormal, '4.5:1 Required');
    this.updateBadge('badgeAaLarge', wcag.aaLarge, '3.0:1 Required');
    this.updateBadge('badgeAaaNormal', wcag.aaaNormal, '7.0:1 Required');
    this.updateBadge('badgeAaaLarge', wcag.aaaLarge, '4.5:1 Required');

    // Overall Rating Tag
    const overallTag = document.getElementById('contrastOverallRating');
    if (overallTag) {
      if (ratio >= 7.0) {
        overallTag.innerHTML = `<span class="wcag-score-tag pass-super"><i data-lucide="check-check" style="width: 14px; height: 14px;"></i> Enhanced AAA Compliant</span>`;
      } else if (ratio >= 4.5) {
        overallTag.innerHTML = `<span class="wcag-score-tag pass-good"><i data-lucide="check" style="width: 14px; height: 14px;"></i> Standard AA Compliant</span>`;
      } else if (ratio >= 3.0) {
        overallTag.innerHTML = `<span class="wcag-score-tag pass-warning"><i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i> Large Text Only</span>`;
      } else {
        overallTag.innerHTML = `<span class="wcag-score-tag pass-fail"><i data-lucide="x" style="width: 14px; height: 14px;"></i> Fail Accessibility</span>`;
      }
    }

    // Update Live Simulation Preview Area
    if (this.previewArea) {
      this.previewArea.style.backgroundColor = this.bg;
      this.previewArea.style.color = this.fg;
      this.previewArea.style.borderColor = this.fg;
    }

    const mockButtons = document.querySelectorAll('.contrast-mock-btn');
    mockButtons.forEach(btn => {
      btn.style.backgroundColor = this.fg;
      btn.style.color = this.bg;
    });

    const mockOutlines = document.querySelectorAll('.contrast-mock-outline');
    mockOutlines.forEach(el => {
      el.style.borderColor = this.fg;
      el.style.color = this.fg;
    });

    // Provide Accessible suggestions if ratio is low
    this.renderSuggestions(ratio);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  updateBadge(id, isPass, label) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = isPass ? `
      <div class="wcag-badge pass">
        <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
        <span class="badge-status-text">PASS</span>
        <span class="badge-sub">${label}</span>
      </div>
    ` : `
      <div class="wcag-badge fail">
        <i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>
        <span class="badge-status-text">FAIL</span>
        <span class="badge-sub">${label}</span>
      </div>
    `;
  },

  renderSuggestions(ratio) {
    const container = document.getElementById('contrastSuggestions');
    if (!container) return;

    if (ratio >= 4.5) {
      container.innerHTML = `
        <div style="font-size: 0.875rem; color: var(--success); display: flex; align-items: center; gap: 8px;">
          <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
          <span>Great job! This combination provides excellent readability for interface text and components.</span>
        </div>
      `;
      return;
    }

    // Auto-compute accessible shade/tint
    const bgHsl = ColorEngine.hexToHsl(this.bg);
    const suggestedFg = bgHsl.l > 50 ? '#0A0A0C' : '#FFFFFF';

    container.innerHTML = `
      <div style="background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="sparkles" style="width: 14px; height: 14px; color: var(--accent);"></i> Suggested Accessible Fix
        </div>
        <p style="font-size: 0.825rem; color: var(--text-secondary); margin-bottom: 10px;">
          To pass WCAG AA standards with your background (${this.bg}), try switching the text color to high-contrast ${suggestedFg}.
        </p>
        <button class="btn btn-secondary btn-sm" onclick="ContrastAnalyzer.applySuggestedFg('${suggestedFg}')">
          Apply ${suggestedFg} (${ColorEngine.getContrastRatio(suggestedFg, this.bg).toFixed(1)}:1)
        </button>
      </div>
    `;
  },

  applySuggestedFg(hex) {
    this.fg = hex;
    if (this.fgPicker) this.fgPicker.value = hex;
    if (this.fgInput) this.fgInput.value = hex;
    this.calculate();
    UI.showToast(`Applied accessible text color ${hex}`, hex);
  },

  swapColors() {
    const temp = this.fg;
    this.fg = this.bg;
    this.bg = temp;

    if (this.fgPicker) this.fgPicker.value = this.fg;
    if (this.fgInput) this.fgInput.value = this.fg;
    if (this.bgPicker) this.bgPicker.value = this.bg;
    if (this.bgInput) this.bgInput.value = this.bg;

    this.calculate();
    UI.showToast('Swapped text and background colors', null, 'repeat');
  },

  bindEvents() {
    if (this.fgPicker) {
      this.fgPicker.addEventListener('input', (e) => {
        this.fg = e.target.value.toUpperCase();
        if (this.fgInput) this.fgInput.value = this.fg;
        this.calculate();
      });
    }

    if (this.fgInput) {
      this.fgInput.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (val.length === 7 && /^#[0-9A-F]{6}$/i.test(val)) {
          this.fg = val.toUpperCase();
          if (this.fgPicker) this.fgPicker.value = this.fg;
          this.calculate();
        }
      });
    }

    if (this.bgPicker) {
      this.bgPicker.addEventListener('input', (e) => {
        this.bg = e.target.value.toUpperCase();
        if (this.bgInput) this.bgInput.value = this.bg;
        this.calculate();
      });
    }

    if (this.bgInput) {
      this.bgInput.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (val.length === 7 && /^#[0-9A-F]{6}$/i.test(val)) {
          this.bg = val.toUpperCase();
          if (this.bgPicker) this.bgPicker.value = this.bg;
          this.calculate();
        }
      });
    }

    if (this.swapBtn) {
      this.swapBtn.addEventListener('click', () => this.swapColors());
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ContrastAnalyzer.init();
});

window.ContrastAnalyzer = ContrastAnalyzer;
