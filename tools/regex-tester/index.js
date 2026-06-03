/**
 * RegEx Tester Tool
 * Tool: regex-tester
 * Tests live Regular Expressions, highlights matches, displays capture groups, features a regex cheat sheet.
 */

import { copyToClipboard, showToast, escapeHtml, debounce } from '../../scripts/utils.js';

// ─── CHEAT SHEET DATA ────────────────────────────────────────────────────────

const CHEAT_SHEET = [
  { char: '\\d', desc: 'Chữ số (0-9)', ex: '3' },
  { char: '\\w', desc: 'Ký tự chữ (a-z, A-Z, 0-9, _)', ex: 'a' },
  { char: '\\s', desc: 'Ký tự khoảng trắng', ex: 'space, tab' },
  { char: '.', desc: 'Bất kỳ ký tự nào trừ dòng mới', ex: 'a, 9, @' },
  { char: '*', desc: '0 hoặc nhiều lần lặp lại', ex: 'a* -> "", "a", "aaa"' },
  { char: '+', desc: '1 hoặc nhiều lần lặp lại', ex: 'a+ -> "a", "aaa"' },
  { char: '?', desc: '0 hoặc 1 lần lặp lại (optional)', ex: 'colou?r -> color, colour' },
  { char: '{n}', desc: 'Lặp lại chính xác n lần', ex: '\\d{4} -> 2026' },
  { char: '[abc]', desc: 'Bất kỳ ký tự nào trong nhóm', ex: '[a-z]' },
  { char: '[^abc]', desc: 'Bất kỳ ký tự nào KHÔNG trong nhóm', ex: '[^0-9]' },
  { char: '^', desc: 'Bắt đầu chuỗi', ex: '^Hello' },
  { char: '$', desc: 'Kết thúc chuỗi', ex: 'world$' },
  { char: '(x)', desc: 'Capture group (Nhóm chụp)', ex: '(\\d{2})' },
  { char: '(?:x)', desc: 'Non-capturing group', ex: '(?:https?)' },
  { char: '(?=x)', desc: 'Positive lookahead', ex: '\\d(?=px) -> 5 trong 5px' }
];

// ─── MOUNT ────────────────────────────────────────────────────────────────────

