// router.js — hash-based SPA router for ToolHub
// Requirements: 3.1-3.6, 4.2, 13.1-13.7, 14.1-14.6, 15.1-15.6

/**
 * Initialize the hash-based router.
 * Reads the current hash on load, then listens for hashchange events.
 *
 * @param {HTMLElement} appEl  - The #app container element
 * @param {Object[]}    tools  - The TOOLS registry array from registry.js
 */
export function initRouter(appEl, tools) {
  function dispatch() {
    const hash = location.hash;
    const toolMatch = hash.match(/^#\/tools\/(.+)$/);
    if (toolMatch) {
      renderTool(appEl, toolMatch[1]);
    } else {
      renderHome(appEl, tools);
    }
  }

  window.addEventListener('hashchange', dispatch);
  dispatch(); // handle initial load
}

// ─── HOME VIEW ────────────────────────────────────────────────────────────────

/**
 * Generate the HTML for a single tool card.
 * @param {Object} t - A tool entry from the TOOLS registry
 * @returns {string}
 */
function buildCardHtml(t) {
  const tagsHtml = t.tags
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  return `
    <article
      class="tool-card${t.featured ? ' featured' : ''} fade-in"
      data-category="${t.category}"
      role="listitem"
      style="--card-accent: ${t.accent};"
    >
      <div class="card-header">
        <div class="card-icon" aria-hidden="true"><i data-lucide="${t.icon}"></i></div>
        <span class="card-badge">${t.badge}</span>
      </div>
      <h2 class="card-title">${t.name}</h2>
      <p class="card-desc">${t.description}</p>
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-footer">
        <span class="card-source">
          <i data-lucide="box" aria-hidden="true"></i>
          toolhub.local
        </span>
        <button
          class="open-btn"
          data-tool-id="${t.id}"
          aria-label="Mở ${t.name}"
        >
          Mở <i data-lucide="arrow-up-right" aria-hidden="true"></i>
        </button>
      </div>
    </article>`;
}

/**
 * Render the home page into appEl.
 * @param {HTMLElement} appEl
 * @param {Object[]}    tools
 */
function renderHome(appEl, tools) {
  const cardsHtml = tools.map(buildCardHtml).join('');

  appEl.innerHTML = `
    <!-- ══════════ HERO ══════════ -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-badge">
        <span class="badge-dot" aria-hidden="true"></span>
        v1.0 · Đang cập nhật thêm
      </div>
      <h1 id="hero-heading">
        Tất cả công cụ<br/>bạn cần <span class="accent">một nơi</span>
      </h1>
      <p class="hero-desc">
        Tổng hợp các công cụ tiện ích miễn phí — từ tạo tên, mật khẩu, văn bản đến lập trình. Không cần đăng ký, dùng ngay.
      </p>
      <div class="hero-stats" role="list">
        <div class="stat" role="listitem">
          <span class="stat-num" id="tool-count">${tools.length}</span>
          <span class="stat-label">Công cụ</span>
        </div>
        <div class="stat" role="listitem">
          <span class="stat-num">5</span>
          <span class="stat-label">Danh mục</span>
        </div>
        <div class="stat" role="listitem">
          <span class="stat-num">100%</span>
          <span class="stat-label">Miễn phí</span>
        </div>
      </div>
    </section>

    <!-- ══════════ FILTER BAR ══════════ -->
    <section class="filter-bar" aria-label="Lọc theo danh mục" id="tools">
      <button class="filter-btn active" data-filter="all">
        <i data-lucide="layout-grid"></i> Tất cả
      </button>
      <button class="filter-btn" data-filter="generate">
        <i data-lucide="sparkles"></i> Tạo nội dung
      </button>
      <button class="filter-btn" data-filter="security">
        <i data-lucide="shield"></i> Bảo mật
      </button>
      <button class="filter-btn" data-filter="dev">
        <i data-lucide="code-2"></i> Dev Tools
      </button>
      <button class="filter-btn" data-filter="text">
        <i data-lucide="type"></i> Văn bản
      </button>
      <button class="filter-btn" data-filter="image">
        <i data-lucide="image"></i> Hình ảnh
      </button>
    </section>

    <!-- ══════════ TOOLS GRID ══════════ -->
    <section class="tools-section" aria-label="Danh sách công cụ">
      <div class="section-label" aria-hidden="true">Công cụ nổi bật</div>
      <div class="tools-grid" id="tools-grid" role="list">
        ${cardsHtml}
        <!-- Empty state -->
        <div class="empty-state" id="empty-state" role="status" aria-live="polite">
          <i data-lucide="search-x"></i>
          <h3>Không tìm thấy công cụ</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
        </div>
      </div>
    </section>

    <!-- ══════════ CONTRIBUTE ══════════ -->
    <section class="contribute-section" id="contribute" aria-labelledby="contribute-heading">
      <div class="contribute-card">
        <div class="contribute-text">
          <h2 id="contribute-heading">Đóng góp công cụ mới?</h2>
          <p>Nếu bạn có ý tưởng hoặc muốn thêm công cụ mới vào ToolHub, hãy tạo một Pull Request hoặc mở Issue trên GitHub.</p>
        </div>
        <div class="contribute-actions">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary"
          >
            <i data-lucide="github"></i> GitHub
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost"
          >
            <i data-lucide="file-plus"></i> Mở Issue
          </a>
        </div>
      </div>
    </section>
  `;

  // Render lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Wire filter buttons ────────────────────────────────────────────────────
  const filterBtns = appEl.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAndSearch();
    });
  });

  // ── Wire search input (from header nav) ───────────────────────────────────
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    // Clear any previously attached listener by replacing with a fresh handler
    searchInput._routerHandler && searchInput.removeEventListener('input', searchInput._routerHandler);
    searchInput._routerHandler = () => filterAndSearch();
    searchInput.addEventListener('input', searchInput._routerHandler);
  }

  // ── Wire card open buttons ─────────────────────────────────────────────────
  const grid = appEl.querySelector('#tools-grid');
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-btn[data-tool-id]');
    if (btn) {
      location.hash = '#/tools/' + btn.dataset.toolId;
    }
  });

  /**
   * Filter and search cards based on current active filter and search query.
   * Shows/hides cards and toggles the empty state.
   */
  function filterAndSearch() {
    const activeFilter = (appEl.querySelector('.filter-btn.active') || { dataset: { filter: 'all' } }).dataset.filter;
    const query = (document.getElementById('search-input')?.value ?? '').toLowerCase().trim();

    const cards = appEl.querySelectorAll('.tool-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category ?? '';
      const matchesFilter = activeFilter === 'all' || category === activeFilter;

      let matchesSearch = true;
      if (query) {
        const title = (card.querySelector('.card-title')?.textContent ?? '').toLowerCase();
        const desc  = (card.querySelector('.card-desc')?.textContent ?? '').toLowerCase();
        const tags  = Array.from(card.querySelectorAll('.tag'))
          .map(t => t.textContent.toLowerCase())
          .join(' ');
        matchesSearch = title.includes(query) || desc.includes(query) || tags.includes(query);
      }

      const visible = matchesFilter && matchesSearch;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    // Toggle empty state
    const emptyState = appEl.querySelector('#empty-state');
    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  }
}

