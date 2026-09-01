/**
 * ColorCraft Color Math Engine
 * Hex / RGB / HSL / HSV conversion, WCAG Contrast, and Color Harmony algorithms.
 */
const ColorEngine = {
  // Hex to RGB { r, g, b }
  hexToRgb(hex) {
    let cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    if (cleanHex.length !== 6) {
      return { r: 109, g: 94, b: 248 }; // fallback
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  },

  // RGB to Hex string "#RRGGBB"
  rgbToHex(r, g, b) {
    const toHex = (c) => {
      const hex = Math.round(Utils.clamp(c, 0, 255)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return (`#${toHex(r)}${toHex(g)}${toHex(b)}`).toUpperCase();
  },

  // RGB {r, g, b} [0-255] to HSL { h: 0-360, s: 0-100, l: 0-100 }
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    let l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },

  // HSL {h: 0-360, s: 0-100, l: 0-100} to RGB { r, g, b }
  hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = Utils.clamp(s, 0, 100) / 100;
    l = Utils.clamp(l, 0, 100) / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  },

  // RGB {r, g, b} to HSV { h: 0-360, s: 0-100, v: 0-100 }
  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  },

  // HSV to RGB { r, g, b }
  hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    s = Utils.clamp(s, 0, 100) / 100;
    v = Utils.clamp(v, 0, 100) / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r1 = 0, g1 = 0, b1 = 0;

    if (h >= 0 && h < 60) {
      r1 = c; g1 = x; b1 = 0;
    } else if (h >= 60 && h < 120) {
      r1 = x; g1 = c; b1 = 0;
    } else if (h >= 120 && h < 180) {
      r1 = 0; g1 = c; b1 = x;
    } else if (h >= 180 && h < 240) {
      r1 = 0; g1 = x; b1 = c;
    } else if (h >= 240 && h < 300) {
      r1 = x; g1 = 0; b1 = c;
    } else if (h >= 300 && h < 360) {
      r1 = c; g1 = 0; b1 = x;
    }

    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255)
    };
  },

  // Hex to HSL
  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  },

  // HSL to Hex
  hslToHex(h, s, l) {
    const rgb = this.hslToRgb(h, s, l);
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  },

  // Relative Luminance for WCAG Contrast calculations
  getRelativeLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  },

  // Contrast Ratio between two Hex colors (e.g. 4.54)
  getContrastRatio(hex1, hex2) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    const lum1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    return Math.round(ratio * 100) / 100;
  },

  // Evaluate WCAG AA and AAA thresholds
  getWcagResult(ratio) {
    return {
      ratio: ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaaNormal: ratio >= 7.0,
      aaaLarge: ratio >= 4.5
    };
  },

  // Determine if black (#000000) or white (#FFFFFF) text is more legible on this background
  getReadableTextColor(hex) {
    const whiteRatio = this.getContrastRatio(hex, '#FFFFFF');
    const blackRatio = this.getContrastRatio(hex, '#000000');
    return whiteRatio >= blackRatio ? '#FFFFFF' : '#000000';
  },

  // Generate Shades (darker variations)
  getShades(hex, steps = 6) {
    const hsl = this.hexToHsl(hex);
    const shades = [];
    const stepSize = hsl.l / (steps + 1);
    for (let i = 1; i <= steps; i++) {
      const newL = Math.max(5, Math.round(hsl.l - (stepSize * i)));
      shades.push(this.hslToHex(hsl.h, hsl.s, newL));
    }
    return shades;
  },

  // Generate Tints (lighter variations)
  getTints(hex, steps = 6) {
    const hsl = this.hexToHsl(hex);
    const tints = [];
    const stepSize = (98 - hsl.l) / (steps + 1);
    for (let i = 1; i <= steps; i++) {
      const newL = Math.min(98, Math.round(hsl.l + (stepSize * i)));
      tints.push(this.hslToHex(hsl.h, hsl.s, newL));
    }
    return tints;
  },

  // Generate Tones (desaturated variations)
  getTones(hex, steps = 6) {
    const hsl = this.hexToHsl(hex);
    const tones = [];
    const stepSize = hsl.s / (steps + 1);
    for (let i = 1; i <= steps; i++) {
      const newS = Math.max(4, Math.round(hsl.s - (stepSize * i)));
      tones.push(this.hslToHex(hsl.h, newS, hsl.l));
    }
    return tones;
  },

  // Harmony Generators
  getComplementary(baseHex) {
    const hsl = this.hexToHsl(baseHex);
    const compHue = (hsl.h + 180) % 360;
    return [
      this.hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 15)),
      baseHex,
      this.hslToHex(hsl.h, Math.max(20, hsl.s - 25), Math.max(15, hsl.l - 20)),
      this.hslToHex(compHue, hsl.s, hsl.l),
      this.hslToHex(compHue, Math.max(25, hsl.s - 15), Math.min(88, hsl.l + 18))
    ];
  },

  getAnalogous(baseHex, count = 5, spread = 28) {
    const hsl = this.hexToHsl(baseHex);
    const palette = [];
    const half = Math.floor(count / 2);
    for (let i = -half; i <= half; i++) {
      const h = ((hsl.h + (i * spread)) % 360 + 360) % 360;
      const l = Utils.clamp(hsl.l + (i * 4), 22, 85);
      palette.push(this.hslToHex(h, hsl.s, l));
    }
    return palette.slice(0, count);
  },

  getTriadic(baseHex) {
    const hsl = this.hexToHsl(baseHex);
    const h1 = hsl.h;
    const h2 = (hsl.h + 120) % 360;
    const h3 = (hsl.h + 240) % 360;
    return [
      baseHex,
      this.hslToHex(h1, Math.max(20, hsl.s - 20), Math.min(85, hsl.l + 20)),
      this.hslToHex(h2, hsl.s, hsl.l),
      this.hslToHex(h3, hsl.s, hsl.l),
      this.hslToHex(h3, Math.max(20, hsl.s - 15), Math.max(15, hsl.l - 20))
    ];
  },

  getSplitComplementary(baseHex) {
    const hsl = this.hexToHsl(baseHex);
    const h1 = hsl.h;
    const h2 = (hsl.h + 150) % 360;
    const h3 = (hsl.h + 210) % 360;
    return [
      this.hslToHex(h1, Math.max(30, hsl.s - 15), Math.min(88, hsl.l + 18)),
      baseHex,
      this.hslToHex(h2, hsl.s, hsl.l),
      this.hslToHex(h3, hsl.s, hsl.l),
      this.hslToHex(h3, Math.max(30, hsl.s - 20), Math.max(20, hsl.l - 15))
    ];
  },

  getTetradic(baseHex) {
    const hsl = this.hexToHsl(baseHex);
    const h1 = hsl.h;
    const h2 = (hsl.h + 90) % 360;
    const h3 = (hsl.h + 180) % 360;
    const h4 = (hsl.h + 270) % 360;
    return [
      baseHex,
      this.hslToHex(h2, hsl.s, hsl.l),
      this.hslToHex(h3, hsl.s, hsl.l),
      this.hslToHex(h4, hsl.s, hsl.l),
      this.hslToHex(h1, Math.max(20, hsl.s - 25), Math.min(90, hsl.l + 25))
    ];
  },

  getMonochromatic(baseHex, count = 5) {
    const hsl = this.hexToHsl(baseHex);
    const palette = [];
    const minL = 18;
    const maxL = 88;
    const stepL = (maxL - minL) / (count - 1);
    for (let i = 0; i < count; i++) {
      const l = Math.round(minL + (i * stepL));
      const s = Utils.clamp(hsl.s - (i * 3), 20, 95);
      palette.push(this.hslToHex(hsl.h, s, l));
    }
    return palette;
  },

  // Weighted Balanced Random Palette generator (curated range, not noisy raw RGB)
  getRandomPalette(count = 5) {
    // Generate a cohesive seed hue
    const baseHue = Utils.randomInt(0, 359);
    const schemeTypes = ['analogous', 'triadic', 'complementary', 'split', 'monochrome', 'vibrant'];
    const chosenType = schemeTypes[Utils.randomInt(0, schemeTypes.length - 1)];

    const baseHex = this.hslToHex(baseHue, Utils.randomInt(55, 88), Utils.randomInt(40, 65));

    switch (chosenType) {
      case 'analogous':
        return this.getAnalogous(baseHex, count, Utils.randomInt(20, 35));
      case 'triadic':
        return this.getTriadic(baseHex);
      case 'complementary':
        return this.getComplementary(baseHex);
      case 'split':
        return this.getSplitComplementary(baseHex);
      case 'monochrome':
        return this.getMonochromatic(baseHex, count);
      case 'vibrant':
      default: {
        const colors = [];
        for (let i = 0; i < count; i++) {
          const h = (baseHue + (i * (360 / count)) + Utils.randomInt(-15, 15)) % 360;
          const s = Utils.randomInt(45, 85);
          const l = Utils.randomInt(30, 75);
          colors.push(this.hslToHex(h, s, l));
        }
        return colors;
      }
    }
  },

  // Color name descriptor dictionary
  getColorName(hex) {
    const hsl = this.hexToHsl(hex);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    if (l < 10) return 'Obsidian Dark';
    if (l > 92) return 'Frosted White';
    if (s < 12) {
      if (l < 30) return 'Charcoal Slate';
      if (l < 70) return 'Neutral Zinc';
      return 'Pearl Gray';
    }

    if (h >= 345 || h < 15) {
      if (l < 35) return 'Crimson Velvet';
      if (s > 70) return 'Vibrant Ruby';
      return 'Coral Rose';
    } else if (h >= 15 && h < 45) {
      if (l < 40) return 'Rustic Amber';
      return 'Tangerine Sun';
    } else if (h >= 45 && h < 70) {
      if (l < 45) return 'Golden Honey';
      return 'Solar Flare';
    } else if (h >= 70 && h < 165) {
      if (l < 35) return 'Emerald Forest';
      if (s > 60) return 'Cyber Jade';
      return 'Mint Meadow';
    } else if (h >= 165 && h < 210) {
      if (l < 35) return 'Deep Abyss';
      if (s > 60) return 'Cyan Pulse';
      return 'Ocean Breeze';
    } else if (h >= 210 && h < 265) {
      if (l < 35) return 'Midnight Indigo';
      if (s > 65) return 'Electric Royal';
      return 'Skyline Blue';
    } else if (h >= 265 && h < 315) {
      if (l < 35) return 'Imperial Plum';
      return 'Amethyst Glow';
    } else {
      if (l < 35) return 'Deep Orchid';
      return 'Magenta Bloom';
    }
  }
};

window.ColorEngine = ColorEngine;
