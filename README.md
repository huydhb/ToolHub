<div align="center">

<br/>

<img src="https://img.shields.io/badge/version-1.0.0-4fa8b0?style=flat-square" alt="version"/>
<img src="https://img.shields.io/badge/build-zero--dependency-6daa45?style=flat-square" alt="zero dependency"/>
<img src="https://img.shields.io/badge/license-MIT-a86fdf?style=flat-square" alt="license"/>
<img src="https://img.shields.io/badge/tools-8-fdab43?style=flat-square" alt="tools count"/>

<br/><br/>

# 🔧 ToolHub

**Tổng hợp các công cụ tiện ích miễn phí, chạy hoàn toàn trên trình duyệt.**
Không cần đăng ký, không lưu dữ liệu, không gửi thông tin đi đâu cả.

<br/>

[Công cụ hiện có](#-công-cụ-hiện-có) · [Chạy local](#-chạy-local) · [Kiến trúc](#-kiến-trúc) · [Thêm tool mới](#-thêm-tool-mới) · [Tech Stack](#-tech-stack)

</div>

---

## 📦 Công cụ hiện có

| Biểu tượng | Tên công cụ | Danh mục | Mô tả |
|:-----------:|-------------|:--------:|-------|
| 👤 | **Trình Tạo Tên Việt Nam** | Tạo nội dung | Tạo tên người Việt ngẫu nhiên — họ, tên đệm, tên — theo giới tính và phong cách |
| 🔑 | **Tạo Mật Khẩu Mạnh** | Bảo mật | Mật khẩu ngẫu nhiên với `crypto.getRandomValues`, tùy chỉnh độ dài và ký tự |
| 📝 | **Lorem Ipsum Generator** | Văn bản | Sinh văn bản Latin placeholder theo đoạn / câu / từ |
| `{}` | **JSON Formatter** | Dev Tools | Format, minify, validate JSON với syntax highlighting |
| 🔡 | **UUID / ULID Generator** | Dev Tools | Tạo UUID v4, UUID v1 và ULID chuẩn RFC, hỗ trợ batch |
| 🔢 | **Base64 Encode / Decode** | Dev Tools | Encode/decode Base64 UTF-8 safe, swap input ↔ output |
| 🎨 | **Color Palette Generator** | Hình ảnh | Tạo bảng 5 màu, lock màu, xuất CSS / Tailwind / JSON |
| 🔍 | **RegEx Tester** | Dev Tools | Test regex live với highlight matches và capture groups |

---

## 🚀 Chạy local

Không cần build step hay package manager. Chỉ cần một static file server vì project dùng ES modules (`type="module"`).

```bash
# Python (có sẵn trên hầu hết máy)
python -m http.server 8080

# Node.js (nếu đã cài npx)
npx serve .

# VS Code — cài Live Server extension, sau đó click "Go Live"
```

Sau đó mở **`http://localhost:8080`** trên trình duyệt.

> [!WARNING]
> Mở trực tiếp `index.html` qua `file://` sẽ bị lỗi CORS do ES module dynamic import. Phải dùng HTTP server.

---

## 🗂️ Cấu trúc thư mục

```
ToolHub/
├── index.html                 # App shell — header, #app mount, footer
│
├── styles/
│   ├── tokens.css             # CSS custom properties (màu, spacing, typography)
│   ├── base.css               # Reset, html/body, focus styles
│   ├── components.css         # Shared UI: nav, cards, hero, filter-bar, toast
│   └── tools.css              # Tool-view layout: tool-header, back-btn, tool-body
│
├── scripts/
│   ├── app.js                 # Entry point: initTheme() + initRouter()
│   ├── registry.js            # TOOLS array — source of truth cho tất cả tool
│   ├── router.js              # Hash router: renderHome() + renderTool()
│   └── utils.js               # copyToClipboard, showToast, debounce, escapeHtml, initTheme
│
├── tools/
│   ├── vi-name-generator/     # index.js
│   ├── password-generator/    # index.js
│   ├── lorem-ipsum/           # index.js
│   ├── json-formatter/        # index.js
│   ├── uuid-ulid-generator/   # index.js
│   ├── base64/                # index.js
│   ├── color-palette/         # index.js 
│   └── regex-tester/          # index.js 
│
└── docs/
    └── architecture.md        # Tài liệu kiến trúc hệ thống chi tiết
```

---

## 🏗️ Kiến trúc

**Hash-based SPA router** — không cần server config, hoạt động trên mọi static host.

```
index.html
  └── scripts/app.js  (ES module entry point)
        ├── registry.js  →  TOOLS[]  (danh sách tool)
        ├── router.js    →  hashchange listener
        │     ├── hash ""  or "#/"         →  renderHome()   (trang chủ với grid cards)
        │     └── hash "#/tools/{id}"      →  import('../tools/{id}/index.js')
        │                                      → mod.mount(container)
        └── utils.js     →  shared helpers
```

Mỗi tool là một **ES module độc lập**, chỉ export một hàm duy nhất:

```js
// tools/my-tool/index.js
import { copyToClipboard, showToast } from '../../scripts/utils.js';

export function mount(container) {
  container.innerHTML = `<div class="tool-view">...</div>`;
  // attach event listeners
}
```

Router **lazy-load** module qua `import()` chỉ khi user điều hướng vào tool đó — trang chủ không tải code của bất kỳ tool nào.

📖 Xem thêm: [docs/architecture.md](./docs/architecture.md)

---

## ➕ Thêm tool mới

**Chỉ cần 2 bước:**

**Bước 1** — Tạo file `tools/{tool-id}/index.js` và export hàm `mount`:

```js
export function mount(container) {
  container.innerHTML = `<div class="tool-view"><!-- HTML tool --></div>`;
  // logic & event listeners
}
```

**Bước 2** — Thêm entry vào `scripts/registry.js`:

```js
{
  id: 'my-tool',
  name: 'Tên Hiển Thị',
  description: 'Mô tả ngắn về công cụ...',
  category: 'dev',           // generate | security | dev | text | image
  badge: 'Dev Tools',
  icon: 'terminal',          // tên icon từ lucide.dev
  accent: 'var(--color-gold)',
  tags: ['tag1', 'tag2'],
  featured: false,
}
```

Tool card và URL routing tự động được sinh ra — không cần sửa thêm file nào khác.

---

## 🛠️ Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| **Vanilla HTML / CSS / JS** | Core — zero dependencies, zero build step |
| **ES Modules** | Native `import/export`, lazy loading qua dynamic `import()` |
| **[Lucide Icons](https://lucide.dev)** | Icon library, loaded từ CDN |
| **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** | Font body — modern, clean, hỗ trợ tiếng Việt tốt |
| **[Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)** | Font display — geometric, đậm nét, phù hợp heading |
| **[JetBrains Mono](https://www.jetbrains.com/lp/mono/)** | Font mono — code, ID, hex values |
| **`crypto.getRandomValues()`** | Nguồn entropy an toàn cho password & UUID |
| **CSS `oklch()` + Custom Properties** | Design system với Dark/Light theme |

---

## 🌐 Browser Support

Yêu cầu trình duyệt hỗ trợ ES modules và `oklch()` color function:

| Trình duyệt | Phiên bản tối thiểu |
|-------------|:-------------------:|
| Chrome / Edge | 111+ |
| Firefox | 113+ |
| Safari | 16.4+ |

---

<div align="center">

**© 2026 ToolHub** · Tất cả công cụ miễn phí, không cần đăng ký · MIT License

</div>
