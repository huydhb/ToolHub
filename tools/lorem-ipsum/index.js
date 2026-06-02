/**
 * Lorem Ipsum Generator Tool
 * Generates lorem ipsum placeholder text as paragraphs, sentences, or words.
 *
 * Exports: generateSentence, generateParagraph, generateWords, generate, mount
 */

import { copyToClipboard, showToast } from '../../scripts/utils.js';

// ─── CORPUS ──────────────────────────────────────────────────────────────────

const LOREM_WORDS = [
  // Classical opening words (required by spec)
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit',
  'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
  'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum',
  // Extended corpus (~140 more words to reach ~200 total)
  'accumsan', 'ac', 'aptent', 'arcu', 'at', 'auctor', 'augue', 'bibendum',
  'blandit', 'class', 'commodo', 'condimentum', 'congue', 'conubia', 'convallis',
  'cras', 'cubilia', 'cum', 'curabitur', 'curae', 'cursus', 'dapibus', 'diam',
  'dictum', 'dictumst', 'dis', 'donec', 'dui', 'duis', 'egestas', 'eleifend',
  'elementum', 'eros', 'etiam', 'eu', 'euismod', 'facilisi', 'facilisis',
  'fames', 'faucibus', 'felis', 'fermentum', 'feugiat', 'fringilla', 'fusce',
  'gravida', 'habitant', 'habitasse', 'hac', 'hendrerit', 'himenaeos', 'iaculis',
  'imperdiet', 'integer', 'interdum', 'inceptos', 'justo', 'lacinia', 'lacus',
  'laoreet', 'lectus', 'leo', 'libero', 'ligula', 'litora', 'luctus', 'maecenas',
  'massa', 'malesuada', 'mattis', 'mauris', 'metus', 'mi', 'molestie', 'montes',
  'morbi', 'mus', 'nam', 'nascetur', 'natoque', 'nec', 'neque', 'netus', 'nibh',
  'nisl', 'nostra', 'nunc', 'odio', 'orci', 'ornare', 'parturient', 'pellentesque',
  'penatibus', 'per', 'pharetra', 'phasellus', 'placerat', 'platea', 'porta',
  'porttitor', 'posuere', 'praesent', 'pretium', 'primis', 'proin', 'pulvinar',
  'purus', 'quam', 'ridiculus', 'risus', 'rutrum', 'sagittis', 'sapien',
  'scelerisque', 'sociis', 'sociosqu', 'sodales', 'sollicitudin', 'suscipit',
  'suspendisse', 'taciti', 'tellus', 'tempus', 'tincidunt', 'torquent', 'tortor',
  'tristique', 'turpis', 'ultrices', 'ultricies', 'urna', 'quisque', 'varius',
  'vehicula', 'vel', 'venenatis', 'vestibulum', 'vitae', 'vivamus', 'viverra',
  'volutpat', 'vulputate',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Return a random integer in [min, max] inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Pick one random element from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick n random words from LOREM_WORDS (with replacement).
 * @param {number} n
 * @returns {string[]}
 */
function pickWords(n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(pick(LOREM_WORDS));
  }
  return result;
}

// ─── PUBLIC GENERATORS ───────────────────────────────────────────────────────

/**
 * Generate a single sentence: 8–15 random words, capitalized first word, ends with '.'.
 * @returns {string}
 */
export function generateSentence() {
  const count = randInt(8, 15);
  const words = pickWords(count);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

/**
 * Generate a single paragraph of 4–8 sentences.
 * If isFirst is true, the first sentence is always the canonical Lorem ipsum opener.
 * @param {boolean} [isFirst=false]
 * @returns {string}
 */
export function generateParagraph(isFirst = false) {
  const count = randInt(4, 8);
  const sentences = [];

  if (isFirst) {
    sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
    for (let i = 1; i < count; i++) {
      sentences.push(generateSentence());
    }
  } else {
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence());
    }
  }

  return sentences.join(' ');
}

/**
 * Pick n random words from LOREM_WORDS joined by spaces.
 * @param {number} n
 * @returns {string}
 */
export function generateWords(n) {
  return pickWords(n).join(' ');
}

/**
 * Generate lorem ipsum text of the requested type and quantity.
 * @param {'paragraphs'|'sentences'|'words'} type
 * @param {number} quantity  1–100
 * @returns {string[]}
 *   - 'paragraphs': array of `quantity` paragraph strings
 *   - 'sentences':  array of `quantity` sentence strings
 *   - 'words':      array with 1 element containing `quantity` space-separated words
 */
