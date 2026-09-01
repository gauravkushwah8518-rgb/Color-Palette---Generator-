/**
 * ColorCraft Auth & User State Manager
 * Handles user sign-up, login, demo access, session state, tool gating, and user dashboard integration.
 */
const Auth = {
  CURRENT_USER_KEY: 'colorcraft_active_user',
  USERS_STORE_KEY: 'colorcraft_registered_users',

  // Initialize Auth state
  init() {
    this.ensureDefaultData();
    this.updateNavbarAuthUI();
    this.updatePageGates();
    this.bindEvents();

    // Listen to auth changes
    window.addEventListener('colorcraft-auth-changed', () => {
      this.updateNavbarAuthUI();
      this.updatePageGates();
    });
  },

  // Ensure default registered users in store
  ensureDefaultData() {
    let users = Utils.storage.get(this.USERS_STORE_KEY, null);
    if (!users || !Array.isArray(users) || users.length === 0) {
      users = [
        {
          id: 'user_pro_01',
          name: 'Gaurav Kushwah',
          email: 'gauravkushwah8518@gmail.com',
          avatarInitials: 'GK',
          tier: 'Pro Creator',
          joinedAt: new Date().toISOString()
        }
      ];
      Utils.storage.set(this.USERS_STORE_KEY, users);
    }
  },

  // Get currently active user (returns null if logged out)
  getCurrentUser() {
    return Utils.storage.get(this.CURRENT_USER_KEY, null);
  },

  // Check if logged in
  isLoggedIn() {
    const user = this.getCurrentUser();
    return user !== null && typeof user === 'object' && Boolean(user.id);
  },

  // Require authentication before executing an action
  requireAuth(callback, featureName = 'use this feature') {
    if (this.isLoggedIn()) {
      if (typeof callback === 'function') callback();
      return true;
    }
    UI.showToast(`Please sign in or create an account to ${featureName}`, '#6D5EF8', 'lock');
    this.openAuthModal('login');
    return false;
  },

  // Sign up new user
  signUp(name, email, password) {
    if (!name || !email) {
      UI.showToast('Please provide your full name and email', '#EF4444', 'alert-circle');
      return false;
    }

    const users = Utils.storage.get(this.USERS_STORE_KEY, []);
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (existing) {
      this.setActiveUser(existing);
      UI.showToast(`Welcome back, ${existing.name}! Logged in successfully.`, '#10B981', 'check-circle');
      return true;
    }

    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'CC';
    const newUser = {
      id: Utils.generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarInitials: initials,
      tier: 'Pro Creator',
      joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    Utils.storage.set(this.USERS_STORE_KEY, users);
    this.setActiveUser(newUser);
    UI.showToast(`🎉 Account created! Welcome, ${newUser.name}!`, '#6D5EF8', 'sparkles');
    return true;
  },

  // Login existing user
  login(email, password) {
    if (!email) {
      UI.showToast('Please enter your email address', '#EF4444', 'alert-circle');
      return false;
    }

    const users = Utils.storage.get(this.USERS_STORE_KEY, []);
    let user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      // Create user smoothly if new
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'CC';
      user = {
        id: Utils.generateId(),
        name: name,
        email: email.trim().toLowerCase(),
        avatarInitials: initials,
        tier: 'Pro Creator',
        joinedAt: new Date().toISOString()
      };
      users.push(user);
      Utils.storage.set(this.USERS_STORE_KEY, users);
    }

    this.setActiveUser(user);
    UI.showToast(`✨ Welcome back, ${user.name}! Logged in.`, '#10B981', 'check-circle');
    return true;
  },

  // 1-Click Demo Login
  demoLogin() {
    const users = Utils.storage.get(this.USERS_STORE_KEY, []);
    const demoUser = users[0] || {
      id: 'user_pro_01',
      name: 'Gaurav Kushwah',
      email: 'gauravkushwah8518@gmail.com',
      avatarInitials: 'GK',
      tier: 'Pro Creator',
      joinedAt: new Date().toISOString()
    };

    this.setActiveUser(demoUser);
    UI.showToast(`🚀 Signed in as ${demoUser.name}`, '#6D5EF8', 'sparkles');
    UI.closeModal('authModal');
    return true;
  },

  // Set active user session
  setActiveUser(user) {
    Utils.storage.set(this.CURRENT_USER_KEY, user);
    this.updateNavbarAuthUI();
    this.updatePageGates();
    window.dispatchEvent(new CustomEvent('colorcraft-auth-changed', { detail: { user } }));
  },

  // Logout / Switch to Logged Out State & Open Login Page
  logout() {
    Utils.storage.set(this.CURRENT_USER_KEY, null);
    this.updateNavbarAuthUI();
    this.updatePageGates();
    UI.showToast('You have been logged out successfully.', '#8E8E98', 'log-out');
    window.dispatchEvent(new CustomEvent('colorcraft-auth-changed', { detail: { user: null } }));

    // Redirect to login modal / auth page immediately
    setTimeout(() => {
      this.openAuthModal('login');
    }, 250);
  },

  // Update navbar auth button / profile UI
  updateNavbarAuthUI() {
    const user = this.getCurrentUser();
    const cluster = document.getElementById('navbarAuthSlot');
    const mobileSlot = document.getElementById('mobileAuthSlot');

    if (cluster) {
      if (user && user.id) {
        cluster.innerHTML = `
          <button id="userProfileBtn" class="auth-user-pill" title="Signed in as ${user.name} (${user.email})">
            <span class="user-avatar-circle">${user.avatarInitials}</span>
            <span class="user-name-text">${user.name.split(' ')[0]}</span>
          </button>
        `;
      } else {
        cluster.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="openLoginBtn" class="btn btn-secondary btn-sm" onclick="Auth.openAuthModal('login')">
              <i data-lucide="log-in" style="width: 14px; height: 14px;"></i> Log In
            </button>
            <button id="openSignupBtn" class="btn btn-primary btn-sm" onclick="Auth.openAuthModal('signup')">
              <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i> Sign In
            </button>
          </div>
        `;
      }
    }

    if (mobileSlot) {
      if (user && user.id) {
        mobileSlot.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface-hover); border-radius: var(--radius-sm); border: 1px solid var(--border); margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="user-avatar-circle" style="width: 32px; height: 32px; font-size: 0.85rem;">${user.avatarInitials}</span>
              <div>
                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${user.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${user.email}</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="Auth.logout()" style="color: var(--danger); padding: 4px 8px;">
              <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Sign Out
            </button>
          </div>
        `;
      } else {
        mobileSlot.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="Auth.openAuthModal('login')" style="width: 100%;">
              <i data-lucide="log-in" style="width: 14px; height: 14px;"></i> Log In
            </button>
            <button class="btn btn-primary btn-sm" onclick="Auth.openAuthModal('signup')" style="width: 100%;">
              <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i> Sign In
            </button>
          </div>
        `;
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // Update in-page auth gates across pages
  updatePageGates() {
    const isAuth = this.isLoggedIn();
    const gateSlots = document.querySelectorAll('.auth-gate-slot');
    const protectedAreas = document.querySelectorAll('.auth-protected-area');

    if (isAuth) {
      // UNLOCKED STATE
      gateSlots.forEach(slot => {
        slot.style.display = 'none';
        slot.innerHTML = '';
      });

      protectedAreas.forEach(area => {
        area.classList.remove('auth-locked-blur');
        area.style.pointerEvents = 'auto';
        const overlay = area.querySelector('.auth-locked-overlay');
        if (overlay) overlay.remove();
      });
    } else {
      // LOCKED / UNAUTHENTICATED STATE - Show Sign Up / Login First Gate
      gateSlots.forEach(slot => {
        slot.style.display = 'block';
        slot.innerHTML = `
          <div class="auth-gate-card">
            <div class="auth-gate-badge">
              <i data-lucide="lock" style="width: 13px; height: 13px;"></i> Authentication Required
            </div>
            <h2 class="auth-gate-title">First Sign In or Log In to Use Features</h2>
            <p class="auth-gate-desc">
              Create an account or sign in to unlock the real-time Palette Generator, Explorer, Gradient Studio, WCAG Contrast Analyzer, and Saved Workspace.
            </p>

            <div class="auth-gate-tabs">
              <button type="button" class="auth-gate-tab active" id="inpageTabSignup" onclick="Auth.setInpageTab('signup')">
                <i data-lucide="user-plus" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Sign In
              </button>
              <button type="button" class="auth-gate-tab" id="inpageTabLogin" onclick="Auth.setInpageTab('login')">
                <i data-lucide="log-in" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Log In
              </button>
            </div>

            <form id="inpageAuthForm" onsubmit="Auth.handleInpageSubmit(event)" style="text-align: left;">
              <div class="form-group" id="inpageNameGroup">
                <label class="form-label" for="inpageNameInput">Full Name</label>
                <input type="text" id="inpageNameInput" class="form-input" placeholder="e.g. Gaurav Kushwah" value="Gaurav Kushwah" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="inpageEmailInput">Email Address</label>
                <input type="email" id="inpageEmailInput" class="form-input" placeholder="you@example.com" value="gauravkushwah8518@gmail.com" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="inpagePasswordInput">Password</label>
                <input type="password" id="inpagePasswordInput" class="form-input" placeholder="••••••••••••" value="password123" required />
              </div>

              <input type="hidden" id="inpageModeField" value="signup" />

              <div style="margin-top: 16px;">
                <button type="submit" class="btn btn-primary" id="inpageSubmitBtn" style="width: 100%;">
                  <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> <span id="inpageSubmitText">Create Account & Unlock</span>
                </button>
              </div>
            </form>
          </div>
        `;
      });

      protectedAreas.forEach(area => {
        area.classList.add('auth-locked-blur');
        area.style.pointerEvents = 'none';

        // Check if overlay already exists
        if (!area.querySelector('.auth-locked-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'auth-locked-overlay';
          overlay.style.pointerEvents = 'auto';
          overlay.innerHTML = `
            <div style="text-align: center; background: var(--surface); padding: 24px 32px; border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: var(--shadow-lg); max-width: 380px;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                <i data-lucide="lock" style="width: 24px; height: 24px;"></i>
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 6px;">Feature Locked</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
                Please sign in or log in first to use this tool and view live outputs.
              </p>
              <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="btn btn-primary btn-sm" onclick="Auth.openAuthModal('signup')">
                  <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i> Sign In
                </button>
                <button class="btn btn-secondary btn-sm" onclick="Auth.openAuthModal('login')">
                  <i data-lucide="log-in" style="width: 14px; height: 14px;"></i> Log In
                </button>
              </div>
            </div>
          `;
          area.appendChild(overlay);
        }
      });
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // Toggle in-page auth tab
  setInpageTab(mode) {
    const tabSignup = document.getElementById('inpageTabSignup');
    const tabLogin = document.getElementById('inpageTabLogin');
    const nameGroup = document.getElementById('inpageNameGroup');
    const nameInput = document.getElementById('inpageNameInput');
    const modeField = document.getElementById('inpageModeField');
    const submitText = document.getElementById('inpageSubmitText');

    if (!modeField) return;

    modeField.value = mode;

    if (mode === 'signup') {
      if (tabSignup) tabSignup.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (nameGroup) nameGroup.style.display = 'block';
      if (nameInput) nameInput.required = true;
      if (submitText) submitText.textContent = 'Create Account & Unlock';
    } else {
      if (tabSignup) tabSignup.classList.remove('active');
      if (tabLogin) tabLogin.classList.add('active');
      if (nameGroup) nameGroup.style.display = 'none';
      if (nameInput) nameInput.required = false;
      if (submitText) submitText.textContent = 'Log In & Unlock';
    }

    if (window.lucide) window.lucide.createIcons();
  },

  // Handle in-page auth submission
  handleInpageSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('inpageModeField') ? document.getElementById('inpageModeField').value : 'signup';
    const email = document.getElementById('inpageEmailInput') ? document.getElementById('inpageEmailInput').value : '';
    const name = document.getElementById('inpageNameInput') ? document.getElementById('inpageNameInput').value : '';

    if (mode === 'signup') {
      this.signUp(name, email, 'password123');
    } else {
      this.login(email, 'password123');
    }
  },

  // Bind modal triggers
  bindEvents() {
    document.addEventListener('click', (e) => {
      const authBtn = e.target.closest('#openAuthModalBtn') || e.target.closest('.trigger-auth-modal') || e.target.closest('#openLoginBtn') || e.target.closest('#openSignupBtn');
      if (authBtn) {
        e.preventDefault();
        const mode = authBtn.id === 'openLoginBtn' ? 'login' : 'signup';
        this.openAuthModal(mode);
      }

      const profileBtn = e.target.closest('#userProfileBtn');
      if (profileBtn) {
        e.preventDefault();
        this.openProfileModal();
      }
    });
  },

  // Open Auth Modal (Login / Sign Up)
  openAuthModal(defaultMode = 'login') {
    const modalHtml = `
      <div class="modal-overlay is-open" id="authModal">
        <div class="modal-container" style="max-width: 440px;">
          <div class="modal-header">
            <div>
              <h3 class="modal-title" id="authModalHeading">${defaultMode === 'signup' ? 'Create ColorCraft Account' : 'Sign In to ColorCraft'}</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                ${defaultMode === 'signup' ? 'Create your account to save palettes, customize gradients, and sync design tokens.' : 'Sign in to access your workspace and saved palettes.'}
              </p>
            </div>
            <button class="btn-icon-only modal-close-btn" onclick="UI.closeModal('authModal')">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <form id="authModalForm" onsubmit="Auth.handleAuthSubmit(event)">
            <div class="modal-body">
              <div class="form-group" id="authNameGroup" style="${defaultMode === 'login' ? 'display: none;' : ''}">
                <label class="form-label" for="authNameInput">Full Name</label>
                <input type="text" id="authNameInput" class="form-input" placeholder="e.g. Gaurav Kushwah" ${defaultMode === 'signup' ? 'required' : ''} />
              </div>

              <div class="form-group">
                <label class="form-label" for="authEmailInput">Email Address</label>
                <input type="email" id="authEmailInput" class="form-input" placeholder="you@example.com" required value="gauravkushwah8518@gmail.com" />
              </div>

              <div class="form-group">
                <label class="form-label" for="authPasswordInput">Password</label>
                <input type="password" id="authPasswordInput" class="form-input" placeholder="••••••••••••" required value="password123" />
                <span class="form-hint">Enter your password to sign in</span>
              </div>

              <input type="hidden" id="authModeField" value="${defaultMode}" />
            </div>

            <div class="modal-footer" style="justify-content: space-between;">
              <button type="button" class="btn btn-ghost btn-sm" id="authToggleModeBtn" onclick="Auth.toggleAuthMode()">
                ${defaultMode === 'signup' ? 'Already have an account? Log In' : "Don't have an account? Sign In"}
              </button>
              <button type="submit" class="btn btn-primary btn-sm">
                <i data-lucide="${defaultMode === 'signup' ? 'user-plus' : 'log-in'}" style="width: 14px; height: 14px;"></i>
                <span id="authSubmitText">${defaultMode === 'signup' ? 'Create Account' : 'Log In'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    UI.mountModal(modalHtml, 'authModal');
  },

  // Toggle between Sign Up and Login inside the modal
  toggleAuthMode() {
    const modeField = document.getElementById('authModeField');
    const nameGroup = document.getElementById('authNameGroup');
    const heading = document.getElementById('authModalHeading');
    const submitText = document.getElementById('authSubmitText');
    const toggleBtn = document.getElementById('authToggleModeBtn');
    const nameInput = document.getElementById('authNameInput');

    if (!modeField) return;

    if (modeField.value === 'signup') {
      modeField.value = 'login';
      heading.textContent = 'Log In to ColorCraft';
      if (nameGroup) nameGroup.style.display = 'none';
      if (nameInput) nameInput.required = false;
      if (submitText) submitText.textContent = 'Log In';
      if (toggleBtn) toggleBtn.textContent = "Don't have an account? Sign In";
    } else {
      modeField.value = 'signup';
      heading.textContent = 'Create ColorCraft Account';
      if (nameGroup) nameGroup.style.display = 'block';
      if (nameInput) nameInput.required = true;
      if (submitText) submitText.textContent = 'Create Account';
      if (toggleBtn) toggleBtn.textContent = 'Already have an account? Log In';
    }
  },

  // Handle Form Submission
  handleAuthSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('authModeField') ? document.getElementById('authModeField').value : 'signup';
    const email = document.getElementById('authEmailInput') ? document.getElementById('authEmailInput').value : '';
    const name = document.getElementById('authNameInput') ? document.getElementById('authNameInput').value : '';

    if (mode === 'signup') {
      const ok = this.signUp(name, email, 'password123');
      if (ok) UI.closeModal('authModal');
    } else {
      const ok = this.login(email, 'password123');
      if (ok) UI.closeModal('authModal');
    }
  },

  // Open User Profile & Dashboard shortcut Modal
  openProfileModal() {
    const user = this.getCurrentUser();
    if (!user) return this.openAuthModal('login');

    const savedPalettes = Utils.storage.get('colorcraft-palettes', []);
    const userCount = savedPalettes.length;

    const modalHtml = `
      <div class="modal-overlay is-open" id="profileModal">
        <div class="modal-container" style="max-width: 480px;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="user-avatar-circle" style="width: 42px; height: 42px; font-size: 1.1rem;">
                ${user.avatarInitials}
              </div>
              <div>
                <h3 class="modal-title">${user.name}</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">${user.email}</p>
              </div>
            </div>
            <button class="btn-icon-only modal-close-btn" onclick="UI.closeModal('profileModal')">
              <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <div class="modal-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
              <div style="background: var(--surface-hover); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Saved Palettes</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent); margin-top: 4px;">${userCount}</div>
              </div>
              <div style="background: var(--surface-hover); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Account Tier</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${user.tier}</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <a href="saved.html" class="btn btn-secondary" style="width: 100%; justify-content: flex-start;">
                <i data-lucide="layout-dashboard" style="width: 16px; height: 16px; color: var(--accent);"></i> Open Saved Workspace
              </a>
              <a href="explorer.html" class="btn btn-secondary" style="width: 100%; justify-content: flex-start;">
                <i data-lucide="compass" style="width: 16px; height: 16px; color: var(--accent);"></i> Color Harmony Explorer
              </a>
              <a href="gradient.html" class="btn btn-secondary" style="width: 100%; justify-content: flex-start;">
                <i data-lucide="blend" style="width: 16px; height: 16px; color: var(--accent);"></i> Gradient Studio
              </a>
              <a href="contrast.html" class="btn btn-secondary" style="width: 100%; justify-content: flex-start;">
                <i data-lucide="sun-medium" style="width: 16px; height: 16px; color: var(--accent);"></i> Contrast & WCAG Analyzer
              </a>
            </div>
          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-ghost btn-sm" onclick="Auth.logout(); UI.closeModal('profileModal');" style="color: var(--danger); gap: 6px;">
              <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Sign Out / Logout
            </button>
            <button class="btn btn-primary btn-sm" onclick="UI.closeModal('profileModal')">
              Done
            </button>
          </div>
        </div>
      </div>
    `;

    UI.mountModal(modalHtml, 'profileModal');
  }
};

window.Auth = Auth;
