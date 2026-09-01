/**
 * ColorCraft Interactive Design Guide Controller (guide.html)
 * Powers live educational widgets: HSL visualizer, 60-30-10 UI simulator, and psychology mood selector.
 */
const Guide = {
  hslH: 260,
  hslS: 85,
  hslL: 60,

  init() {
    this.bindHslSliders();
    this.bindPsychologyChips();
    this.bindRuleSimulator();
    this.updateHslPreview();
  },

  bindHslSliders() {
    const hSlider = document.getElementById('guideHueSlider');
    const sSlider = document.getElementById('guideSatSlider');
    const lSlider = document.getElementById('guideLightSlider');

    if (hSlider) {
      hSlider.addEventListener('input', (e) => {
        this.hslH = parseInt(e.target.value, 10);
        this.updateHslPreview();
      });
    }

    if (sSlider) {
      sSlider.addEventListener('input', (e) => {
        this.hslS = parseInt(e.target.value, 10);
        this.updateHslPreview();
      });
    }

    if (lSlider) {
      lSlider.addEventListener('input', (e) => {
        this.hslL = parseInt(e.target.value, 10);
        this.updateHslPreview();
      });
    }
  },

  updateHslPreview() {
    const hex = ColorEngine.hslToHex(this.hslH, this.hslS, this.hslL);
    const rgb = ColorEngine.hexToRgb(hex);
    const textColor = ColorEngine.getReadableTextColor(hex);

    const swatch = document.getElementById('guideHslSwatch');
    if (swatch) {
      swatch.style.backgroundColor = hex;
      swatch.style.color = textColor;
    }

    const hexText = document.getElementById('guideHslHexVal');
    if (hexText) hexText.textContent = hex;

    const rgbText = document.getElementById('guideHslRgbVal');
    if (rgbText) rgbText.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const hVal = document.getElementById('guideHueVal');
    if (hVal) hVal.textContent = `${this.hslH}°`;

    const sVal = document.getElementById('guideSatVal');
    if (sVal) sVal.textContent = `${this.hslS}%`;

    const lVal = document.getElementById('guideLightVal');
    if (lVal) lVal.textContent = `${this.hslL}%`;
  },

  bindPsychologyChips() {
    const moods = {
      'trust': {
        color: '#2563EB',
        name: 'Electric Cobalt',
        keywords: ['Security', 'Corporate Reliability', 'Clarity', 'Intelligence'],
        bestFor: 'Fintech, SaaS platforms, healthcare, legal interfaces'
      },
      'growth': {
        color: '#10B981',
        name: 'Emerald Jade',
        keywords: ['Sustainability', 'Prosperity', 'Health', 'Renewal'],
        bestFor: 'Agri-tech, environmental apps, fitness tracking, financial growth'
      },
      'energy': {
        color: '#F59E0B',
        name: 'Solar Amber',
        keywords: ['Enthusiasm', 'Optimism', 'Warmth', 'Action'],
        bestFor: 'Delivery, creative agencies, youth brands, warning alerts'
      },
      'luxury': {
        color: '#8B5CF6',
        name: 'Royal Amethyst',
        keywords: ['Mystery', 'Premium Craft', 'Wisdom', 'Sophistication'],
        bestFor: 'AI tools, web3, luxury cosmetics, premium studio portfolios'
      },
      'bold': {
        color: '#EF4444',
        name: 'Crimson Ember',
        keywords: ['Urgency', 'Passion', 'Dynamic Energy', 'Power'],
        bestFor: 'Gaming, streaming media, emergency alerts, high-impact CTA'
      }
    };

    document.querySelectorAll('.psychology-mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.psychology-mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-mood');
        const data = moods[key];
        if (!data) return;

        const swatch = document.getElementById('psychologySwatch');
        if (swatch) {
          swatch.style.backgroundColor = data.color;
          swatch.style.color = ColorEngine.getReadableTextColor(data.color);
        }

        const title = document.getElementById('psychologyTitle');
        if (title) title.textContent = `${btn.textContent.trim()} — ${data.name} (${data.color})`;

        const desc = document.getElementById('psychologyDesc');
        if (desc) desc.textContent = data.bestFor;

        const tagsRow = document.getElementById('psychologyTags');
        if (tagsRow) {
          tagsRow.innerHTML = data.keywords.map(k => `<span class="saved-tag-badge">${k}</span>`).join('');
        }
      });
    });
  },

  bindRuleSimulator() {
    const primaryInput = document.getElementById('simDomColor');
    const secondaryInput = document.getElementById('simSecColor');
    const accentInput = document.getElementById('simAccColor');
    const mockScreen = document.getElementById('ruleMockScreen');

    const updateSim = () => {
      if (!mockScreen) return;
      const dom = primaryInput ? primaryInput.value : '#F8FAFC';
      const sec = secondaryInput ? secondaryInput.value : '#1E293B';
      const acc = accentInput ? accentInput.value : '#6D5EF8';

      mockScreen.style.backgroundColor = dom;
      const mockCards = mockScreen.querySelectorAll('.sim-card');
      mockCards.forEach(c => {
        c.style.backgroundColor = '#FFFFFF';
        c.style.borderColor = 'rgba(0,0,0,0.08)';
      });

      const mockTexts = mockScreen.querySelectorAll('.sim-text');
      mockTexts.forEach(t => t.style.color = sec);

      const mockAccs = mockScreen.querySelectorAll('.sim-accent');
      mockAccs.forEach(a => {
        a.style.backgroundColor = acc;
        a.style.color = ColorEngine.getReadableTextColor(acc);
      });
    };

    if (primaryInput) primaryInput.addEventListener('input', updateSim);
    if (secondaryInput) secondaryInput.addEventListener('input', updateSim);
    if (accentInput) accentInput.addEventListener('input', updateSim);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Guide.init();
});

window.Guide = Guide;
