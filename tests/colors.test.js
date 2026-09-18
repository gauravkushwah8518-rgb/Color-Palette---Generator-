/**
 * ColorEngine Unit Tests — Color Math, WCAG Contrast & Harmonies
 * Run with: npm test
 */
import {describe, it, expect, beforeAll} from 'vitest';

// Minimal DOM shims so colors.js loads outside a browser
beforeAll(() => {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  globalThis.window = globalThis.window || globalThis;
  globalThis.Utils = {clamp, randomInt};
  globalThis.window.Utils = globalThis.Utils;
});

const loadEngine = async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const code = fs.readFileSync(path.resolve('public/js/colors.js'), 'utf-8');
  const wrapped = `${code}\n; module.exports = ColorEngine;`;
  const blob = new Function('module', 'window', wrapped);
  const mod = {exports: {}};
  blob(mod, globalThis.window);
  return mod.exports;
};

let Engine;

beforeAll(async () => {
  Engine = await loadEngine();
});

describe('hexToRgb', () => {
  it('converts 6-digit hex correctly', () => {
    expect(Engine.hexToRgb('#6D5EF8')).toEqual({r: 109, g: 94, b: 248});
    expect(Engine.hexToRgb('#000000')).toEqual({r: 0, g: 0, b: 0});
    expect(Engine.hexToRgb('#FFFFFF')).toEqual({r: 255, g: 255, b: 255});
  });

  it('expands 3-digit shorthand hex', () => {
    expect(Engine.hexToRgb('#F00')).toEqual({r: 255, g: 0, b: 0});
    expect(Engine.hexToRgb('#0f0')).toEqual({r: 0, g: 255, b: 0});
  });

  it('falls back gracefully on invalid input', () => {
    const result = Engine.hexToRgb('not-a-color');
    expect(result).toHaveProperty('r');
    expect(Number.isFinite(result.r)).toBe(true);
  });
});

describe('rgbToHex', () => {
  it('round-trips with hexToRgb', () => {
    expect(Engine.rgbToHex(109, 94, 248)).toBe('#6D5EF8');
    expect(Engine.rgbToHex(0, 0, 0)).toBe('#000000');
    expect(Engine.rgbToHex(255, 255, 255)).toBe('#FFFFFF');
  });

  it('clamps out-of-range channels', () => {
    expect(Engine.rgbToHex(300, -20, 128)).toBe('#FF0080');
  });
});

describe('HSL conversions', () => {
  it('hslToHex produces expected values', () => {
    expect(Engine.hslToHex(0, 100, 50)).toBe('#FF0000');
    expect(Engine.hslToHex(120, 100, 50)).toBe('#00FF00');
    expect(Engine.hslToHex(240, 100, 50)).toBe('#0000FF');
  });

  it('hexToHsl round-trips through hslToHex', () => {
    const hsl = Engine.hexToHsl('#FF7F50'); // coral
    expect(hsl.h).toBe(16);
    const back = Engine.hslToHex(hsl.h, hsl.s, hsl.l);
    expect(Engine.hexToHsl(back).h).toBe(hsl.h);
  });

  it('handles negative and >360 hue input', () => {
    expect(Engine.hslToHex(-120, 100, 50)).toBe(Engine.hslToHex(240, 100, 50));
    expect(Engine.hslToHex(480, 100, 50)).toBe(Engine.hslToHex(120, 100, 50));
  });
});

