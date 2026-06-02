/**
 * JSON Formatter Tool
 * Validates: Requirements 8.3, 8.4 (Property 3: JSON formatter round-trip)
 */

import { copyToClipboard, showToast, escapeHtml } from '../../scripts/utils.js';

// ─── CORE LOGIC ───────────────────────────────────────────────────────────────

/**
 * Format (pretty-print) a JSON string.
 * @param {string} input  - raw JSON text
 * @param {number|string} indent - 2, 4, or '\t'
 * @returns {{ ok: true, output: string } | { ok: false, error: string }}
 */
export function formatJson(input, indent) {
  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed, null, indent);
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Minify a JSON string.
 * @param {string} input - raw JSON text
 * @returns {{ ok: true, output: string } | { ok: false, error: string }}
 */
export function minifyJson(input) {
  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed);
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Apply syntax highlighting to an already-formatted JSON string.
 * Escapes HTML first, then wraps tokens in <span> elements with CSS classes.
 * @param {string} jsonStr - formatted JSON text (not HTML)
 * @returns {string} HTML string with color spans
 */
export function syntaxHighlight(jsonStr) {
  // 1. Escape HTML entities so < > & " in string values render safely
  const escaped = escapeHtml(jsonStr);

  // 2. Regex-based token colorization over the escaped string.
  //    Order matters: keys before string values, then numbers, booleans, null.
  return escaped.replace(
    /(&quot;)((?:\\.|[^&])*?)(&quot;)(\s*:)?|(\btrue\b|\bfalse\b)|\bnull\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, q1, keyOrStr, q3, colon, bool, num) => {
      if (q1 !== undefined) {
        // It's a quoted value — check if followed by a colon (i.e. an object key)
        if (colon) {
          // Object key
          return `<span class="json-key">${q1}${keyOrStr}${q3}</span>${colon}`;
        }
        // String value
        return `<span class="json-string">${q1}${keyOrStr}${q3}</span>`;
      }
      if (bool !== undefined) {
        return `<span class="json-bool">${bool}</span>`;
      }
      if (match === 'null') {
        return `<span class="json-null">null</span>`;
      }
      if (num !== undefined) {
        return `<span class="json-number">${num}</span>`;
      }
      return match;
    }
  );
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <style>
      .json-key    { color: var(--color-primary); }
      .json-string { color: var(--color-success); }
      .json-number { color: var(--color-blue); }
      .json-bool   { color: var(--color-orange); }
      .json-null   { color: var(--color-orange); opacity: 0.7; }
      #json-output {
        white-space: pre;
        overflow-x: auto;
        min-height: 100px;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
      }
      .indent-controls {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        flex-wrap: wrap;
      }
      .indent-controls label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        cursor: pointer;
      }
      .indent-controls input[type="radio"] {
        accent-color: var(--color-primary);
        cursor: pointer;
      }
      .output-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-2);
      }
      .output-header .field-label {
        margin-bottom: 0;
      }
    </style>

    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Về trang chủ
        </a>
        <div class="tool-title-row">
          <div class="tool-icon" style="--tool-accent: var(--color-gold);">
            <i data-lucide="braces"></i>
          </div>
          <div>
            <h1 class="tool-name">JSON Formatter</h1>
            <p class="tool-tagline">Định dạng, tô màu cú pháp và nén JSON nhanh chóng</p>
          </div>
        </div>
      </div>

      <div class="tool-body">

        <!-- Input -->
        <div>
          <label class="field-label" for="json-input">JSON Input</label>
          <textarea
            id="json-input"
            rows="10"
            class="field-input"
            placeholder="Dán JSON vào đây..."
            spellcheck="false"
            style="font-family: var(--font-mono); font-size: var(--text-sm); resize: vertical;"
          ></textarea>
        </div>

        <!-- Controls -->
        <div class="tool-controls">
          <!-- Indent options -->
          <div class="indent-controls">
            <label>
              <input type="radio" name="json-indent" value="2" checked>
              2 khoảng
            </label>
            <label>
              <input type="radio" name="json-indent" value="4">
              4 khoảng
            </label>
            <label>
              <input type="radio" name="json-indent" value="tab">
              Tab
            </label>
          </div>

          <!-- Action buttons -->
          <div style="display: flex; gap: var(--space-3); margin-left: auto; flex-wrap: wrap;">
            <button id="json-format-btn" class="tool-btn">
              <i data-lucide="align-left"></i>
              Format
            </button>
            <button id="json-minify-btn" class="btn-ghost">
              <i data-lucide="minimize-2"></i>
              Minify
            </button>
            <button id="json-clear-btn" class="btn-ghost">
              <i data-lucide="trash-2"></i>
              Clear
            </button>
          </div>
        </div>

        <!-- Error banner -->
        <div class="tool-error" id="json-error">
          <i data-lucide="alert-circle"></i>
          <span id="json-error-msg"></span>
        </div>

        <!-- Output -->
        <div>
          <div class="output-header">
            <label class="field-label" for="json-output">Kết quả</label>
            <button id="json-copy-btn" class="copy-btn">
              <i data-lucide="copy"></i>
              Sao chép
            </button>
          </div>
          <pre id="json-output" class="tool-output"></pre>
        </div>

      </div>
    </div>
  `;

  // ── Element references ──────────────────────────────────────────────────────
  const inputEl   = container.querySelector('#json-input');
  const outputEl  = container.querySelector('#json-output');
  const errorEl   = container.querySelector('#json-error');
  const errorMsg  = container.querySelector('#json-error-msg');
  const formatBtn = container.querySelector('#json-format-btn');
  const minifyBtn = container.querySelector('#json-minify-btn');
  const clearBtn  = container.querySelector('#json-clear-btn');
  const copyBtn   = container.querySelector('#json-copy-btn');

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getIndent() {
    const selected = container.querySelector('input[name="json-indent"]:checked');
    const val = selected ? selected.value : '2';
    if (val === 'tab') return '\t';
    return parseInt(val, 10);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorEl.classList.add('show');
  }

  function clearError() {
    errorEl.classList.remove('show');
    errorMsg.textContent = '';
  }

  function clearOutput() {
    outputEl.innerHTML = '';
  }

  // ── Event handlers ──────────────────────────────────────────────────────────

  formatBtn.addEventListener('click', () => {
    clearError();
    const result = formatJson(inputEl.value, getIndent());
    if (result.ok) {
      outputEl.innerHTML = syntaxHighlight(result.output);
    } else {
      clearOutput();
      showError(result.error);
    }
  });

  minifyBtn.addEventListener('click', () => {
    clearError();
    const result = minifyJson(inputEl.value);
    if (result.ok) {
      outputEl.innerHTML = syntaxHighlight(result.output);
    } else {
      clearOutput();
      showError(result.error);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    clearOutput();
    clearError();
  });

  copyBtn.addEventListener('click', async () => {
    const text = outputEl.textContent;
    if (!text.trim()) return;
    try {
      await copyToClipboard(text);
      copyBtn.classList.add('copied');
      showToast('Đã sao chép JSON!');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    } catch {
      showToast('Không thể sao chép', 'error');
    }
  });
}