export function mount(container) {
  container.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn"><i data-lucide="arrow-left"></i> Về trang chủ</a>
        <div class="tool-title-row" style="--tool-accent: var(--color-error);">
          <div class="tool-icon"><i data-lucide="regex"></i></div>
          <div>
            <h1 class="tool-name">RegEx Tester</h1>
            <p class="tool-tagline">Kiểm tra biểu thức chính quy trực tiếp, hiển thị kết quả và capture groups</p>
          </div>
        </div>
      </div>

      <div class="tool-body">
        <div class="rt-grid">
          <!-- Main workspace: Inputs + Highlights -->
          <div class="rt-main">
            <!-- RegEx Input and Flags -->
            <div class="rt-pattern-row">
              <span class="rt-slash">/</span>
              <input type="text" id="rt-pattern" class="rt-pattern-input" placeholder="[a-zA-Z0-9]+..." value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" aria-label="Biểu thức RegEx">
              <span class="rt-slash">/</span>
              
              <!-- Flags checkboxes popover/row -->
              <div class="rt-flags-wrap">
                <input type="text" id="rt-flags-display" class="rt-flags-input" value="gi" readonly title="Click để chỉnh sửa flags">
                <div class="rt-flags-dropdown" id="rt-flags-dropdown">
                  <label class="rt-flag-label"><input type="checkbox" value="g" checked> <span>g (global)</span></label>
                  <label class="rt-flag-label"><input type="checkbox" value="i" checked> <span>i (case insensitive)</span></label>
                  <label class="rt-flag-label"><input type="checkbox" value="m"> <span>m (multiline)</span></label>
                  <label class="rt-flag-label"><input type="checkbox" value="s"> <span>s (dotAll)</span></label>
                  <label class="rt-flag-label"><input type="checkbox" value="u"> <span>u (unicode)</span></label>
                  <label class="rt-flag-label"><input type="checkbox" value="y"> <span>y (sticky)</span></label>
                </div>
              </div>

              <button id="rt-copy-regex-btn" class="copy-btn" title="Copy full regex /pattern/flags">
                <i data-lucide="copy"></i> Copy
              </button>
            </div>

            <!-- Error banner -->
            <div class="tool-error" id="rt-regex-error">
              <i data-lucide="alert-circle"></i>
              <span id="rt-regex-error-msg"></span>
            </div>

            <!-- Test String Input -->
            <div class="rt-textarea-container">
              <label class="rt-field-label" for="rt-text">Văn bản kiểm thử (Test String)</label>
              <textarea id="rt-text" class="rt-textarea" rows="6" placeholder="Nhập văn bản cần so khớp regex vào đây..." spellcheck="false">Mọi thông tin liên hệ xin gửi về admin@toolhub.vn hoặc support.team@gmail.com.
Sử dụng số hotline 0987-654-321 nếu khẩn cấp.
Chào mừng đến với ToolHub!</textarea>
            </div>

            <!-- Highlights output display -->
            <div class="rt-output-container">
              <label class="rt-field-label">Kết quả so khớp (Highlighted Matches)</label>
              <div id="rt-highlights" class="rt-highlights" aria-live="polite"></div>
            </div>

            <!-- Match statistics and capture groups -->
            <div class="rt-matches-info-container">
              <label class="rt-field-label">Thông tin so khớp (<span id="rt-match-count">0</span> matches)</label>
              <div id="rt-matches-list" class="rt-matches-list">
                <p class="rt-no-matches">Không tìm thấy kết quả phù hợp nào.</p>
              </div>
            </div>
          </div>

          <!-- Sidebar: Cheat Sheet -->
          <aside class="rt-sidebar">
            <div class="rt-sidebar-card">
              <h3 class="rt-sidebar-title">
                <i data-lucide="help-circle"></i>
                Bản tham khảo nhanh (Cheat Sheet)
              </h3>
              <div class="rt-cheat-sheet-grid">
                ${CHEAT_SHEET.map(item => `
                  <div class="rt-cheat-item">
                    <code class="rt-cheat-char">${escapeHtml(item.char)}</code>
                    <span class="rt-cheat-desc">${item.desc}</span>
                    <span class="rt-cheat-ex">${escapeHtml(item.ex)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <style>
      .rt-grid {
        display: grid;
        grid-template-columns: 3fr 1.2fr;
        gap: var(--space-6);
        align-items: start;
      }
      @media (max-width: 1024px) {
        .rt-grid {
          grid-template-columns: 1fr;
        }
      }
      .rt-main {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }
      .rt-pattern-row {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-3) var(--space-4);
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-xl);
      }
      .rt-slash {
        font-size: var(--text-lg);
        font-weight: 700;
        color: var(--color-text-faint);
        user-select: none;
      }
      .rt-pattern-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-text);
      }
      .rt-flags-wrap {
        position: relative;
        margin-right: var(--space-2);
      }
      .rt-flags-input {
        width: 48px;
        text-align: center;
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.12);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-error);
        cursor: pointer;
        padding: var(--space-1) 0;
        outline: none;
      }
      .rt-flags-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: var(--space-2);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-3);
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        z-index: 100;
        min-width: 160px;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-interactive);
      }
      .rt-flags-dropdown.show {
        opacity: 1;
        pointer-events: auto;
      }
      .rt-flag-label {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-xs);
        color: var(--color-text);
        cursor: pointer;
        user-select: none;
      }
      .rt-flag-label input {
        accent-color: var(--color-error);
        cursor: pointer;
      }
      .rt-field-label {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted);
        margin-bottom: var(--space-2);
        display: block;
      }
      .rt-textarea-container {
        display: flex;
        flex-direction: column;
      }
      .rt-textarea {
        width: 100%;
        box-sizing: border-box;
        padding: var(--space-4);
        font-size: var(--text-sm);
        font-family: var(--font-mono);
        color: var(--color-text);
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-lg);
        resize: vertical;
        outline: none;
        line-height: 1.6;
        transition: border-color var(--transition-interactive);
      }
      .rt-textarea:focus {
        border-color: var(--color-error);
      }
      .rt-output-container {
        display: flex;
        flex-direction: column;
      }
      .rt-highlights {
        min-height: 100px;
        padding: var(--space-4);
        background: var(--color-surface-offset);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-lg);
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-text);
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.6;
      }
      .rt-match-hl {
        background-color: oklch(from var(--color-error) l c h / 0.22);
        border-bottom: 2px solid var(--color-error);
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        padding: 0 1px;
      }
      .rt-match-hl:nth-of-type(even) {
        background-color: oklch(from var(--color-blue) l c h / 0.22);
        border-bottom-color: var(--color-blue);
      }
      .rt-matches-info-container {
        display: flex;
        flex-direction: column;
      }
      .rt-matches-list {
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-xl);
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        max-height: 300px;
        overflow-y: auto;
      }
      .rt-no-matches {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        text-align: center;
        padding: var(--space-3);
      }
      .rt-match-item {
        background: var(--color-surface-offset);
        border-radius: var(--radius-lg);
        padding: var(--space-3);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        border-left: 3px solid var(--color-error);
      }
      .rt-match-item:nth-of-type(even) {
        border-left-color: var(--color-blue);
      }
      .rt-match-header {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-text-muted);
      }
      .rt-match-val {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-text);
        word-break: break-all;
        background: var(--color-surface);
        padding: var(--space-2);
        border-radius: var(--radius-md);
      }
      .rt-groups-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        padding-left: var(--space-2);
      }
      .rt-group-item {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }
      .rt-group-item code {
        font-family: var(--font-mono);
        color: var(--color-text);
        background: var(--color-surface);
        padding: 1px 4px;
        border-radius: var(--radius-sm);
      }

      /* Sidebar styles */
      .rt-sidebar-card {
        background: var(--color-surface);
        border: 1px solid oklch(from var(--color-text) l c h / 0.08);
        border-radius: var(--radius-2xl);
        padding: var(--space-5);
      }
      .rt-sidebar-title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: 700;
        margin-bottom: var(--space-4);
      }
      .rt-sidebar-title svg {
        width: 18px;
        height: 18px;
        color: var(--color-error);
      }
      .rt-cheat-sheet-grid {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .rt-cheat-item {
        display: grid;
        grid-template-columns: 1.5fr 3fr 1.5fr;
        gap: var(--space-2);
        align-items: center;
        padding-bottom: var(--space-2);
        border-bottom: 1px solid var(--color-divider);
      }
      .rt-cheat-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .rt-cheat-char {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-error);
        font-weight: bold;
      }
      .rt-cheat-desc {
        font-size: var(--text-xs);
        color: var(--color-text);
      }
      .rt-cheat-ex {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        text-align: right;
      }
    </style>
  `;

  // ── ELEMENT REFS ──────────────────────────────────────────────────────────

  const patternInput    = container.querySelector('#rt-pattern');
  const flagsInput      = container.querySelector('#rt-flags-display');
  const flagsDropdown   = container.querySelector('#rt-flags-dropdown');
  const textInput       = container.querySelector('#rt-text');
  const highlightsEl    = container.querySelector('#rt-highlights');
  const matchCountEl    = container.querySelector('#rt-match-count');
  const matchesListEl   = container.querySelector('#rt-matches-list');
  const errorEl         = container.querySelector('#rt-regex-error');
  const errorMsgEl      = container.querySelector('#rt-regex-error-msg');
  const copyRegexBtn    = container.querySelector('#rt-copy-regex-btn');

  // ── CORE LOGIC ──────────────────────────────────────────────────────────────

  function getFlags() {
    return Array.from(flagsDropdown.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.value)
      .join('');
  }

  function syncFlagsDisplay() {
    flagsInput.value = getFlags();
  }

  function processRegex() {
    const pattern = patternInput.value;
    const flags = getFlags();
    const text = textInput.value;

    // Reset UI
    errorEl.classList.remove('show');
    errorMsgEl.textContent = '';
    highlightsEl.innerHTML = escapeHtml(text);
    matchCountEl.textContent = '0';
    matchesListEl.innerHTML = '<p class="rt-no-matches">Không tìm thấy kết quả phù hợp nào.</p>';

    if (!pattern) return;

    try {
      const regex = new RegExp(pattern, flags);
      const isGlobal = flags.includes('g');
      
      let matches = [];
      if (isGlobal) {
        let match;
        // Prevent infinite loops for zero-width assertions (e.g. ^ or $)
        let lastIndex = -1;
        while ((match = regex.exec(text)) !== null) {
          if (regex.lastIndex === lastIndex) {
            regex.lastIndex++;
          }
          lastIndex = regex.lastIndex;
          matches.push(match);
        }
      } else {
        const match = regex.exec(text);
        if (match) matches.push(match);
      }

      const matchCount = matches.length;
      matchCountEl.textContent = matchCount.toString();

      if (matchCount > 0) {
        // 1. Render Highlights
        // Since we need to mark matches sequentially, sort matches by index ascending
        // (already naturally sorted by exec unless custom logic is used)
        let htmlContent = '';
        let lastIndex = 0;

        matches.forEach((match, index) => {
          const startIndex = match.index;
          const matchText = match[0];
          const endIndex = startIndex + matchText.length;

          // Append text before match
          htmlContent += escapeHtml(text.slice(lastIndex, startIndex));
          // Append highlighted match
          htmlContent += `<span class="rt-match-hl">${escapeHtml(matchText)}</span>`;
          lastIndex = endIndex;
        });

        htmlContent += escapeHtml(text.slice(lastIndex));
        highlightsEl.innerHTML = htmlContent;

        // 2. Render Matches Sidebar/Details list
        matchesListEl.innerHTML = '';
        matches.forEach((match, i) => {
          const matchItem = document.createElement('div');
          matchItem.className = 'rt-match-item';

          // Build group capture info
          let groupsHtml = '';
          if (match.length > 1) {
            groupsHtml = '<div class="rt-groups-list">';
            for (let g = 1; g < match.length; g++) {
              const val = match[g] !== undefined ? `"${match[g]}"` : 'undefined';
              groupsHtml += `
                <div class="rt-group-item">
                  Group ${g}: <code>${escapeHtml(val)}</code>
                </div>`;
            }
            // Check for named groups
            if (match.groups) {
              Object.entries(match.groups).forEach(([name, val]) => {
                const groupVal = val !== undefined ? `"${val}"` : 'undefined';
                groupsHtml += `
                  <div class="rt-group-item">
                    Group (?&lt;${escapeHtml(name)}&gt;): <code>${escapeHtml(groupVal)}</code>
                  </div>`;
              });
            }
            groupsHtml += '</div>';
          }

          matchItem.innerHTML = `
            <div class="rt-match-header">
              <span>Match #${i + 1}</span>
              <span>Vị trí: ${match.index} - ${match.index + match[0].length}</span>
            </div>
            <div class="rt-match-val">${escapeHtml(match[0])}</div>
            ${groupsHtml}
          `;
          matchesListEl.appendChild(matchItem);
        });
      }
    } catch (e) {
      errorMsgEl.textContent = e.message;
      errorEl.classList.add('show');
    }
  }

  const debouncedProcess = debounce(processRegex, 200);

  // ── EVENT WIRING ───────────────────────────────────────────────────────────

  // Live input handlers
  patternInput.addEventListener('input', debouncedProcess);
  textInput.addEventListener('input', debouncedProcess);

  // Flags popover controls
  flagsInput.addEventListener('click', (e) => {
    e.stopPropagation();
    flagsDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!flagsDropdown.contains(e.target) && e.target !== flagsInput) {
      flagsDropdown.classList.remove('show');
    }
  });

  flagsDropdown.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      syncFlagsDisplay();
      processRegex();
    });
  });

  // Copy whole regex button
  copyRegexBtn.addEventListener('click', async () => {
    const pattern = patternInput.value;
    const flags = getFlags();
    if (!pattern) return;
    
    const fullRegex = `/${pattern}/${flags}`;
    try {
      await copyToClipboard(fullRegex);
      showToast('Đã copy regex: ' + fullRegex);
      copyRegexBtn.classList.add('copied');
      setTimeout(() => copyRegexBtn.classList.remove('copied'), 1500);
    } catch {
      showToast('Không thể sao chép', 'error');
    }
  });

  // Initialize
  syncFlagsDisplay();
  processRegex();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
