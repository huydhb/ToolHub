/**
 * UUID / ULID Generator
 * Tool: uuid-ulid-generator
 * Generates UUID v4, UUID v1, and ULID strings.
 */

import { copyToClipboard, showToast } from '../../scripts/utils.js';

// ─── CROCKFORD BASE32 ─────────────────────────────────────────────────────────

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// ─── CORE GENERATORS ─────────────────────────────────────────────────────────

/**
 * Generate a UUID v4 (random) string.
 * Uses crypto.getRandomValues for cryptographic randomness.
 * Sets version bits (4) and variant bits (RFC 4122).
 * @returns {string} Lowercase UUID v4 string (e.g. "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUUIDv4() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  // Set version to 4: top nibble of byte 6 = 0100
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to 10xx: top two bits of byte 8 = 10
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // Format as xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Generate a UUID v1 (time-based) string.
 * Uses Date.now() converted to 100-nanosecond intervals since 1582-10-15.
 * Node is random (not MAC address) for privacy.
 * @returns {string} Lowercase UUID v1 string
 */
export function generateUUIDv1() {
  // UUID v1 timestamp: 100-nanosecond intervals since 1582-10-15
  // Offset between Unix epoch (1970-01-01) and UUID epoch (1582-10-15)
  const OFFSET = 122192928000000000n;
  const nowMs = BigInt(Date.now());
  // Date.now() is in ms; multiply by 10000 to get 100-ns intervals
  const timestamp = nowMs * 10000n + OFFSET;

  // Split timestamp into its UUID fields
  // time_low:             bits 0–31   (low 32 bits of timestamp)
  const time_low = Number(timestamp & 0xFFFFFFFFn);
  // time_mid:             bits 32–47  (next 16 bits)
  const time_mid = Number((timestamp >> 32n) & 0xFFFFn);
  // time_hi_and_version:  bits 48–59  (top 12 bits) + version=1 in top nibble
  const time_hi = Number((timestamp >> 48n) & 0x0FFFn) | 0x1000;

  // Clock sequence: 14 random bits + variant bits 10xx
  const clockSeqBytes = crypto.getRandomValues(new Uint8Array(2));
  const clockSeq = ((clockSeqBytes[0] & 0x3f) | 0x80) << 8 | clockSeqBytes[1];

  // Node: random 6 bytes (48 bits)
  const nodeBytes = crypto.getRandomValues(new Uint8Array(6));
  const node = Array.from(nodeBytes, b => b.toString(16).padStart(2, '0')).join('');

  const timeLowHex   = time_low.toString(16).padStart(8, '0');
  const timeMidHex   = time_mid.toString(16).padStart(4, '0');
  const timeHiHex    = time_hi.toString(16).padStart(4, '0');
  const clockSeqHex  = clockSeq.toString(16).padStart(4, '0');

  return `${timeLowHex}-${timeMidHex}-${timeHiHex}-${clockSeqHex}-${node}`;
}

/**
 * Encode a value using Crockford Base32.
 * @param {bigint} value  - The numeric value to encode
 * @param {number} chars  - How many Base32 characters to produce (MSB first)
 * @returns {string}
 */
function crockfordEncode(value, chars) {
  let result = '';
  for (let i = 0; i < chars; i++) {
    result = CROCKFORD[Number(value & 0x1Fn)] + result;
    value >>= 5n;
  }
  return result;
}

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier).
 * Format: 10-char timestamp (48-bit ms) + 16-char random (80-bit) in Crockford Base32.
 * @returns {string} 26-character ULID string (uppercase)
 */
