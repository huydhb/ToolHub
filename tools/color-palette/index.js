/**
 * Color Palette Generator
 * Tool: color-palette
 * Generates beautiful, cohesive color palettes, supports locking colors, exporting in various formats.
 */

import { copyToClipboard, showToast } from '../../scripts/utils.js';

// ─── UTILS & GENERATION ────────────────────────────────────────────────────────

/**
 * Generate a random color in HSL format.
 * Saturation: 50-90% (vibrant but not neon)
 * Lightness: 45-75% (pleasing and readable)
 */
function randomHslColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 25); // 60% to 85%
  const l = 50 + Math.floor(Math.random() * 20); // 50% to 70%
  return { h, s, l };
}

/** Convert HSL to HEX string. */
function hslToHex({ h, s, l }) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** Generate a cohesive palette based on a mode. */
function generatePalette(currentColors, mode = 'random') {
  // If all are locked, do nothing
  if (currentColors.every(c => c.locked)) return currentColors;

  // Find a base color (the first locked one, or a random new one)
  const baseIndex = currentColors.findIndex(c => c.locked);
  let baseColor;
  if (baseIndex !== -1) {
    baseColor = { ...currentColors[baseIndex] };
  } else {
    baseColor = randomHslColor();
  }

  return currentColors.map((color, index) => {
    if (color.locked) return color;

    let h = baseColor.h;
    let s = baseColor.s;
    let l = baseColor.l;

    if (mode === 'random') {
      const rand = randomHslColor();
      h = rand.h;
      s = rand.s;
      l = rand.l;
    } else if (mode === 'analogous') {
      // Step by 30 degrees
      h = (baseColor.h + (index - baseIndex) * 30 + 360) % 360;
      s = Math.max(40, Math.min(95, baseColor.s + (Math.random() * 10 - 5)));
      l = Math.max(40, Math.min(80, baseColor.l + (Math.random() * 10 - 5)));
    } else if (mode === 'monochromatic') {
      // Keep hue, change lightness and saturation
      s = Math.max(30, Math.min(95, baseColor.s - (index - baseIndex) * 10));
      l = Math.max(20, Math.min(90, 30 + index * 12));
    } else if (mode === 'complementary') {
      // Base and its opposite (+180) plus variations
      if (index % 2 === 0) {
        h = baseColor.h;
      } else {
        h = (baseColor.h + 180) % 360;
      }
      s = baseColor.s;
      l = Math.max(30, Math.min(85, baseColor.l + (index - 2) * 8));
    } else if (mode === 'triadic') {
      // 3 points on the color wheel (+0, +120, +240)
      const steps = [0, 120, 240, 40, 160];
      h = (baseColor.h + steps[index % 5]) % 360;
      s = baseColor.s;
      l = Math.max(35, Math.min(80, baseColor.l + (Math.random() * 10 - 5)));
    }

    return {
      h, s, l,
      hex: hslToHex({ h, s, l }),
      locked: false
    };
  });
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  // Initial colors setup
  let colors = Array.from({ length: 5 }, () => {
    const hsl = randomHslColor();
    return {
      ...hsl,
      hex: hslToHex(hsl),
      locked: false
    };
  });

  let currentMode = 'random';

  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn"><i data-lucide="arrow-left"></i> Về trang chủ</a>
        <div class="tool-title-row" style="--tool-accent: var(--color-purple);">
          <div class="tool-icon"><i data-lucide="palette"></i></div>
          <div>
            <h1 class="tool-name">Color Palette Generator</h1>
            <p class="tool-tagline">Tạo bảng màu đẹp, lock màu yêu thích và xuất mã màu sang nhiều định dạng</p>
          </div>
        </div>
      </div>

      <div class="tool-body">
        <!-- Controls -->
        <div class="tool-controls cp-controls">
          <div class="cp-control-group">
            <span class="cp-label">Kiểu phối:</span>
            <select id="cp-mode-select" class="cp-select" aria-label="Kiểu phối màu">
              <option value="random">Ngẫu nhiên (Random)</option>
              <option value="analogous">Tương đồng (Analogous)</option>
              <option value="monochromatic">Đơn sắc (Monochromatic)</option>
              <option value="complementary">Bổ túc (Complementary)</option>
              <option value="triadic">Tam giác (Triadic)</option>
            </select>
          </div>

          <div class="cp-action-btns">
            <button id="cp-generate-btn" class="tool-btn" type="button">
              <i data-lucide="refresh-cw"></i>
              Tạo màu (Space)
            </button>
            <button id="cp-export-btn" class="btn-ghost" type="button">
              <i data-lucide="download"></i>
              Xuất bảng màu
            </button>
          </div>
        </div>

        <!-- Color Palette Swatches -->
        <div class="cp-palette-container" id="cp-palette" role="list" aria-label="Bảng màu hiện tại">
          <!-- Rendered dynamically -->
        </div>

        <!-- Export Modal -->
        <div class="cp-modal-overlay" id="cp-export-modal" aria-hidden="true">
          <div class="cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-modal-title">
            <div class="cp-modal-header">
              <h2 id="cp-modal-title" class="cp-modal-heading">Xuất bảng màu</h2>
              <button id="cp-modal-close" class="cp-modal-close-btn" aria-label="Đóng">&times;</button>
            </div>
            <div class="cp-modal-body">
              <div class="cp-modal-tabs" role="tablist">
                <button class="cp-modal-tab active" role="tab" aria-selected="true" data-format="css">CSS Variables</button>
                <button class="cp-modal-tab" role="tab" aria-selected="false" data-format="tailwind">Tailwind</button>
                <button class="cp-modal-tab" role="tab" aria-selected="false" data-format="json">JSON</button>
                <button class="cp-modal-tab" role="tab" aria-selected="false" data-format="hex">HEX List</button>
              </div>
              <div class="cp-modal-content">
                <textarea id="cp-export-output" class="cp-textarea" readonly rows="8"></textarea>
              </div>
              <div class="cp-modal-footer">
                <button id="cp-modal-copy" class="tool-btn">
                  <i data-lucide="copy"></i> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .cp-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
      }
      .cp-control-group {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .cp-label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-text-muted);
      }
      .cp-select {
        padding: var(--space-2) var(--space-4);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.12);
        border-radius: var(--radius-md);
        color: var(--color-text);
        font-size: var(--text-sm);
        outline: none;
        cursor: pointer;
        transition: border-color var(--transition-interactive);
      }
      .cp-select:focus {
        border-color: var(--color-purple);
      }
      .cp-action-btns {
        display: flex;
        gap: var(--space-2);
      }
      .cp-palette-container {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--space-3);
        height: 380px;
        min-height: 250px;
      }
      @media (max-width: 768px) {
        .cp-palette-container {
          grid-template-columns: 1fr;
          height: auto;
          min-height: auto;
        }
        .cp-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .cp-select {
          width: 100%;
        }
      }
      .cp-swatch {
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-xl);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform var(--transition-interactive), box-shadow var(--transition-interactive);
        position: relative;
        min-height: 120px;
      }
      .cp-swatch:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      .cp-color-display {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: var(--space-4);
        position: relative;
        transition: background-color 0.25s ease;
      }
      .cp-swatch-actions {
        position: absolute;
        top: var(--space-2);
        right: var(--space-2);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        opacity: 0;
        transition: opacity var(--transition-interactive);
      }
      .cp-swatch:hover .cp-swatch-actions,
      .cp-swatch-actions:focus-within,
      .cp-lock-btn.locked {
        opacity: 1;
      }
      .cp-swatch-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: rgba(0, 0, 0, 0.4);
        color: white;
        display: grid;
        place-items: center;
        transition: background var(--transition-interactive), transform var(--transition-interactive);
      }
      .cp-swatch-btn:hover {
        background: rgba(0, 0, 0, 0.6);
        transform: scale(1.05);
      }
      .cp-lock-btn.locked {
        background: var(--color-purple);
        color: white;
        opacity: 1;
      }
      .cp-color-info {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        background: var(--color-surface);
        z-index: 2;
      }
      .cp-hex {
        font-family: var(--font-mono);
        font-size: var(--text-base);
        font-weight: 700;
        color: var(--color-text);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cp-hex:hover {
        color: var(--color-purple);
      }
      .cp-hex-icon {
        opacity: 0;
        transition: opacity var(--transition-interactive);
        font-size: 12px;
      }
      .cp-hex:hover .cp-hex-icon {
        opacity: 1;
      }
      .cp-hsl {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      /* Export Modal Styles */
      .cp-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .cp-modal-overlay.show {
        opacity: 1;
        pointer-events: auto;
      }
      .cp-modal {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-2xl);
        width: 100%;
        max-width: 500px;
        box-shadow: var(--shadow-lg);
        transform: scale(0.95);
        transition: transform 0.25s ease;
        padding: var(--space-6);
        box-sizing: border-box;
      }
      .cp-modal-overlay.show .cp-modal {
        transform: scale(1);
      }
      .cp-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);
      }
      .cp-modal-heading {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: 800;
        color: var(--color-text);
      }
      .cp-modal-close-btn {
        font-size: 24px;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: var(--space-1);
        line-height: 1;
      }
      .cp-modal-close-btn:hover {
        color: var(--color-text);
      }
      .cp-modal-tabs {
        display: flex;
        border-bottom: 1px solid var(--color-divider);
        margin-bottom: var(--space-4);
        gap: var(--space-1);
      }
      .cp-modal-tab {
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-text-muted);
        border-bottom: 2px solid transparent;
        transition: all var(--transition-interactive);
      }
      .cp-modal-tab.active {
        color: var(--color-purple);
        border-bottom-color: var(--color-purple);
      }
      .cp-textarea {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.12);
        border-radius: var(--radius-lg);
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-text);
        outline: none;
        resize: none;
        box-sizing: border-box;
        line-height: 1.5;
      }
      .cp-modal-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: var(--space-4);
      }
    </style>
  `;

  // ── ELEMENT REFS ──────────────────────────────────────────────────────────

  const paletteEl     = container.querySelector('#cp-palette');
  const generateBtn   = container.querySelector('#cp-generate-btn');
  const exportBtn     = container.querySelector('#cp-export-btn');
  const modeSelect    = container.querySelector('#cp-mode-select');

  // Modal elements
  const modalOverlay  = container.querySelector('#cp-export-modal');
  const modalClose    = container.querySelector('#cp-modal-close');
  const modalTabs     = container.querySelectorAll('.cp-modal-tab');
  const exportOutput  = container.querySelector('#cp-export-output');
  const modalCopyBtn  = container.querySelector('#cp-modal-copy');

  // ── CORE LOGIC ──────────────────────────────────────────────────────────────

  function renderSwatches() {
    paletteEl.innerHTML = '';
    colors.forEach((color, index) => {
      const swatch = document.createElement('article');
      swatch.className = 'cp-swatch';
      swatch.role = 'listitem';

      swatch.innerHTML = `
        <div class="cp-color-display" style="background-color: ${color.hex};">
          <div class="cp-swatch-actions">
            <button class="cp-swatch-btn cp-lock-btn ${color.locked ? 'locked' : ''}"
                    title="${color.locked ? 'Unlock color' : 'Lock color'}"
                    aria-label="${color.locked ? 'Mở khóa màu' : 'Khóa màu'}">
              <i data-lucide="${color.locked ? 'lock' : 'lock-open'}"></i>
            </button>
            <button class="cp-swatch-btn cp-copy-display-btn" title="Copy HEX code" aria-label="Sao chép mã màu">
              <i data-lucide="copy"></i>
            </button>
          </div>
        </div>
        <div class="cp-color-info">
          <div class="cp-hex" title="Click to copy HEX">
            <span>${color.hex}</span>
            <i data-lucide="copy" class="cp-hex-icon"></i>
          </div>
          <div class="cp-hsl">hsl(${color.h}, ${color.s}%, ${color.l}%)</div>
        </div>
      `;

      // Copy HEX action (clicking info box or copy button)
      const copyHdl = async () => {
        try {
          await copyToClipboard(color.hex);
          showToast(`Đã copy: ${color.hex}`);
        } catch {
          showToast('Không thể sao chép', 'error');
        }
      };

      swatch.querySelector('.cp-hex').addEventListener('click', copyHdl);
      swatch.querySelector('.cp-copy-display-btn').addEventListener('click', copyHdl);

      // Lock action
      swatch.querySelector('.cp-lock-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        color.locked = !color.locked;
        renderSwatches();
      });

      paletteEl.appendChild(swatch);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function handleGenerate() {
    colors = generatePalette(colors, currentMode);
    renderSwatches();
  }

  // ── EXPORTING FORMATS ───────────────────────────────────────────────────────

  function getFormattedOutput(format) {
    const hexes = colors.map(c => c.hex);
    if (format === 'css') {
      return `:root {\n` +
        colors.map((c, i) => `  --color-palette-${i + 1}: ${c.hex};`).join('\n') +
        `\n}`;
    }
    if (format === 'tailwind') {
      return `colors: {\n` +
        `  palette: {\n` +
        colors.map((c, i) => `    ${(i + 1) * 100}: '${c.hex}',`).join('\n') +
        `\n  }\n}`;
    }
    if (format === 'json') {
      return JSON.stringify({
        palette: colors.map((c, i) => ({
          name: `color-${i + 1}`,
          hex: c.hex,
          hsl: `hsl(${c.h}, ${c.s}%, ${c.l}%)`
        }))
      }, null, 2);
    }
    // 'hex' list
    return hexes.join('\n');
  }

  function updateModalContent(activeTab) {
    const format = activeTab.dataset.format;
    exportOutput.value = getFormattedOutput(format);
  }

  // ── EVENT WIRING ───────────────────────────────────────────────────────────

  generateBtn.addEventListener('click', handleGenerate);

  modeSelect.addEventListener('change', (e) => {
    currentMode = e.target.value;
    handleGenerate();
  });

  // Modal events
  exportBtn.addEventListener('click', () => {
    modalOverlay.classList.add('show');
    modalOverlay.setAttribute('aria-hidden', 'false');
    const activeTab = modalOverlay.querySelector('.cp-modal-tab.active');
    updateModalContent(activeTab);
  });

  const closeModal = () => {
    modalOverlay.classList.remove('show');
    modalOverlay.setAttribute('aria-hidden', 'true');
  };

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      updateModalContent(tab);
    });
  });

  modalCopyBtn.addEventListener('click', async () => {
    const code = exportOutput.value;
    try {
      await copyToClipboard(code);
      showToast('Đã copy bảng mã màu!');
      modalCopyBtn.classList.add('copied');
      setTimeout(() => modalCopyBtn.classList.remove('copied'), 1500);
    } catch {
      showToast('Không thể sao chép', 'error');
    }
  });

  // Keyboard Space listener for quick generation
  const spaceHandler = (e) => {
    // Only trigger if we are inside our hash route
    if (location.hash !== '#/tools/color-palette') return;
    // Don't trigger if typing in form controls or when modal is open
    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.tagName === 'SELECT' ||
      modalOverlay.classList.contains('show')
    ) {
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      handleGenerate();
    }
  };
  window.addEventListener('keydown', spaceHandler);

  // Initial render
  renderSwatches();
}
