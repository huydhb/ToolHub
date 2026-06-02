/**
 * Base64 Encoder / Decoder
 * Tool: base64
 * Encodes and decodes text using Base64 with full UTF-8 support.
 */

import { copyToClipboard, showToast, debounce } from '../../scripts/utils.js';

// ─── CORE LOGIC ───────────────────────────────────────────────────────────────

/**
 * Encode a UTF-8 string to Base64.
 * Uses encodeURIComponent + unescape trick to handle non-ASCII characters.
 * @param {string} str
 * @returns {string}
 */
export function encodeBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    throw new Error('Không thể mã hóa chuỗi: ' + e.message);
  }
}

/**
 * Decode a Base64 string to UTF-8 text.
 * Reverses the encodeURIComponent + unescape trick.
 * @param {string} str
 * @returns {string}
 */
export function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    throw new Error('Chuỗi Base64 không hợp lệ');
  }
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn"><i data-lucide="arrow-left"></i> Về trang chủ</a>
        <div class="tool-title-row" style="--tool-accent: var(--color-blue);">
          <div class="tool-icon"><i data-lucide="binary"></i></div>
          <div>
            <h1 class="tool-name">Mã hóa / Giải mã Base64</h1>
            <p class="tool-tagline">Chuyển đổi văn bản sang Base64 và ngược lại, hỗ trợ UTF-8 đầy đủ</p>
          </div>
        </div>
      </div>

      <div class="tool-body">

        <!-- Mode selection -->
        <div class="tool-controls">
          <fieldset class="b64-fieldset">
            <legend class="b64-legend">Chế độ</legend>
            <div class="b64-radio-group">
              <label class="b64-radio-label">
                <input type="radio" name="b64-mode" value="encode" checked>
                <span>Encode</span>
              </label>
              <label class="b64-radio-label">
                <input type="radio" name="b64-mode" value="decode">
                <span>Decode</span>
              </label>
            </div>
          </fieldset>
        </div>

        <!-- Two-column layout -->
        <div class="b64-cols">

          <!-- Left: Input -->
          <div class="b64-col">
            <label class="b64-col-label" for="b64-input">Đầu vào</label>
            <textarea
              id="b64-input"
              rows="8"
              placeholder="Nhập văn bản..."
              class="b64-textarea"
              aria-label="Văn bản đầu vào"
            ></textarea>
            <div class="b64-col-actions">
              <button id="b64-action-btn" class="tool-btn" type="button">
                <i data-lucide="lock"></i>
                Encode
              </button>
            </div>
          </div>

          <!-- Center: Swap -->
          <div class="b64-center">
            <button id="b64-swap-btn" class="b64-swap" type="button" aria-label="Hoán đổi đầu vào và kết quả">
              ⇄
            </button>
          </div>

          <!-- Right: Output -->
          <div class="b64-col">
            <label class="b64-col-label" for="b64-output">Kết quả</label>
            <textarea
              id="b64-output"
              rows="8"
              readonly
              placeholder="Kết quả sẽ hiển thị ở đây..."
              class="b64-textarea b64-textarea--output"
              aria-label="Kết quả"
              aria-live="polite"
            ></textarea>
            <div class="b64-col-actions">
              <button id="b64-copy-btn" class="copy-btn" type="button" aria-label="Sao chép kết quả">
                <i data-lucide="copy"></i>
                Sao chép
              </button>
            </div>
          </div>

        </div>

        <!-- Error banner -->
        <div id="b64-error" class="tool-error" role="alert" aria-live="assertive">
          <i data-lucide="triangle-alert"></i>
          <span id="b64-error-msg">Lỗi không xác định</span>
        </div>

      </div>
    </div>

    <style>
      .b64-cols {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: var(--space-4);
        align-items: start;
      }
      .b64-swap {
        align-self: center;
        margin-top: var(--space-8);
        padding: var(--space-3);
        border-radius: var(--radius-full);
        border: 1px solid oklch(from var(--color-text) l c h / 0.15);
        font-size: var(--text-base);
        cursor: pointer;
        background: var(--color-surface-offset);
        color: var(--color-text-muted);
        transition: all var(--transition-interactive);
      }
      .b64-swap:hover {
        color: var(--color-text);
        background: var(--color-surface-dynamic);
      }
      @media (max-width: 640px) {
        .b64-cols {
          grid-template-columns: 1fr;
        }
        .b64-swap {
          width: 100%;
          margin-top: 0;
        }
      }

      .b64-col {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .b64-col-label {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted);
      }
      .b64-textarea {
        width: 100%;
        box-sizing: border-box;
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
        font-family: var(--font-mono);
        line-height: 1.6;
        color: var(--color-text);
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.12);
        border-radius: var(--radius-lg);
        resize: vertical;
        transition: border-color var(--transition-interactive), box-shadow var(--transition-interactive);
      }
      .b64-textarea:focus {
        outline: none;
        border-color: var(--color-blue, var(--color-primary));
        box-shadow: 0 0 0 3px oklch(from var(--color-blue, var(--color-primary)) l c h / 0.15);
      }
      .b64-textarea--output {
        background: var(--color-surface-offset);
        color: var(--color-text-muted);
        cursor: default;
      }
      .b64-col-actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .b64-center {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: var(--space-6);
      }
      .b64-fieldset {
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .b64-legend {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted);
        margin-bottom: var(--space-1);
        display: block;
      }
      .b64-radio-group {
        display: flex;
        gap: var(--space-4);
        flex-wrap: wrap;
      }
      .b64-radio-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text);
        cursor: pointer;
        user-select: none;
      }
      .b64-radio-label input[type="radio"] {
        accent-color: var(--color-blue, var(--color-primary));
        width: 15px;
        height: 15px;
        cursor: pointer;
      }
    </style>
  `;

  // ── Element references ──────────────────────────────────────────────────────

  const inputEl    = container.querySelector('#b64-input');
  const outputEl   = container.querySelector('#b64-output');
  const actionBtn  = container.querySelector('#b64-action-btn');
  const swapBtn    = container.querySelector('#b64-swap-btn');
  const copyBtn    = container.querySelector('#b64-copy-btn');
  const errorEl    = container.querySelector('#b64-error');
  const errorMsgEl = container.querySelector('#b64-error-msg');

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getMode() {
    return container.querySelector('input[name="b64-mode"]:checked').value;
  }

  function showError(msg) {
    errorMsgEl.textContent = msg;
    errorEl.classList.add('show');
  }

  function clearError() {
    errorEl.classList.remove('show');
  }

  function updateActionLabel() {
    const mode = getMode();
    actionBtn.innerHTML = mode === 'encode'
      ? '<i data-lucide="lock"></i> Encode'
      : '<i data-lucide="lock-open"></i> Decode';
    if (window.lucide) window.lucide.createIcons();
  }

  function process() {
    const input = inputEl.value;
    if (!input.trim()) {
      outputEl.value = '';
      clearError();
      return;
    }

    clearError();
    try {
      const mode = getMode();
      outputEl.value = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
    } catch (e) {
      outputEl.value = '';
      showError(e.message);
    }
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  // Action button: process immediately
  actionBtn.addEventListener('click', () => {
    process();
  });

  // Mode radio change: update label, re-process if there's input
  container.querySelectorAll('input[name="b64-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      clearError();
      updateActionLabel();
      if (inputEl.value.trim()) {
        process();
      }
    });
  });

  // Swap button: copy output → input, toggle mode, re-process
  swapBtn.addEventListener('click', () => {
    const currentOutput = outputEl.value;
    if (!currentOutput) return;

    inputEl.value = currentOutput;
    outputEl.value = '';

    // Toggle mode
    const currentMode = getMode();
    const nextMode = currentMode === 'encode' ? 'decode' : 'encode';
    const nextRadio = container.querySelector(`input[name="b64-mode"][value="${nextMode}"]`);
    if (nextRadio) nextRadio.checked = true;

    clearError();
    updateActionLabel();
    process();
  });

  // Live processing (debounced 300ms)
  const debouncedProcess = debounce(process, 300);
  inputEl.addEventListener('input', debouncedProcess);

  // Copy button
  copyBtn.addEventListener('click', async () => {
    const val = outputEl.value;
    if (!val) return;
    try {
      await copyToClipboard(val);
      showToast('Đã sao chép kết quả');
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 1500);
    } catch {
      showToast('Không thể sao chép', 'error');
    }
  });

  // Init icon labels
  updateActionLabel();

  // Render Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