export function generateULID() {
  // Timestamp part: 48-bit millisecond timestamp, 10 Crockford Base32 chars
  const tsMs = BigInt(Date.now());
  const tsPart = crockfordEncode(tsMs, 10);

  // Random part: 10 random bytes = 80 bits, 16 Crockford Base32 chars
  const randBytes = crypto.getRandomValues(new Uint8Array(10));
  let randVal = 0n;
  for (const byte of randBytes) {
    randVal = (randVal << 8n) | BigInt(byte);
  }
  const randPart = crockfordEncode(randVal, 16);

  return tsPart + randPart;
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn"><i data-lucide="arrow-left"></i> Về trang chủ</a>
        <div class="tool-title-row" style="--tool-accent: var(--color-orange);">
          <div class="tool-icon"><i data-lucide="fingerprint"></i></div>
          <div>
            <h1 class="tool-name">UUID / ULID Generator</h1>
            <p class="tool-tagline">Tạo UUID v4, UUID v1 (time-based) và ULID ngẫu nhiên, bảo mật</p>
          </div>
        </div>
      </div>

      <div class="tool-body">
        <!-- Controls -->
        <div class="tool-controls">

          <!-- Type selector -->
          <fieldset class="uuid-fieldset">
            <legend class="uuid-legend">Loại ID</legend>
            <div class="uuid-radio-group">
              <label class="uuid-radio-label">
                <input type="radio" name="uuid-type" value="v4" checked>
                <span>UUID v4</span>
              </label>
              <label class="uuid-radio-label">
                <input type="radio" name="uuid-type" value="v1">
                <span>UUID v1 (time-based)</span>
              </label>
              <label class="uuid-radio-label">
                <input type="radio" name="uuid-type" value="ulid">
                <span>ULID</span>
              </label>
            </div>
          </fieldset>

          <!-- Quantity -->
          <label class="uuid-qty-label">
            <span class="uuid-legend">Số lượng</span>
            <input
              id="uuid-qty"
              type="number"
              min="1" max="100" value="1"
              class="uuid-qty-input"
              aria-label="Số lượng ID cần tạo"
            >
          </label>

          <!-- Generate button -->
          <button id="uuid-generate-btn" class="tool-btn" type="button">
            <i data-lucide="fingerprint"></i>
            Tạo ID
          </button>
        </div>

        <!-- Output list -->
        <div id="uuid-output" class="tool-output" aria-live="polite" aria-label="Danh sách ID được tạo">
          <p class="uuid-placeholder">Nhấn <strong>Tạo ID</strong> để bắt đầu.</p>
        </div>

        <!-- Copy All button -->
        <div class="uuid-actions" id="uuid-copy-all-row" style="display:none;">
          <button id="uuid-copy-all-btn" class="copy-btn" type="button">
            <i data-lucide="copy"></i>
            Copy All
          </button>
        </div>
      </div>
    </div>

    <style>
      .uuid-fieldset {
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .uuid-legend {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted);
        margin-bottom: var(--space-1);
        display: block;
      }
      .uuid-radio-group {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      .uuid-radio-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text);
        cursor: pointer;
        user-select: none;
      }
      .uuid-radio-label input[type="radio"] {
        accent-color: var(--color-orange, var(--color-primary));
        width: 15px;
        height: 15px;
        cursor: pointer;
      }
      .uuid-qty-label {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .uuid-qty-input {
        width: 72px;
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
        color: var(--color-text);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.18);
        border-radius: var(--radius-md);
        appearance: textfield;
        -moz-appearance: textfield;
        transition: border-color var(--transition-interactive);
      }
      .uuid-qty-input::-webkit-inner-spin-button,
      .uuid-qty-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
      .uuid-qty-input:focus {
        outline: 2px solid oklch(from var(--color-orange, var(--color-primary)) l c h / 0.5);
        outline-offset: 1px;
        border-color: var(--color-orange, var(--color-primary));
      }
      .uuid-placeholder {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin: auto;
        text-align: center;
        padding: var(--space-4);
      }
      .uuid-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-2) 0;
        border-bottom: 1px solid oklch(from var(--color-text) l c h / 0.07);
      }
      .uuid-item:last-child {
        border-bottom: none;
      }
      .uuid-item code {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        word-break: break-all;
        color: var(--color-text);
      }
      .uuid-actions {
        display: flex;
        justify-content: flex-end;
      }
    </style>
  `;

  // ── Wire up events ──────────────────────────────────────────────────────────

  const generateBtn   = container.querySelector('#uuid-generate-btn');
  const outputEl      = container.querySelector('#uuid-output');
  const qtyInput      = container.querySelector('#uuid-qty');
  const copyAllRow    = container.querySelector('#uuid-copy-all-row');
  const copyAllBtn    = container.querySelector('#uuid-copy-all-btn');

  // Track generated IDs for Copy All
  let currentIds = [];

  generateBtn.addEventListener('click', () => {
    const type = container.querySelector('input[name="uuid-type"]:checked').value;
    const qty  = Math.min(100, Math.max(1, parseInt(qtyInput.value, 10) || 1));
    qtyInput.value = qty;

    // Generate IDs
    const generators = {
      v4:   generateUUIDv4,
      v1:   generateUUIDv1,
      ulid: generateULID,
    };
    const gen = generators[type];
    currentIds = Array.from({ length: qty }, () => gen());

    // Render output
    outputEl.innerHTML = '';
    currentIds.forEach((id) => {
      const item = document.createElement('div');
      item.className = 'uuid-item';
      item.innerHTML = `
        <code>${id}</code>
        <button class="copy-btn" type="button" aria-label="Copy ${id}">
          <i data-lucide="copy"></i>
          Copy
        </button>
      `;

      item.querySelector('.copy-btn').addEventListener('click', async () => {
        try {
          await copyToClipboard(id);
          showToast('Đã sao chép: ' + id);
          const btn = item.querySelector('.copy-btn');
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1500);
        } catch {
          showToast('Không thể sao chép', 'error');
        }
      });

      outputEl.appendChild(item);
    });

    // Show Copy All button when there are results
    copyAllRow.style.display = currentIds.length > 0 ? 'flex' : 'none';

    // Re-render Lucide icons for new content
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Copy All handler
  copyAllBtn.addEventListener('click', async () => {
    if (currentIds.length === 0) return;
    try {
      await copyToClipboard(currentIds.join('\n'));
      showToast(`Đã sao chép ${currentIds.length} ID`);
      copyAllBtn.classList.add('copied');
      setTimeout(() => copyAllBtn.classList.remove('copied'), 1500);
    } catch {
      showToast('Không thể sao chép', 'error');
    }
  });
}
