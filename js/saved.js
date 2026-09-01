/**
 * ColorCraft Saved Palettes & User Dashboard Controller (saved.html)
 * Manages saved palettes, dashboard stats, tagging, search, inline renaming, export, and deletion.
 */
const SavedManager = {
  palettes: [],
  activeFilterTag: 'all',
  searchQuery: '',
  sortBy: 'newest',

  init() {
    this.container = document.getElementById('savedPalettesGrid');
    this.emptyState = document.getElementById('savedEmptyState');
    this.searchInput = document.getElementById('savedSearchInput');
    this.sortSelect = document.getElementById('savedSortSelect');
    this.tagsContainer = document.getElementById('savedTagsFilter');
    this.countBadge = document.getElementById('savedCountBadge');

    this.ensureSeedData();
    this.syncUserHero();
    this.loadPalettes();
    this.bindEvents();

    window.addEventListener('colorcraft-auth-changed', () => {
      this.syncUserHero();
    });
  },

  syncUserHero() {
    const user = Auth.getCurrentUser();
    const avatar = document.getElementById('dashboardAvatar');
    const greeting = document.getElementById('dashboardGreeting');
    if (user && user.name) {
      if (avatar) avatar.textContent = user.avatarInitials || 'GK';
      if (greeting) greeting.textContent = `${user.name.split(' ')[0]}'s Palette Workspace`;
    } else {
      if (avatar) avatar.textContent = 'CC';
      if (greeting) greeting.textContent = 'Palette Workspace & Dashboard';
    }
  },

  // Ensure initial seed palettes for new users so the workspace looks rich and polished
  ensureSeedData() {
    const existing = Utils.storage.get('colorcraft-palettes', null);
    if (!existing || existing.length === 0) {
      const initialSeeds = [
        {
          id: 'seed_01',
          name: 'Sleek Interface Studio',
          colors: ['#6D5EF8', '#F472B6', '#FBBF24', '#34D399', '#16161A'],
          tags: ['Sleek', 'UI System', 'Featured'],
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'seed_02',
          name: 'Sunset Drift',
          colors: ['#FF6B6B', '#FFE66D', '#1A535C', '#4ECDC4', '#F7FFF7'],
          tags: ['Warm', 'Sunset', 'Editorial'],
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          id: 'seed_03',
          name: 'Corporate Neo',
          colors: ['#0D3B66', '#FAF0CA', '#F4D35E', '#EE964B', '#F95738'],
          tags: ['Corporate', 'SaaS', 'Modern'],
          createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
        },
        {
          id: 'seed_04',
          name: 'Emerald Blossom',
          colors: ['#064E3B', '#047857', '#10B981', '#34D399', '#A7F3D0'],
          tags: ['Ecosystem', 'Nature', 'Brand'],
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
        }
      ];
      Utils.storage.set('colorcraft-palettes', initialSeeds);
    }
  },

  loadPalettes() {
    this.palettes = Utils.storage.get('colorcraft-palettes', []);
    this.render();
  },

  render() {
    if (!this.container) return;

    let filtered = this.palettes.filter(p => {
      const matchesTag = this.activeFilterTag === 'all' || (p.tags && p.tags.includes(this.activeFilterTag));
      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        p.colors.some(c => c.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (this.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (this.sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    // Update Counts & Tags
    if (this.countBadge) this.countBadge.textContent = `${this.palettes.length} Palettes`;
    this.renderTags();

    if (filtered.length === 0) {
      this.container.style.display = 'none';
      if (this.emptyState) this.emptyState.style.display = 'flex';
      return;
    }

    this.container.style.display = 'grid';
    if (this.emptyState) this.emptyState.style.display = 'none';

    this.container.innerHTML = filtered.map(palette => {
      const colors = palette.colors || [];
      const timeStr = Utils.timeAgo(palette.createdAt);
      const tags = palette.tags || ['Custom'];

      return `
        <div class="saved-palette-card glass-panel" id="palCard_${palette.id}">
          <!-- Palette Swatches Strip -->
          <div class="saved-swatches-strip">
            ${colors.map(c => `
              <div class="saved-swatch-bar" style="background-color: ${c};" onclick="UI.copyToClipboard('${c}', 'Copied ${c}')" title="Click to copy ${c}">
                <span class="saved-swatch-hex" style="color: ${ColorEngine.getReadableTextColor(c)};">${c}</span>
              </div>
            `).join('')}
          </div>

          <!-- Card Content -->
          <div class="saved-card-body">
            <div class="saved-card-header">
              <div class="saved-title-wrap">
                <input type="text" class="saved-palette-rename-input" value="${palette.name}" 
                       onchange="SavedManager.renamePalette('${palette.id}', this.value)" 
                       title="Click to rename palette" />
                <div class="saved-meta-line">
                  <span>${timeStr}</span>
                  <span>•</span>
                  <span>${colors.length} Colors</span>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="saved-tags-row">
              ${tags.map(t => `<span class="saved-tag-badge">${t}</span>`).join('')}
            </div>

            <!-- Action Toolbar -->
            <div class="saved-actions-toolbar">
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="SavedManager.copyAllColors('${palette.id}')" title="Copy all HEX codes">
                  <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy All
                </button>
                <button class="btn btn-secondary btn-sm" onclick="SavedManager.exportPalette('${palette.id}')" title="Export Code">
                  <i data-lucide="code" style="width: 14px; height: 14px;"></i> Export
                </button>
              </div>

              <div style="display: flex; gap: 4px;">
                <button class="btn-icon-only btn-sm" onclick="SavedManager.duplicatePalette('${palette.id}')" title="Duplicate Palette">
                  <i data-lucide="copy-plus" style="width: 14px; height: 14px;"></i>
                </button>
                <button class="btn-icon-only btn-sm" onclick="SavedManager.confirmDelete('${palette.id}')" title="Delete Palette" style="color: var(--danger);">
                  <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderTags() {
    if (!this.tagsContainer) return;
    const allTags = new Set(['all']);
    this.palettes.forEach(p => {
      if (p.tags) p.tags.forEach(t => allTags.add(t));
    });

    this.tagsContainer.innerHTML = Array.from(allTags).map(tag => `
      <button class="tag-filter-btn ${this.activeFilterTag === tag ? 'active' : ''}" 
              onclick="SavedManager.setTagFilter('${tag}')">
        ${tag === 'all' ? 'All Palettes' : tag}
      </button>
    `).join('');
  },

  setTagFilter(tag) {
    this.activeFilterTag = tag;
    this.render();
  },

  renamePalette(id, newName) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const p = this.palettes.find(item => item.id === id);
    if (p) {
      p.name = trimmed;
      Utils.storage.set('colorcraft-palettes', this.palettes);
      UI.showToast(`Renamed to "${trimmed}"`, '#6D5EF8', 'edit-3');
    }
  },

  copyAllColors(id) {
    const p = this.palettes.find(item => item.id === id);
    if (p && p.colors) {
      UI.copyToClipboard(p.colors.join(', '), 'Copied all palette colors!');
    }
  },

  exportPalette(id) {
    const p = this.palettes.find(item => item.id === id);
    if (p) {
      UI.openExportModal(p);
    }
  },

  duplicatePalette(id) {
    const p = this.palettes.find(item => item.id === id);
    if (p) {
      const dup = {
        ...p,
        id: Utils.generateId(),
        name: `${p.name} (Copy)`,
        createdAt: new Date().toISOString()
      };
      this.palettes.unshift(dup);
      Utils.storage.set('colorcraft-palettes', this.palettes);
      this.render();
      UI.showToast(`Duplicated "${p.name}"`, dup.colors[0], 'copy-plus');
    }
  },

  confirmDelete(id) {
    const p = this.palettes.find(item => item.id === id);
    if (!p) return;

    const modalHtml = `
      <div class="modal-overlay is-open" id="deleteConfirmModal">
        <div class="modal-container" style="max-width: 400px;">
          <div class="modal-header">
            <h3 class="modal-title">Delete Palette</h3>
            <button class="btn-icon-only modal-close-btn" onclick="UI.closeModal('deleteConfirmModal')">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>"${p.name}"</strong>? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="UI.closeModal('deleteConfirmModal')">Cancel</button>
            <button class="btn btn-primary btn-sm" onclick="SavedManager.executeDelete('${id}')" style="background: var(--danger); border-color: var(--danger);">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;

    UI.mountModal(modalHtml, 'deleteConfirmModal');
  },

  executeDelete(id) {
    this.palettes = this.palettes.filter(p => p.id !== id);
    Utils.storage.set('colorcraft-palettes', this.palettes);
    UI.closeModal('deleteConfirmModal');
    this.render();
    UI.showToast('Palette deleted from workspace', '#EF4444', 'trash-2');
  },

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', Utils.debounce((e) => {
        this.searchQuery = e.target.value;
        this.render();
      }, 150));
    }

    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render();
      });
    }

    window.addEventListener('colorcraft-palette-saved', () => {
      this.loadPalettes();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SavedManager.init();
});

window.SavedManager = SavedManager;
