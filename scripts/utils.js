/**
 * Shared utilities for ToolHub.
 * Requirements: 16.1-16.4, 17.1-17.5
 */

// ─── CLIPBOARD ───────────────────────────────────────────────────────────────

/**
 * Copy text to clipboard. Uses navigator.clipboard when available,
 * falls back to execCommand for older browsers.
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback: create a temporary textarea
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(el);
  }
}

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────────────────────

/**
 * Show a temporary toast notification.
 * @param {string} message
 * @param {'success'|'error'} [type='success']
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-remove after 2 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

// ─── DEBOUNCE ─────────────────────────────────────────────────────────────────

/**
 * Returns a debounced version of fn.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ─── HTML ESCAPING ────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS when injecting into innerHTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── THEME ────────────────────────────────────────────────────────────────────

const THEME_KEY = 'toolhub-theme';

/**
 * Initialize the theme system.
 * Reads localStorage preference first, falls back to prefers-color-scheme.
 * Wires up the theme toggle button.
 */
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved ?? (prefersDark ? 'dark' : 'light');

  applyTheme(theme);

  // Wire toggle button — it may not exist yet if called before DOM is ready,
  // so we use event delegation via document.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[id="theme-toggle"], [data-theme-toggle]');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') ?? 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

/**
 * Apply a theme to the document root.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // Swap the toggle button icon between moon (dark) and sun (light)
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const iconPath = theme === 'dark'
    ? 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'                      // moon
    : 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z'; // sun

  const svg = btn.querySelector('svg');
  if (svg) {
    svg.querySelector('path').setAttribute('d', iconPath);
  }
}
