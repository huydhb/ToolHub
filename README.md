# ToolHub

Tổng hợp các công cụ tiện ích miễn phí, chạy hoàn toàn trên trình duyệt — không cần đăng ký, không gửi dữ liệu đi đâu.

## Công cụ hiện có

| Tool | Danh mục | Mô tả |
|------|----------|-------|
| Trình Tạo Tên Việt Nam | Tạo nội dung | Tạo tên người Việt ngẫu nhiên theo giới tính và phong cách |
| Tạo Mật Khẩu Mạnh | Bảo mật | Mật khẩu ngẫu nhiên với `crypto.getRandomValues`, tùy chỉnh độ dài và ký tự |
| Lorem Ipsum Generator | Văn bản | Sinh văn bản Latin placeholder theo đoạn / câu / từ |
| JSON Formatter | Dev Tools | Format, minify, validate JSON với syntax highlighting |
| UUID / ULID Generator | Dev Tools | Tạo UUID v4, UUID v1 và ULID chuẩn RFC |
| Base64 Encode / Decode | Dev Tools | Encode/decode Base64 UTF-8 safe, swap input↔output |
| Color Palette Generator | Hình ảnh | Tạo bảng 5 màu, lock màu, xuất CSS / Tailwind / JSON |
| RegEx Tester | Dev Tools | Test regex live với highlight matches và capture groups |

## Chạy local

Không cần build step hay package manager. Chỉ cần một static file server vì project dùng ES modules (`type="module"`).

```bash
# Python (có sẵn trên hầu hết máy)
python -m http.server 8080

# Node (nếu đã cài npx)
npx serve .

# VS Code: cài Live Server extension, click "Go Live"
```

Sau đó mở `http://localhost:8080` trên trình duyệt.

> **Lưu ý:** Mở trực tiếp `index.html` qua `file://` sẽ bị lỗi CORS do ES module dynamic import. Cần dùng HTTP server.

## Cấu trúc thư mục

```
ToolHub/
├── index.html              # App shell — header, #app mount point, footer
│
├── styles/
│   ├── tokens.css          # CSS custom properties (màu, spacing, typography)
│   ├── base.css            # Reset, html/body, focus styles
│   ├── components.css      # Shared UI: nav, cards, hero, filter-bar, toast
│   └── tools.css           # Tool-view layout: tool-header, back-btn, tool-body
│
├── scripts/
│   ├── app.js              # Entry point: initTheme() + initRouter()
│   ├── registry.js         # TOOLS array — source of truth cho tất cả tool
│   ├── router.js           # Hash router: renderHome() + renderTool()
│   └── utils.js            # copyToClipboard, showToast, debounce, escapeHtml, initTheme
│
└── tools/
    ├── vi-name-generator/index.js
    ├── password-generator/index.js
    ├── lorem-ipsum/index.js
    ├── json-formatter/index.js
    ├── uuid-ulid-generator/index.js
    ├── base64/index.js
    ├── color-palette/index.js
    └── regex-tester/index.js
```

## Kiến trúc

**Hash-based SPA router** — không cần server config, hoạt động trên `file://` nếu dùng static server.

```
index.html
  └── scripts/app.js (ES module)
        ├── registry.js  → TOOLS[]
        ├── router.js    → hashchange listener
        │     ├── hash ""  or "#/"          → renderHome()
        │     └── hash "#/tools/{id}"       → import('../tools/{id}/index.js')
        │                                      → mod.mount(container)
        └── utils.js     → shared helpers
```

Mỗi tool là một ES module độc lập, chỉ cần export một hàm:

```js
export function mount(container) {
  container.innerHTML = `...`;
  // attach event listeners
}
```

Router lazy-load tool qua `import()` chỉ khi user navigate vào tool đó.

## Thêm tool mới

1. Tạo file `tools/{tool-id}/index.js` và export `mount(container)`
2. Thêm entry vào `scripts/registry.js`:

```js
{
  id: 'my-tool',
  name: 'Tên hiển thị',
  description: 'Mô tả ngắn...',
  category: 'dev',          // generate | security | dev | text | image
  badge: 'Dev Tools',
  icon: 'lucide-icon-name',
  accent: 'var(--color-gold)',
  tags: ['tag1', 'tag2'],
  featured: false,
}
```

Tool card và navigation tự động được sinh ra từ registry, không cần sửa thêm file nào khác.

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — zero dependencies, zero build step
- **ES Modules** — native `import/export`, lazy loading qua dynamic `import()`
- **Lucide Icons** — loaded từ CDN
- **`crypto.getRandomValues()`** — cho password và UUID generation
- **CSS custom properties** — design system với dark/light theme

## Browser support

Yêu cầu trình duyệt hỗ trợ ES modules và `oklch()` color:

- Chrome 111+
- Firefox 113+
- Safari 16.4+
