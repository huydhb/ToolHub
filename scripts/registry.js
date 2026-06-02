/**
 * Tool Registry — single source of truth for all available tools.
 * Home page cards and navigation are generated dynamically from this array.
 *
 * @typedef {Object} ToolEntry
 * @property {string}   id          - Kebab-case identifier; matches tools/{id}/index.js path
 * @property {string}   name        - Display name
 * @property {string}   description - Short description shown on the tool card
 * @property {string}   category    - One of: generate | security | dev | text | image
 * @property {string}   badge       - Badge label (Vietnamese or English)
 * @property {string}   icon        - Lucide icon name
 * @property {string}   accent      - CSS color value for card accent
 * @property {string[]} tags        - Chip labels shown on the card
 * @property {boolean}  featured    - When true, the card spans 2 columns on the home grid
 */

export const TOOLS = [
  {
    id: 'vi-name-generator',
    name: 'Trình Tạo Tên Việt Nam',
    description: 'Tạo tên người Việt ngẫu nhiên — họ, tên đệm, tên — theo giới tính và phong cách. Hữu ích cho dev, game, hay đặt tên nhân vật sáng tác.',
    category: 'generate',
    badge: 'Tạo tên',
    icon: 'user-round-plus',
    accent: 'var(--color-primary)',
    tags: ['Tên Việt', 'Ngẫu nhiên', 'Trực tiếp'],
    featured: true,
  },
  {
    id: 'password-generator',
    name: 'Tạo Mật Khẩu Mạnh',
    description: 'Tạo mật khẩu ngẫu nhiên, an toàn với độ phức tạp tùy chỉnh. Tùy chỉnh độ dài, ký tự đặc biệt, số và chữ hoa. Không lưu trên server.',
    category: 'security',
    badge: 'Bảo mật',
    icon: 'key-round',
    accent: 'var(--color-blue)',
    tags: ['Password', 'Bảo mật', 'Miễn phí'],
    featured: false,
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Tạo văn bản giả Latin dùng để lấp đầy mockup, prototype UI. Chọn số đoạn, câu, hoặc từ tùy ý.',
    category: 'text',
    badge: 'Văn bản',
    icon: 'file-text',
    accent: 'var(--color-purple)',
    tags: ['Placeholder', 'Latin', 'Thiết kế'],
    featured: false,
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate và beautify JSON trực tuyến. Hỗ trợ minify, syntax highlighting và hiển thị lỗi cú pháp. Không cần cài đặt.',
    category: 'dev',
    badge: 'Dev Tools',
    icon: 'braces',
    accent: 'var(--color-gold)',
    tags: ['JSON', 'Format', 'Validate'],
    featured: false,
  },
  {
    id: 'uuid-ulid-generator',
    name: 'UUID / ULID Generator',
    description: 'Tạo UUID (v1, v4) và ULID ngay trên trình duyệt. Hữu ích cho database ID, primary key, hay API testing.',
    category: 'dev',
    badge: 'Dev Tools',
    icon: 'fingerprint',
    accent: 'var(--color-orange)',
    tags: ['UUID', 'ULID', 'Unique ID'],
    featured: false,
  },
  {
    id: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode và decode chuỗi Base64 nhanh chóng. Hỗ trợ văn bản UTF-8. Xử lý hoàn toàn trên trình duyệt, không gửi dữ liệu đi đâu.',
    category: 'dev',
    badge: 'Dev Tools',
    icon: 'binary',
    accent: 'var(--color-blue)',
    tags: ['Base64', 'Encode', 'Decode'],
    featured: false,
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Tạo bảng màu đẹp cho thiết kế UI/UX, branding. Nhấn Space để gen màu ngẫu nhiên, lock màu yêu thích, xuất CSS/HEX.',
    category: 'image',
    badge: 'Hình ảnh',
    icon: 'palette',
    accent: 'var(--color-purple)',
    tags: ['Màu sắc', 'Design', 'CSS'],
    featured: false,
  },
  {
    id: 'regex-tester',
    name: 'RegEx Tester',
    description: 'Test và debug Regular Expression trực tiếp trên trình duyệt với highlight matches, group capture và giải thích từng phần.',
    category: 'dev',
    badge: 'Dev Tools',
    icon: 'regex',
    accent: 'var(--color-error)',
    tags: ['RegEx', 'Pattern', 'Dev'],
    featured: false,
  },
];
