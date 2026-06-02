/**
 * Vietnamese Name Generator
 * Tool: vi-name-generator
 * Generates random Vietnamese names by gender and style.
 */

import { copyToClipboard, showToast } from '../../scripts/utils.js';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SURNAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Trịnh', 'Đoàn', 'Hà',
  'Lâm', 'Tô', 'Đào', 'Cao', 'Nghiêm', 'Mai', 'Từ', 'Quách', 'Tống', 'Dư',
];

const MIDDLE_MALE = [
  'Văn', 'Đình', 'Hữu', 'Quốc', 'Minh', 'Thanh', 'Trung', 'Đức',
  'Công', 'Xuân', 'Ngọc', 'Tiến', 'Thái', 'Chí', 'Đăng', 'Gia', 'Hải',
];

const MIDDLE_FEMALE = [
  'Thị', 'Ngọc', 'Kim', 'Thu', 'Phương', 'Bảo', 'Thùy', 'Tuyết',
  'Cẩm', 'Thanh', 'Mỹ', 'Hồng', 'Hà', 'Lan',
];

const GIVEN_MALE_TRAD = [
  'Tuấn', 'Hùng', 'Dũng', 'Long', 'Nam', 'Tùng', 'Phúc', 'Cường', 'Thắng',
  'Bình', 'Sơn', 'Hưng', 'Quân',
];

const GIVEN_MALE_MOD = [
  'Khoa', 'Hiếu', 'Minh', 'Huy', 'Nhân', 'Khải', 'Phát', 'Bảo', 'Tín',
  'Thiện', 'Đạt', 'Lâm', 'Vũ',
];

const GIVEN_FEMALE_TRAD = [
  'Lan', 'Hoa', 'Nhung', 'Liên', 'Hương', 'Xuân', 'Bích', 'Nguyệt',
];

