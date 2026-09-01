/**
 * ColorCraft Ultra-Smooth Seamless SPA Router
 * Enables instant pre-fetching, 60fps buttery cross-dissolve page transitions,
 * history pushState management, and dynamic controller execution.
 */
const Router = {
  cache: new Map(),
  isNavigating: false,

  init() {
    // 1. Preload on hover & touch
    document.addEventListener('mouseover', (e) => this.handlePreload(e), { passive: true });
    document.addEventListener('touchstart', (e) => this.handlePreload(e), { passive: true });

    // 2. Intercept navigation clicks
    document.addEventListener('click', (e) => this.handleClick(e));

    // 3. Handle browser back / forward buttons
    window.addEventListener('popstate', () => {
      const path = window.location.pathname.split('/').pop() || 'index.html';
      this.navigate(path, false);
    });

    // 4. Preload core pages during idle time so navigation is 100% instant
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => this.preloadAllPages());
    } else {
      setTimeout(() => this.preloadAllPages(), 800);
    }
  },

  preloadAllPages() {
    const pages = ['index.html', 'explorer.html', 'gradient.html', 'contrast.html', 'saved.html', 'guide.html'];
    pages.forEach(p => this.fetchPage(p));
  },

  async fetchPage(url) {
    const cleanUrl = url.split('#')[0] || 'index.html';
    if (this.cache.has(cleanUrl)) {
      return this.cache.get(cleanUrl);
    }
    try {
      const res = await fetch(cleanUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      this.cache.set(cleanUrl, html);
      return html;
    } catch (err) {
      console.warn('Preload fetch error:', cleanUrl, err);
      return null;
    }
  },

  handlePreload(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) return;
    this.fetchPage(href);
  },

  async handleClick(e) {
    // Only intercept primary left clicks without modifier keys
    if (e.button !== 0 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Check if in-page anchor
    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // External or special links
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }

    // Internal navigation
    e.preventDefault();

    // Close mobile panel immediately if open
    const mobilePanel = document.querySelector('.mobile-nav-panel');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    if (mobilePanel && mobilePanel.classList.contains('is-open')) {
      mobilePanel.classList.remove('is-open');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    this.navigate(href, true);
  },

  async navigate(targetUrl, pushState = true) {
    if (this.isNavigating) return;
    this.isNavigating = true;

    const cleanTarget = targetUrl.split('#')[0] || 'index.html';
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // If clicking the current page link, smoothly scroll to top
    if (cleanTarget === currentPath && !targetUrl.includes('#')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.isNavigating = false;
      return;
    }

    const mainEl = document.querySelector('main');
    if (!mainEl) {
      window.location.href = targetUrl;
      return;
    }

    try {
      // 1. Trigger transition out
      mainEl.classList.add('page-transition-out');

      // 2. Fetch page HTML
      let html = await this.fetchPage(cleanTarget);
      if (!html) {
        window.location.href = targetUrl;
        return;
      }

      // 3. Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      const newTitle = doc.querySelector('title');

      if (!newMain) {
        window.location.href = targetUrl;
        return;
      }

      // 4. Wait for smooth cross-dissolve exit (140ms)
      await new Promise(r => setTimeout(r, 140));

      // 5. Swap main content and classes
      mainEl.innerHTML = newMain.innerHTML;
      mainEl.className = newMain.className;
      if (newTitle) document.title = newTitle.innerText;

      // 6. Push state to history
      if (pushState) {
        window.history.pushState({ path: targetUrl }, '', targetUrl);
      }

      // 7. Scroll to top
      window.scrollTo(0, 0);

      // 8. Update active nav link highlight
      this.updateActiveNavLinks(cleanTarget);

      // 9. Trigger smooth entrance transition
      mainEl.classList.remove('page-transition-out');
      mainEl.classList.add('page-transition-in');
      setTimeout(() => {
        mainEl.classList.remove('page-transition-in');
      }, 280);

      // 10. Initialize target page controller
      await this.initPageController(cleanTarget);

      // 11. Re-initialize icons, scroll observer, and auth
      if (window.lucide) window.lucide.createIcons();
      if (window.UI && UI.initScrollObserver) UI.initScrollObserver();
      if (window.Auth) {
        window.Auth.updateNavbarAuthUI();
        window.Auth.updatePageGates();
      }

    } catch (err) {
      console.error('Seamless transition error, fallback to reload:', err);
      window.location.href = targetUrl;
    } finally {
      this.isNavigating = false;
    }
  },

  updateActiveNavLinks(targetPage) {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const path = href.split('/').pop() || 'index.html';
        if (path === targetPage || (targetPage === '' && path === 'index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  },

  async initPageController(targetPage) {
    const page = targetPage.split('/').pop() || 'index.html';

    switch (page) {
      case 'index.html':
      case '':
        await this.loadScriptIfNeeded('js/generator.js');
        if (window.Generator) window.Generator.init();
        break;
      case 'explorer.html':
        await this.loadScriptIfNeeded('js/explorer.js');
        if (window.Explorer) window.Explorer.init();
        break;
      case 'gradient.html':
        await this.loadScriptIfNeeded('js/gradient.js');
        if (window.GradientStudio) window.GradientStudio.init();
        break;
      case 'contrast.html':
        await this.loadScriptIfNeeded('js/contrast.js');
        if (window.ContrastAnalyzer) window.ContrastAnalyzer.init();
        break;
      case 'saved.html':
        await this.loadScriptIfNeeded('js/saved.js');
        if (window.SavedManager) window.SavedManager.init();
        break;
      case 'guide.html':
        await this.loadScriptIfNeeded('js/guide.js');
        if (window.Guide) window.Guide.init();
        break;
    }
  },

  loadScriptIfNeeded(src) {
    if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => resolve(); // continue gracefully
      document.body.appendChild(script);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});

window.Router = Router;
