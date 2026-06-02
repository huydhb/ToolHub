/**
 * Password Generator Tool
 * Generates cryptographically secure random passwords.
 * Requirements: 6.3, 6.8 (Password constraint satisfaction)
 */

import { copyToClipboard, showToast } from '../../scripts/utils.js';

// ─── CHARSETS ─────────────────────────────────────────────────────────────────

const CHARSET_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_NUMBERS = '0123456789';
const CHARSET_SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

// ─── CORE LOGIC ───────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random password.
 * @param {number} length  - Desired password length (8–128)
 * @param {{ upper: boolean, lower: boolean, numbers: boolean, symbols: boolean }} opts
 * @returns {string} The generated password, or '' if no charset is selected.
 */
export function generatePassword(length, opts) {
  const { upper, lower, numbers, symbols } = opts;

  // Build combined charset
  let charset = '';
  if (upper)   charset += CHARSET_UPPER;
  if (lower)   charset += CHARSET_LOWER;
  if (numbers) charset += CHARSET_NUMBERS;
  if (symbols) charset += CHARSET_SYMBOLS;

  if (!charset) return '';

  // Generate length*2 random bytes so we have enough after modulo bias trimming
  const randBytes = crypto.getRandomValues(new Uint8Array(length * 2));
  let pool = Array.from(randBytes).map(b => charset[b % charset.length]);

  // Take the first `length` characters as our initial draft
  // (We need more than `length` entries in the pool to guarantee guarantee chars)
  let password = pool.slice(0, length);

  // ── Guarantee at least one char from each selected type ───────────────────
  const required = [];
  if (upper)   required.push(pickRandom(CHARSET_UPPER));
  if (lower)   required.push(pickRandom(CHARSET_LOWER));
  if (numbers) required.push(pickRandom(CHARSET_NUMBERS));
  if (symbols) required.push(pickRandom(CHARSET_SYMBOLS));

  // Replace the first N positions with the guaranteed characters
  for (let i = 0; i < required.length; i++) {
    password[i] = required[i];
  }

  // ── Fisher-Yates shuffle using crypto.getRandomValues ─────────────────────
  for (let i = password.length - 1; i > 0; i--) {
    const swapBytes = crypto.getRandomValues(new Uint8Array(1));
    const j = swapBytes[0] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

/**
 * Pick one cryptographically random character from a charset string.
 * @param {string} charset
 * @returns {string}
 */
function pickRandom(charset) {
  const bytes = crypto.getRandomValues(new Uint8Array(1));
  return charset[bytes[0] % charset.length];
}

/**
 * Assess password strength based on length and number of selected charset types.
 * @param {number} length
 * @param {number} charsetCount  - Number of selected charset types (0–4)
 * @returns {'weak'|'medium'|'strong'}
 */
export function getStrength(length, charsetCount) {
  if (length < 8 || charsetCount < 2) return 'weak';
  if (length >= 12 && charsetCount >= 3) return 'strong';
  return 'medium';
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Về trang chủ
        </a>
        <div class="tool-title-row">
          <div class="tool-icon" style="--tool-accent: var(--color-blue);">
            <i data-lucide="key-round"></i>
          </div>
          <div>
            <h1 class="tool-name">Tạo Mật Khẩu Mạnh</h1>
            <p class="tool-tagline">Tạo mật khẩu ngẫu nhiên, an toàn với độ phức tạp tuỳ chỉnh.</p>
          </div>
        </div>
      </div>

      <div class="tool-body">

        <!-- Password display row -->
        <div class="pg-display-row">
          <div class="pg-input-wrap">
            <input type="password" id="pw-display" class="pg-pw-input" readonly
                   placeholder="Nhấn 'Tạo mật khẩu' để bắt đầu" autocomplete="off" spellcheck="false">
          </div>
          <button id="pw-visibility-btn" class="pg-icon-btn" title="Hiện / Ẩn mật khẩu" aria-label="Hiện / Ẩn mật khẩu">
            <i id="pw-visibility-icon" data-lucide="eye"></i>
          </button>
          <button id="pw-copy-btn" class="copy-btn" title="Sao chép mật khẩu" aria-label="Sao chép mật khẩu">
            <i data-lucide="copy"></i>
            <span>Sao chép</span>
          </button>
        </div>

        <!-- Strength meter -->
        <div class="pg-strength-wrap">
          <div class="strength-bar">
            <div class="strength-bar-fill" id="pw-strength-fill" data-strength="weak"></div>
          </div>
          <span class="strength-label" id="pw-strength-label" data-strength="weak">Yếu</span>
        </div>

        <!-- Controls -->
        <div class="tool-controls" style="flex-direction: column; align-items: stretch; gap: var(--space-5);">

          <!-- Length row -->
          <div class="pg-length-row">
            <label class="pg-label" for="pw-length-slider">
              Độ dài: <strong id="pw-length-display">16</strong>
            </label>
            <input type="range" id="pw-length-slider" class="pg-slider"
                   min="8" max="128" value="16" step="1" aria-label="Độ dài mật khẩu">
          </div>

          <!-- Charset checkboxes -->
          <div class="pg-checkboxes">
            <label class="pg-check-label">
              <input type="checkbox" id="pw-upper" checked>
              <span class="pg-check-text">Chữ hoa (A-Z)</span>
            </label>
            <label class="pg-check-label">
              <input type="checkbox" id="pw-lower" checked>
              <span class="pg-check-text">Chữ thường (a-z)</span>
            </label>
            <label class="pg-check-label">
              <input type="checkbox" id="pw-numbers" checked>
              <span class="pg-check-text">Số (0-9)</span>
            </label>
            <label class="pg-check-label">
              <input type="checkbox" id="pw-symbols" checked>
              <span class="pg-check-text">Ký tự đặc biệt (!@#$…)</span>
            </label>
          </div>

          <!-- Error message -->
          <div class="tool-error" id="pw-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Chọn ít nhất một loại ký tự
          </div>

          <!-- Generate button -->
          <button id="pw-generate-btn" class="tool-btn" style="align-self: flex-start;">
            <i data-lucide="refresh-cw"></i>
            Tạo mật khẩu
          </button>

        </div>
      </div>
    </div>

    <style>
      .pg-display-row {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-4) var(--space-5);
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-xl);
      }

      .pg-input-wrap {
        flex: 1;
        min-width: 0;
      }

      .pg-pw-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-mono);
        font-size: var(--text-base);
        color: var(--color-text);
        letter-spacing: 0.05em;
      }
      .pg-pw-input::placeholder { color: var(--color-text-subtle); }

      .pg-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.12);
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        flex-shrink: 0;
        transition: color var(--transition-interactive), border-color var(--transition-interactive), background var(--transition-interactive);
      }
      .pg-icon-btn:hover {
        color: var(--color-text);
        border-color: oklch(from var(--color-text) l c h / 0.25);
        background: var(--color-surface-dynamic);
      }
      .pg-icon-btn svg { width: 16px; height: 16px; }

      .pg-strength-wrap {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
      .pg-strength-wrap .strength-bar { flex: 1; }

      .pg-length-row {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        flex-wrap: wrap;
      }

      .pg-label {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        font-weight: 500;
        min-width: 100px;
        white-space: nowrap;
      }
      .pg-label strong { color: var(--color-text); }

      .pg-slider {
        flex: 1;
        min-width: 160px;
        accent-color: var(--color-blue, var(--color-primary));
        cursor: pointer;
      }

      .pg-checkboxes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--space-3);
      }

      .pg-check-label {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        cursor: pointer;
        user-select: none;
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        transition: background var(--transition-interactive), border-color var(--transition-interactive);
      }
      .pg-check-label:hover {
        background: oklch(from var(--color-text) l c h / 0.03);
        border-color: oklch(from var(--color-text) l c h / 0.15);
      }
      .pg-check-label input[type="checkbox"] {
        accent-color: var(--color-blue, var(--color-primary));
        width: 15px;
        height: 15px;
        flex-shrink: 0;
        cursor: pointer;
      }
      .pg-check-text {
        font-size: var(--text-sm);
        color: var(--color-text);
        font-family: var(--font-mono);
      }
    </style>
  `;

  // ── Element refs ──────────────────────────────────────────────────────────
  const pwDisplay      = container.querySelector('#pw-display');
  const visibilityBtn  = container.querySelector('#pw-visibility-btn');
  const visibilityIcon = container.querySelector('#pw-visibility-icon');
  const copyBtn        = container.querySelector('#pw-copy-btn');
  const strengthFill   = container.querySelector('#pw-strength-fill');
  const strengthLabel  = container.querySelector('#pw-strength-label');
  const lengthSlider   = container.querySelector('#pw-length-slider');
  const lengthDisplay  = container.querySelector('#pw-length-display');
  const chkUpper       = container.querySelector('#pw-upper');
  const chkLower       = container.querySelector('#pw-lower');
  const chkNumbers     = container.querySelector('#pw-numbers');
  const chkSymbols     = container.querySelector('#pw-symbols');
  const errorDiv       = container.querySelector('#pw-error');
  const generateBtn    = container.querySelector('#pw-generate-btn');

  let currentPassword = '';

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getOpts() {
    return {
      upper:   chkUpper.checked,
      lower:   chkLower.checked,
      numbers: chkNumbers.checked,
      symbols: chkSymbols.checked,
    };
  }

  function getCharsetCount() {
    return [chkUpper, chkLower, chkNumbers, chkSymbols].filter(c => c.checked).length;
  }

  const STRENGTH_LABELS = { weak: 'Yếu', medium: 'Trung bình', strong: 'Mạnh' };

  function updateStrength(length, charsetCount) {
    const s = getStrength(length, charsetCount);
    strengthFill.setAttribute('data-strength', s);
    strengthLabel.setAttribute('data-strength', s);
    strengthLabel.textContent = STRENGTH_LABELS[s];
  }

  function generate() {
    const length = parseInt(lengthSlider.value, 10);
    const opts   = getOpts();
    const count  = getCharsetCount();

    const pwd = generatePassword(length, opts);

    if (!pwd) {
      errorDiv.classList.add('show');
      pwDisplay.value = '';
      currentPassword = '';
      strengthFill.setAttribute('data-strength', 'weak');
      strengthLabel.setAttribute('data-strength', 'weak');
      strengthLabel.textContent = STRENGTH_LABELS.weak;
      return;
    }

    errorDiv.classList.remove('show');
    currentPassword = pwd;
    pwDisplay.value = pwd;
    updateStrength(length, count);
  }

  // ── Event wiring ──────────────────────────────────────────────────────────

  // Generate button
  generateBtn.addEventListener('click', generate);

  // Length slider: update label live and re-generate
  lengthSlider.addEventListener('input', () => {
    lengthDisplay.textContent = lengthSlider.value;
    generate();
  });

  // Checkboxes: re-generate on change
  [chkUpper, chkLower, chkNumbers, chkSymbols].forEach(chk => {
    chk.addEventListener('change', generate);
  });

  // Visibility toggle
  let isVisible = false;
  visibilityBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    pwDisplay.type = isVisible ? 'text' : 'password';
    visibilityIcon.setAttribute('data-lucide', isVisible ? 'eye-off' : 'eye');
    // Re-render the Lucide icon
    if (window.lucide) window.lucide.createIcons({ nodes: [visibilityIcon] });
  });

  // Copy button
  copyBtn.addEventListener('click', async () => {
    if (!currentPassword) return;
    try {
      await copyToClipboard(currentPassword);
      showToast('Đã sao chép mật khẩu');
    } catch {
      showToast('Không thể sao chép', 'error');
    }
  });

  // ── Auto-generate on mount ────────────────────────────────────────────────
  generate();
}