const GIVEN_FEMALE_MOD = [
  'Linh', 'Mai', 'Yến', 'Ngân', 'Trang', 'Nhi', 'Vy', 'Khanh', 'Thy',
  'Anh', 'Trúc', 'Thảo', 'Ngọc',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Pick a random element from an array. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── CORE LOGIC ───────────────────────────────────────────────────────────────

/**
 * Generate a random Vietnamese name.
 * @param {'all'|'male'|'female'} gender
 * @param {'random'|'traditional'|'modern'} style
 * @returns {{ fullName: string, surname: string, middle: string, given: string }}
 */
export function generateName(gender, style) {
  const surname = pick(SURNAMES);

  // Resolve effective gender when 'all' is selected
  const effectiveGender = gender === 'all'
    ? (Math.random() < 0.5 ? 'male' : 'female')
    : gender;

  const middle = effectiveGender === 'male' ? pick(MIDDLE_MALE) : pick(MIDDLE_FEMALE);

  // Resolve effective style when 'random' is selected
  const effectiveStyle = style === 'random'
    ? (Math.random() < 0.5 ? 'traditional' : 'modern')
    : style;

  let given;
  if (effectiveGender === 'male') {
    given = effectiveStyle === 'traditional' ? pick(GIVEN_MALE_TRAD) : pick(GIVEN_MALE_MOD);
  } else {
    given = effectiveStyle === 'traditional' ? pick(GIVEN_FEMALE_TRAD) : pick(GIVEN_FEMALE_MOD);
  }

  const fullName = `${surname} ${middle} ${given}`;
  return { fullName, surname, middle, given };
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn"><i data-lucide="arrow-left"></i> Về trang chủ</a>
        <div class="tool-title-row" style="--tool-accent: var(--color-primary);">
          <div class="tool-icon"><i data-lucide="user-round-plus"></i></div>
          <div>
            <h1 class="tool-name">Trình Tạo Tên Việt Nam</h1>
            <p class="tool-tagline">Tạo tên người Việt ngẫu nhiên theo giới tính và phong cách</p>
          </div>
        </div>
      </div>

      <div class="tool-body">
        <!-- Controls -->
        <div class="tool-controls">

          <!-- Gender -->
          <fieldset class="vi-name-fieldset">
            <legend class="vi-name-legend">Giới tính</legend>
            <div class="vi-name-radio-group">
              <label class="vi-name-radio-label">
                <input type="radio" name="vi-gender" value="all" checked>
                <span>Tất cả</span>
              </label>
              <label class="vi-name-radio-label">
                <input type="radio" name="vi-gender" value="male">
                <span>Nam</span>
              </label>
              <label class="vi-name-radio-label">
                <input type="radio" name="vi-gender" value="female">
                <span>Nữ</span>
              </label>
            </div>
          </fieldset>

          <!-- Style -->
          <fieldset class="vi-name-fieldset">
            <legend class="vi-name-legend">Phong cách</legend>
            <div class="vi-name-radio-group">
              <label class="vi-name-radio-label">
                <input type="radio" name="vi-style" value="random" checked>
                <span>Ngẫu nhiên</span>
              </label>
              <label class="vi-name-radio-label">
                <input type="radio" name="vi-style" value="traditional">
                <span>Truyền thống</span>
              </label>
              <label class="vi-name-radio-label">
                <input type="radio" name="vi-style" value="modern">
                <span>Hiện đại</span>
              </label>
            </div>
          </fieldset>

          <!-- Quantity -->
          <label class="vi-name-qty-label">
            <span class="vi-name-legend">Số lượng</span>
            <input
              id="vi-name-qty"
              type="number"
              min="1" max="20" value="5"
              class="vi-name-qty-input"
              aria-label="Số lượng tên cần tạo"
            >
          </label>

          <!-- Generate button -->
          <button id="vi-name-generate-btn" class="tool-btn" type="button">
            <i data-lucide="shuffle"></i>
            Tạo tên
          </button>
        </div>

        <!-- Output -->
        <div id="vi-name-output" class="vi-name-output" aria-live="polite" aria-label="Danh sách tên được tạo">
          <p class="vi-name-placeholder">Nhấn <strong>Tạo tên</strong> để bắt đầu.</p>
        </div>
      </div>
    </div>

    <style>
      .vi-name-fieldset {
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .vi-name-legend {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted);
        margin-bottom: var(--space-1);
        display: block;
      }
      .vi-name-radio-group {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      .vi-name-radio-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text);
        cursor: pointer;
        user-select: none;
      }
      .vi-name-radio-label input[type="radio"] {
        accent-color: var(--color-primary);
        width: 15px;
        height: 15px;
        cursor: pointer;
      }
      .vi-name-qty-label {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .vi-name-qty-input {
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
      .vi-name-qty-input::-webkit-inner-spin-button,
      .vi-name-qty-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
      .vi-name-qty-input:focus {
        outline: 2px solid oklch(from var(--color-primary) l c h / 0.5);
        outline-offset: 1px;
        border-color: var(--color-primary);
      }
      .vi-name-output {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        padding: var(--space-5);
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-xl);
        min-height: 120px;
      }
      .vi-name-placeholder {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin: auto;
        text-align: center;
      }
      .vi-name-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.07);
        border-radius: var(--radius-lg);
        transition: background var(--transition-interactive);
      }
      .vi-name-item:hover {
        background: var(--color-surface-dynamic);
      }
      .vi-name-text {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--color-text);
        letter-spacing: 0.01em;
      }
    </style>
  `;

  // ── Wire up events ──────────────────────────────────────────────────────────

  const generateBtn = container.querySelector('#vi-name-generate-btn');
  const outputEl    = container.querySelector('#vi-name-output');
  const qtyInput    = container.querySelector('#vi-name-qty');

  generateBtn.addEventListener('click', () => {
    const gender = container.querySelector('input[name="vi-gender"]:checked').value;
    const style  = container.querySelector('input[name="vi-style"]:checked').value;
    const qty    = Math.min(20, Math.max(1, parseInt(qtyInput.value, 10) || 5));

    // Clamp displayed value
    qtyInput.value = qty;

    const names = Array.from({ length: qty }, () => generateName(gender, style));

    outputEl.innerHTML = '';
    names.forEach(({ fullName }) => {
      const item = document.createElement('div');
      item.className = 'vi-name-item';
      item.innerHTML = `
        <span class="vi-name-text">${fullName}</span>
        <button class="copy-btn" type="button" aria-label="Sao chép ${fullName}">
          <i data-lucide="copy"></i>
          Sao chép
        </button>
      `;

      item.querySelector('.copy-btn').addEventListener('click', async () => {
        try {
          await copyToClipboard(fullName);
          showToast('Đã sao chép: ' + fullName);
          const btn = item.querySelector('.copy-btn');
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1500);
        } catch {
          showToast('Không thể sao chép', 'error');
        }
      });

      outputEl.appendChild(item);
    });

    // Re-render Lucide icons for the new content
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}
