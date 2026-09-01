/**
 * ColorCraft Navbar Controller
 * Handles scroll blur transition, active link state, mobile drawer menu, and icons.
 */
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.site-navbar');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobilePanel = document.querySelector('.mobile-nav-panel');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // 1. Scroll-blur transition (scrollY >= 40px)
  if (navbar) {
    const handleScroll = Utils.throttleRAF(() => {
      const isScrolled = window.scrollY >= 40;
      if (isScrolled) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
  }

  // 2. Active nav link highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const targetPath = href.split('/').pop() || 'index.html';
      if (targetPath === currentPath || (currentPath === '' && targetPath === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });

  // 3. Mobile menu toggle
  if (hamburgerBtn && mobilePanel) {
    const toggleMobileMenu = () => {
      const isOpen = mobilePanel.classList.contains('is-open');
      if (isOpen) {
        mobilePanel.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.classList.add('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
      }
    };

    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close mobile panel on link click
    mobilePanel.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobilePanel.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobilePanel.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        mobilePanel.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobilePanel.classList.contains('is-open')) {
        mobilePanel.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Scroll Reveal Intersection Observer (Section 8)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: make everything visible immediately
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // 5. Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 6. Initialize Auth module
  if (window.Auth) {
    window.Auth.init();
  }

  // 7. Interactive Click Glowing Effect on Navbar Buttons, Links, Theme Toggle & Logo
  const attachNavGlowEffects = () => {
    const interactiveNavItems = document.querySelectorAll(
      '.site-navbar .btn, .site-navbar .auth-user-pill, .site-navbar .theme-toggle-btn, .site-navbar .brand-logo, .site-navbar .nav-link, .hamburger-btn, .mobile-nav-link, .brand-icon-wrapper'
    );

    interactiveNavItems.forEach(el => {
      if (el.dataset.hasGlowListener) return;
      el.dataset.hasGlowListener = 'true';

      el.addEventListener('click', (e) => {
        // Create glowing ripple element
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'nav-glow-ripple';

        // Calculate click coordinates or center if triggered by keyboard
        const clientX = e.clientX && e.clientX > 0 ? e.clientX : rect.left + rect.width / 2;
        const clientY = e.clientY && e.clientY > 0 ? e.clientY : rect.top + rect.height / 2;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // Attach ripple
        el.appendChild(ripple);
        setTimeout(() => {
          if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 400);

        // Apply glow pulse class
        const isTextLink = el.classList.contains('nav-link') || el.classList.contains('mobile-nav-link');
        const pulseClass = isTextLink ? 'is-glow-clicking-link' : 'is-glow-clicking';

        el.classList.remove(pulseClass);
        // Force reflow for restartable animation
        void el.offsetWidth;
        el.classList.add(pulseClass);

        setTimeout(() => {
          el.classList.remove(pulseClass);
        }, 400);
      });
    });
  };

  // Initial attachment
  attachNavGlowEffects();

  // Re-attach whenever auth state or DOM updates in navbar
  window.addEventListener('colorcraft-auth-changed', () => {
    setTimeout(attachNavGlowEffects, 50);
  });
});


