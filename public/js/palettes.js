/**
 * ColorCraft Curated Palettes Gallery (explorer.html)
 * ColorHunt-inspired curated collection — light, pastel, and aesthetic palettes.
 * Features: search, tag filters, click-to-copy, like (localStorage), Use in Generator.
 */
const Palettes = {
  LIKE_KEY: 'colorcraft-palette-likes',

  // Curated palette collection (ColorHunt light/pastel style)
  LIBRARY: [
    // ---- Light & Airy ----
    { c: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD'], t: ['light', 'minimal', 'grey'] },
    { c: ['#FFFFFF', '#F1F1F1', '#E0E0E0', '#BDBDBD', '#9E9E9E'], t: ['light', 'minimal', 'white'] },
    { c: ['#FFFDF7', '#FAF3E0', '#F3E5D8', '#EAD9C9', '#D9C3B0'], t: ['light', 'cream', 'warm'] },
    { c: ['#F7F8FC', '#E8ECF7', '#D6DFF2', '#C0CEE8', '#A6B8D8'], t: ['light', 'blue', 'pastel'] },
    { c: ['#FDFCFB', '#F5EFE6', '#E8DECF', '#D8C8B2', '#BFA98E'], t: ['light', 'beige', 'warm'] },

    // ---- Pastel Dreams ----
    { c: ['#FFB5E8', '#FF9CEE', '#B28DFF', '#85E3FF', '#BFFCC6'], t: ['pastel', 'happy', 'kids'] },
    { c: ['#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F7D6E0'], t: ['pastel', 'kids', 'happy'] },
    { c: ['#FAD0C4', '#FFD1FF', '#ADDDF2', '#C0F2DC', '#FDF3B4'], t: ['pastel', 'summer', 'light'] },
    { c: ['#E0BBE4', '#957DAD', '#D291BC', '#F2D7EE', '#FFC3A0'], t: ['pastel', 'purple', 'wedding'] },
    { c: ['#FDCEDF', '#F8EFD4', '#CEE5D0', '#B5D8CC', '#94B9AF'], t: ['pastel', 'mint', 'nature'] },

    // ---- Soft Blues & Sky ----
    { c: ['#DBE2EF', '#9FB8E4', '#6C9BD1', '#3F72AF', '#1D4E89'], t: ['blue', 'cold', 'sky'] },
    { c: ['#EAF6FF', '#D6EFFF', '#B8E4FF', '#8FD6FF', '#61C3FF'], t: ['light', 'blue', 'sky'] },
    { c: ['#F0F7FA', '#D3E5EC', '#A9CBD9', '#7FAFC2', '#5491A9'], t: ['blue', 'cold', 'sea'] },
    { c: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5'], t: ['blue', 'cold', 'light'] },
    { c: ['#E8F6F3', '#C5EBE3', '#9ADCD0', '#6FC7B8', '#45AD9D'], t: ['mint', 'nature', 'light'] },

    // ---- Warm Peaches & Sunset ----
    { c: ['#FFF5E4', '#FFE3E1', '#FFD1D1', '#FF9494', '#FF6B6B'], t: ['warm', 'peach', 'happy'] },
    { c: ['#FFE5B4', '#FFD08A', '#FBB86C', '#F59B4C', '#E87A2E'], t: ['warm', 'orange', 'summer'] },
    { c: ['#FFF1E6', '#FFDCCC', '#FFC2A8', '#FFA07A', '#F4784F'], t: ['warm', 'peach', 'retro'] },
    { c: ['#FBE7C6', '#F9C9A3', '#F2A17C', '#E77C62', '#C95853'], t: ['warm', 'sunset', 'retro'] },
    { c: ['#FDEBD3', '#FAD3A3', '#F5B376', '#EC8F52', '#D96C3F'], t: ['warm', 'fall', 'cream'] },

    // ---- Pinks & Roses ----
    { c: ['#FFF0F5', '#FFD9E8', '#FFC0D9', '#FF8FBD', '#FF5C9E'], t: ['pink', 'light', 'wedding'] },
    { c: ['#F9E0E9', '#F5C3D8', '#EFA0C3', '#E37BA9', '#D1548C'], t: ['pink', 'pastel', 'romantic'] },
    { c: ['#FFE9F2', '#FFC8DC', '#FFA3C7', '#FF7BAF', '#F4569B'], t: ['pink', 'happy', 'kids'] },
    { c: ['#FDF6F0', '#F7E3DC', '#EFCDC5', '#E0ABA6', '#C98A8A'], t: ['light', 'cream', 'skin'] },

    // ---- Greens & Nature ----
    { c: ['#F0F7F0', '#DCEFDA', '#C2E5C0', '#9FD8A3', '#78C487'], t: ['green', 'nature', 'light'] },
    { c: ['#EBF5EA', '#D3EAD4', '#B2DCB5', '#8DC996', '#65B073'], t: ['green', 'sage', 'nature'] },
    { c: ['#F4F9EE', '#E2F1D5', '#C9E5B8', '#A8D495', '#82BF6E'], t: ['green', 'spring', 'light'] },
    { c: ['#F1F8EF', '#DDEEDD', '#C3E2C5', '#A4D1AB', '#81BB8D'], t: ['green', 'mint', 'nature'] },

    // ---- Cream, Coffee & Earth ----
    { c: ['#FDF8F3', '#F5EDE3', '#EADCC8', '#D9C4A9', '#BCA384'], t: ['cream', 'coffee', 'warm'] },
    { c: ['#FAF6F0', '#EFE5D8', '#DFD0BE', '#C9B299', '#A98F73'], t: ['cream', 'beige', 'earth'] },
    { c: ['#F8F4EF', '#EBDFD3', '#D9C7B4', '#C0A78E', '#9E856C'], t: ['coffee', 'earth', 'warm'] },
    { c: ['#FFF9F0', '#FFEFD9', '#FFE2BE', '#FFD19E', '#F2B879'], t: ['cream', 'gold', 'warm'] },

    // ---- Grey & Modern Minimal ----
    { c: ['#F7F7F9', '#EAEAEE', '#D5D5DB', '#B7B7C0', '#92929E'], t: ['grey', 'minimal', 'cold'] },
    { c: ['#FAFAFA', '#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE'], t: ['grey', 'minimal', 'light'] },
    { c: ['#FFFFFF', '#F5F7FA', '#E4E9F0', '#C9D2DE', '#A6B2C1'], t: ['white', 'minimal', 'cold'] },
    { c: ['#F6F6F6', '#E8E8E8', '#D8D8D8', '#C0C0C0', '#A9A9A9'], t: ['grey', 'light', 'minimal'] },

    // ---- Lavender & Purple Light ----
    { c: ['#F5F3FF', '#E9E4FF', '#D8CFFF', '#C2B4F7', '#A992EC'], t: ['purple', 'light', 'pastel'] },
    { c: ['#F7F4FD', '#EBE3F8', '#DCCFEF', '#C8B5E3', '#AE97D3'], t: ['purple', 'pastel', 'light'] },
    { c: ['#FAF5FF', '#F0E5FF', '#E0CEFF', '#CCB2FF', '#B58FF5'], t: ['purple', 'lavender', 'wedding'] },

    // ---- Aesthetic Mixed ----
    { c: ['#F9F7F7', '#DBE2EF', '#3F72AF', '#112D4E', '#F5F5F5'], t: ['blue', 'minimal', 'modern'] },
    { c: ['#FFF8E8', '#F7ECD4', '#D8B08C', '#A67B5B', '#5C4033'], t: ['cream', 'coffee', 'retro'] },
    { c: ['#F2F7F5', '#DCE9E4', '#B8D4CB', '#8FB8AC', '#63998B'], t: ['sage', 'nature', 'light'] },
    { c: ['#FFF5F5', '#FFE3E3', '#FFC9C9', '#FFA8A8', '#FF8787'], t: ['red', 'warm', 'happy'] },
    { c: ['#F0F4F8', '#D9E2EC', '#BCCCDC', '#9FB3C8', '#627D98'], t: ['blue', 'grey', 'cold'] },
    { c: ['#FEFBF5', '#F7F1E5', '#EDE3D0', '#DCCDB5', '#C4B295'], t: ['cream', 'beige', 'light'] },
    { c: ['#F3F7F9', '#E1EBF0', '#C6D8E2', '#A3BFCF', '#7DA2B8'], t: ['blue', 'light', 'sea'] }
  ],

  // ColorHunt-style palette names derived from dominant hue
  TAG_LABELS: {
    light: 'Light', minimal: 'Minimal', pastel: 'Pastel', warm: 'Warm', cold: 'Cold',
    blue: 'Blue', pink: 'Pink', green: 'Green', purple: 'Purple', cream: 'Cream',
    coffee: 'Coffee', grey: 'Grey', white: 'White', beige: 'Beige', mint: 'Mint',
    peach: 'Peach', sky: 'Sky', sea: 'Sea', nature: 'Nature', sage: 'Sage',
    happy: 'Happy', kids: 'Kids', wedding: 'Wedding', retro: 'Retro', summer: 'Summer',
    fall: 'Fall', spring: 'Spring', sunset: 'Sunset', orange: 'Orange', red: 'Red',
    gold: 'Gold', lavender: 'Lavender', earth: 'Earth', romantic: 'Romantic',
    modern: 'Modern', skin: 'Skin'
  },

  likes: [],

  init() {
    try {
      this.likes = JSON.parse(localStorage.getItem(this.LIKE_KEY) || '[]');
    } catch (e) { this.likes = []; }

    this.grid = document.getElementById('paletteGallery');
    if (!this.grid) return;

    this.searchInput = document.getElementById('paletteSearch');
    this.tagBar = document.getElementById('paletteTagBar');
    this.countEl = document.getElementById('paletteCount');

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', Utils.debounce(() => this.render(), 120));
    }
    if (this.tagBar) {
      this.tagBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.palette-tag-chip');
        if (!chip) return;
        document.querySelectorAll('.palette-tag-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        this.render();
      });
    }

    // Event delegation for card actions
    this.grid.addEventListener('click', (e) => {
      const card = e.target.closest('.palette-card');
      if (!card) return;
      const index = parseInt(card.dataset.index, 10);
      const entry = this.filtered()[index];
      if (!entry) return;

      const likeBtn = e.target.closest('.palette-like');
      const copyBtn = e.target.closest('.palette-copy');
      const useBtn = e.target.closest('.palette-use');

      if (likeBtn) {
        this.toggleLike(entry);
        return;
      }
      if (copyBtn) {
        this.copyPalette(entry);
        return;
      }
      if (useBtn) {
        this.useInGenerator(entry);
        return;
      }

      // Click on a color strip copies that single hex
      const strip = e.target.closest('.palette-strip-swatch');
      if (strip) {
        this.copyHex(strip.dataset.hex, strip);
      }
    });
  },

  filtered() {
    const q = (this.searchInput && this.searchInput.value || '').toLowerCase().trim();
    const activeChip = document.querySelector('.palette-tag-chip.is-active');
    const tag = activeChip && !activeChip.dataset.tag.startsWith('all') ? activeChip.dataset.tag : null;

    return this.LIBRARY
      .map((entry, i) => ({ ...entry, i }))
      .filter(entry => {
        if (tag && !entry.t.includes(tag)) return false;
        if (!q) return true;
        // Match tag names OR any hex string (with or without #)
        const hexMatch = entry.c.some(hex => hex.toLowerCase().includes(q.replace('#', '')));
        const tagMatch = entry.t.some(t => t.includes(q));
        return hexMatch || tagMatch;
      });
  },

  render() {
    const items = this.filtered();
    if (this.countEl) {
      this.countEl.textContent = items.length + ' palette' + (items.length === 1 ? '' : 's');
    }

    if (!items.length) {
      this.grid.innerHTML = '<div class="palette-empty">No palettes match your search — try "pastel", "blue", or clear filters.</div>';
      return;
    }

    // XSS-safe: colors come from our own constant library, but escape anyway
    this.grid.innerHTML = items.map((entry, pos) => {
      const hexes = entry.c.map(h => Utils.escapeHtml(h)).join('');
      const tags = entry.t.slice(0, 3).map(t => Utils.escapeHtml(this.TAG_LABELS[t] || t)).join(', ');
      const liked = this.likes.includes(entry.i);
      return (
        '<article class="palette-card reveal-on-scroll' + (pos < 9 ? ' is-visible' : '') + '" data-index="' + entry.i + '">' +
          '<div class="palette-strip">' + hexes + '</div>' +
          '<div class="palette-card-body">' +
            '<span class="palette-tags">' + tags + '</span>' +
            '<div class="palette-actions">' +
              '<button class="palette-like' + (liked ? ' is-liked' : '') + '" aria-label="Like palette" title="Like">' +
                '<i data-lucide="heart"></i>' +
              '</button>' +
              '<button class="palette-copy" aria-label="Copy palette" title="Copy all hex codes">' +
                '<i data-lucide="copy"></i>' +
              '</button>' +
              '<button class="palette-use" aria-label="Use in generator" title="Use in Generator">' +
                '<i data-lucide="arrow-right"></i>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    if (window.lucide) window.lucide.createIcons();
    this.observeReveal();
  },  observeReveal() {
    const unrevealed = () => [...this.grid.querySelectorAll('.reveal-on-scroll:not(.is-visible)')];

    if (!('IntersectionObserver' in window)) {
      this.grid.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          o.unobserve(en.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 120px 0px' });
    unrevealed().forEach(el => obs.observe(el));

    // Safety net: on scroll (throttled), force-reveal anything inside the viewport
    // that the observer may have missed (fast jumps, anchor scrolls, restored scroll).
    if (!this._revealFallback) {
      this._revealFallback = Utils.throttleRAF(() => {
        const vh = window.innerHeight;
        unrevealed().forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < vh + 100 && r.bottom > -100) el.classList.add('is-visible');
        });
      });
      window.addEventListener('scroll', this._revealFallback, { passive: true });
    }
  },

  toggleLike(entry) {
    const idx = this.likes.indexOf(entry.i);
    if (idx >= 0) this.likes.splice(idx, 1);
    else this.likes.push(entry.i);
    try { localStorage.setItem(this.LIKE_KEY, JSON.stringify(this.likes)); } catch (e) { /* private mode */ }
    this.render();
  },

  copyHex(hex, el) {
    navigator.clipboard.writeText(hex).then(() => {
      UI.showToast(hex + ' copied!', hex, 'check');
    }).catch(() => {
      UI.showToast('Copy failed', '#EF4444', 'x');
    });
  },

  copyPalette(entry) {
    const text = entry.c.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      UI.showToast('Palette copied to clipboard!', entry.c[0], 'copy');
    }).catch(() => {
      UI.showToast('Copy failed', '#EF4444', 'x');
    });
  },

  useInGenerator(entry) {
    // Stash selection; generator picks it up on index.html
    try {
      sessionStorage.setItem('colorcraft-seed-palette', JSON.stringify(entry.c));
    } catch (e) { /* ignore */ }
    window.location.href = 'index.html?seed=' + encodeURIComponent(entry.c.join('-').replace(/#/g, ''));
  }
};

document.addEventListener('DOMContentLoaded', () => Palettes.init());
