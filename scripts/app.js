/**
 * App entry point — initializes theme and router.
 * Requirements: 1.4, 3.1
 */

import { TOOLS }      from './registry.js';
import { initRouter } from './router.js';
import { initTheme }  from './utils.js';

// Initialize theme first so there's no flash of wrong theme
initTheme();

// Boot the router once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  initRouter(document.getElementById('app'), TOOLS);
}