// ─── TOOL VIEW ────────────────────────────────────────────────────────────────

/**
 * Render a specific tool by dynamically importing its module.
 * @param {HTMLElement} appEl
 * @param {string}      id    - Tool id (kebab-case)
 */
async function renderTool(appEl, id) {
  // Show loading skeleton immediately
  appEl.innerHTML = `
    <div class="tool-view">
      <div class="tool-header">
        <a href="#/" class="back-btn">← Về trang chủ</a>
      </div>
      <div class="tool-body" style="padding:var(--space-20) 0;text-align:center;color:var(--color-text-muted)">
        Đang tải...
      </div>
    </div>
  `;

  try {
    const mod = await import('../tools/' + id + '/index.js');
    mod.mount(appEl);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (err) {
    console.error('[router] Failed to load tool:', id, err);
    appEl.innerHTML = `
      <div class="tool-view">
        <div class="tool-header">
          <a href="#/" class="back-btn">← Về trang chủ</a>
        </div>
        <div class="tool-body" style="padding:var(--space-20) 0;text-align:center;">
          <p style="color:var(--color-text-muted);margin-bottom:var(--space-4);">
            Công cụ không tìm thấy.
          </p>
          <a href="#/" class="btn-primary" style="display:inline-flex;align-items:center;gap:var(--space-2);">
            Về trang chủ
          </a>
        </div>
      </div>
    `;
  }
}