describe('WCAG contrast', () => {
  it('black vs white has maximum contrast ratio', () => {
    expect(Engine.getContrastRatio('#000000', '#FFFFFF')).toBe(21);
  });

  it('identical colors have ratio 1', () => {
    expect(Engine.getContrastRatio('#6D5EF8', '#6D5EF8')).toBe(1);
  });

  it('white text passes AA on dark backgrounds', () => {
    const ratio = Engine.getContrastRatio('#16161A', '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('getWcagResult flags AA and AAA thresholds correctly', () => {
    expect(Engine.getWcagResult(4.6).aaNormal).toBe(true);
    expect(Engine.getWcagResult(4.2).aaNormal).toBe(false);
    expect(Engine.getWcagResult(7.2).aaaNormal).toBe(true);
    expect(Engine.getWcagResult(6.9).aaaNormal).toBe(false);
    expect(Engine.getWcagResult(3.2).aaLarge).toBe(true);
  });

  it('getReadableTextColor picks the higher-contrast option', () => {
    expect(Engine.getReadableTextColor('#000000')).toBe('#FFFFFF');
    expect(Engine.getReadableTextColor('#FFFFFF')).toBe('#000000');
    expect(Engine.getReadableTextColor('#16161A')).toBe('#FFFFFF');
  });
});

describe('color ramps', () => {
  it('generates the requested number of shades and tints', () => {
    expect(Engine.getShades('#6D5EF8', 5)).toHaveLength(5);
    expect(Engine.getTints('#6D5EF8', 5)).toHaveLength(5);
  });

  it('shades are darker and tints are lighter than the base', () => {
    const baseL = Engine.hexToHsl('#6D5EF8').l;
    const shades = Engine.getShades('#6D5EF8', 3).map(h => Engine.hexToHsl(h).l);
    const tints = Engine.getTints('#6D5EF8', 3).map(h => Engine.hexToHsl(h).l);
    shades.forEach(l => expect(l).toBeLessThan(baseL));
    tints.forEach(l => expect(l).toBeGreaterThan(baseL));
  });

  it('all generated colors are valid hex strings', () => {
    const all = [...Engine.getShades('#34D399', 4), ...Engine.getTints('#34D399', 4), ...Engine.getTones('#34D399', 4)];
    all.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/));
  });
});

describe('harmony generators', () => {
  it('all harmonies return 5 colors of valid hex', () => {
    const harmonies = [
      Engine.getComplementary('#6D5EF8'),
      Engine.getAnalogous('#6D5EF8'),
      Engine.getTriadic('#6D5EF8'),
      Engine.getSplitComplementary('#6D5EF8'),
      Engine.getTetradic('#6D5EF8'),
      Engine.getMonochromatic('#6D5EF8'),
    ];
    harmonies.forEach(palette => {
      expect(palette).toHaveLength(5);
      palette.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/));
    });
  });

  it('complementary hue is 180° opposite', () => {
    const baseHue = Engine.hexToHsl('#FF0000').h; // 0
    const palette = Engine.getComplementary('#FF0000');
    const compHue = Engine.hexToHsl(palette[3]).h;
    const expected = (baseHue + 180) % 360;
    const diff = Math.min(Math.abs(compHue - expected), 360 - Math.abs(compHue - expected));
    expect(diff).toBeLessThanOrEqual(2); // allow rounding
  });

  it('monochromatic keeps hue stable', () => {
    const baseHue = Engine.hexToHsl('#6D5EF8').h;
    const palette = Engine.getMonochromatic('#6D5EF8', 5);
    palette.forEach(c => {
      const diff = Math.abs(((Engine.hexToHsl(c).h - baseHue + 540) % 360) - 180);
      expect(diff).toBeLessThanOrEqual(2);
    });
  });
});

describe('getRandomPalette', () => {
  it('returns the requested count of valid hex colors', () => {
    const palette = Engine.getRandomPalette(5);
    expect(palette).toHaveLength(5);
    palette.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/));
  });
});

describe('getColorName', () => {
  it('names extreme lightness values', () => {
    expect(Engine.getColorName('#050505')).toBe('Obsidian Dark');
    expect(Engine.getColorName('#FCFCFC')).toBe('Frosted White');
  });

  it('names achromatic grays', () => {
    expect(Engine.getColorName('#808080')).toBe('Neutral Zinc');
  });

  it('returns a non-empty string for any valid hex', () => {
    ['#FF0000', '#00FF00', '#0000FF', '#FFC0CB'].forEach(c => {
      expect(Engine.getColorName(c).length).toBeGreaterThan(0);
    });
  });
});

describe('Utils.escapeHtml (XSS protection)', () => {
  it('escapes script injection attempts', () => {
    const loadUtils = async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const code = fs.readFileSync(path.resolve('public/js/utils.js'), 'utf-8');
      const mod = {exports: {}};
      new Function('module', 'window', `${code}\n; module.exports = Utils;`)(mod, globalThis.window);
      return mod.exports;
    };
    const Utils = globalThis.__testUtils || null;
    return loadUtils().then(U => {
      expect(U.escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
      expect(U.escapeHtml("it's a 'test' & more")).toBe('it&#39;s a &#39;test&#39; &amp; more');
      expect(U.escapeHtml(null)).toBe('');
    });
  });
});