export function generate(type, quantity) {
  const qty = Math.max(1, Math.min(100, Math.round(quantity)));

  if (type === 'paragraphs') {
    const result = [];
    for (let i = 0; i < qty; i++) {
      result.push(generateParagraph(i === 0));
    }
    return result;
  }

  if (type === 'sentences') {
    const result = [];
    for (let i = 0; i < qty; i++) {
      result.push(generateSentence());
    }
    return result;
  }

  // 'words'
  return [generateWords(qty)];
}

// ─── MOUNT ───────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Về trang chủ
        </a>
        <div class="tool-title-row" style="--tool-accent: var(--color-purple);">
          <div class="tool-icon">
            <i data-lucide="file-text"></i>
          </div>
          <div>
            <h1 class="tool-name">Lorem Ipsum Generator</h1>
            <p class="tool-tagline">Tạo văn bản giả Lorem Ipsum theo đoạn, câu hoặc từ</p>
          </div>
        </div>
      </div>

      <div class="tool-body">

        <!-- Controls -->
        <div class="tool-controls">

          <!-- Type selection -->
          <div class="li-control-group">
            <span class="li-label">Loại:</span>
            <label class="li-radio">
              <input type="radio" name="li-type" value="paragraphs" checked>
              <span>Đoạn văn</span>
            </label>
            <label class="li-radio">
              <input type="radio" name="li-type" value="sentences">
              <span>Câu</span>
            </label>
            <label class="li-radio">
              <input type="radio" name="li-type" value="words">
              <span>Từ</span>
            </label>
          </div>

          <!-- Quantity input -->
          <div class="li-control-group">
            <label class="li-label" for="li-quantity">Số lượng:</label>
            <input
              type="number"
              id="li-quantity"
              class="li-number-input"
              min="1"
              max="100"
              value="3"
            >
          </div>

          <!-- Generate button -->
          <button id="li-generate-btn" class="tool-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Tạo văn bản
          </button>
        </div>

        <!-- Output -->
        <div class="tool-output-wrap">
          <textarea
            id="li-output"
            class="li-textarea"
            readonly
            rows="12"
            placeholder="Nhấn 'Tạo văn bản' để tạo Lorem Ipsum…"
          ></textarea>
          <div class="li-output-actions">
            <button id="li-copy-btn" class="copy-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Sao chép
            </button>
          </div>
        </div>

      </div>
    </div>

    <style>
      .li-control-group {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      .li-label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-text-muted);
        white-space: nowrap;
      }
      .li-radio {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text);
        cursor: pointer;
        user-select: none;
      }
      .li-radio input[type="radio"] {
        accent-color: var(--color-purple);
        width: 15px;
        height: 15px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .li-number-input {
        width: 72px;
        padding: var(--space-2) var(--space-3);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.12);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        color: var(--color-text);
        text-align: center;
        outline: none;
        transition: border-color var(--transition-interactive);
      }
      .li-number-input:focus {
        border-color: var(--color-purple);
      }
      .tool-output-wrap {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        padding: var(--space-5);
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-xl);
      }
      .li-textarea {
        width: 100%;
        resize: vertical;
        padding: var(--space-4);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-lg);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--color-text);
        line-height: 1.75;
        outline: none;
        transition: border-color var(--transition-interactive);
        box-sizing: border-box;
      }
      .li-textarea:focus {
        border-color: oklch(from var(--color-purple) l c h / 0.5);
      }
      .li-textarea::placeholder {
        color: var(--color-text-muted);
        font-style: italic;
      }
      .li-output-actions {
        display: flex;
        justify-content: flex-end;
      }
    </style>
  `;

  // ── Wire up events ───────────────────────────────────────────────────────

  const generateBtn = container.querySelector('#li-generate-btn');
  const copyBtn     = container.querySelector('#li-copy-btn');
  const textarea    = container.querySelector('#li-output');
  const qtyInput    = container.querySelector('#li-quantity');

  function getType() {
    const checked = container.querySelector('input[name="li-type"]:checked');
    return checked ? checked.value : 'paragraphs';
  }

  function getQuantity() {
    const raw = parseInt(qtyInput.value, 10);
    if (isNaN(raw) || raw < 1) return 1;
    if (raw > 100) return 100;
    return raw;
  }

  generateBtn.addEventListener('click', () => {
    const type = getType();
    const qty  = getQuantity();
    const parts = generate(type, qty);

    // Paragraphs separated by blank line; sentences/words separated by newline
    const separator = type === 'paragraphs' ? '\n\n' : '\n';
    textarea.value = parts.join(separator);
  });

  copyBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) {
      showToast('Chưa có nội dung để sao chép.', 'error');
      return;
    }
    try {
      await copyToClipboard(text);
      copyBtn.classList.add('copied');
      copyBtn.querySelector('svg').outerHTML; // keep icon
      showToast('Đã sao chép vào clipboard!');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    } catch {
      showToast('Không thể sao chép. Vui lòng chọn và sao chép thủ công.', 'error');
    }
  });
}
