/**
 * ColorCraft General Utilities & DOM Helpers
 */
const Utils = {
  // Generate random integer between min and max inclusive
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Clamp number within min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Debounce function calls
  debounce(func, wait = 150) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  // Throttle function with requestAnimationFrame
  throttleRAF(fn) {
    let running = false;
    return function(...args) {
      if (running) return;
      running = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        running = false;
      });
    };
  },

  // Unique ID generator
  generateId() {
    return 'cc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  },

  // Safe localStorage helper
  storage: {
    get(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (e) {
        console.warn(`Error reading localStorage key "${key}":`, e);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn(`Error writing to localStorage key "${key}":`, e);
        return false;
      }
    }
  },

  // Format relative time (e.g. "2 hours ago", "Yesterday")
  timeAgo(isoString) {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
};

window.Utils = Utils;
