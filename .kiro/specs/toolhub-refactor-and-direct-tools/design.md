# Design Document: ToolHub Refactor & Direct Tools

## Overview

ToolHub is being refactored from a single-file link aggregator (`toolhub.html`) into a proper multi-file static web application where every tool is implemented natively in the browser. The architecture is intentionally simple: pure HTML, CSS, and vanilla JavaScript with no build tooling, no package manager, and no framework. Everything runs directly from `file://` or a static HTTP server.

The key architectural challenge is enabling SPA-like navigation (switching between tools without a full page reload) without a bundler or module system. This is solved with a hash-based router and ES module imports where supported, with a fallback to classic script loading.

---

## Architecture

### High-Level Flow

```
index.html
  ├── <link> styles/tokens.css
  ├── <link> styles/base.css
  ├── <link> styles/components.css
  │
  └── <script type="module"> scripts/app.js
        ├── imports scripts/registry.js   → tool definitions
        ├── imports scripts/router.js     → hash-based routing
        └── imports scripts/utils.js      → clipboard, theme, etc.

On route change (hashchange):
  router.js reads window.location.hash
    ├── hash == "" or "#/"        → render home view (tool cards)
    └── hash == "#/tools/{id}"   → dynamic import tools/{id}/index.js
                                     → call tool.mount(container)
```

### Why Hash Routing

- Works on `file://` without a server (no 404 on refresh)
- No server configuration needed for a static host
- Browser back/forward naturally triggers `hashchange`
- Deep links like `index.html#/tools/password-generator` work immediately

### Module Loading Strategy

All core scripts use `<script type="module">` so ES6 imports work natively in modern browsers (Chrome 61+, Firefox 60+, Safari 10.1+). Tool modules are loaded via `import()` (dynamic import) only when the user navigates to that tool — this achieves lazy loading without a bundler.

```
index.html loads scripts/app.js as a module
app.js statically imports registry.js, router.js, utils.js
router.js does: const mod = await import(`../tools/${id}/index.js`)
```

No IE11 support is required since the current design already uses `oklch()`, `animation-timeline`, and other modern CSS.

---

## File & Directory Structure

```
ToolHub/
├── index.html                   ← App shell (header, nav, #app container, footer)
│
├── styles/
│   ├── tokens.css               ← All CSS custom properties (colors, spacing, type, radii)
│   ├── base.css                 ← Reset, html/body, skip link, focus styles
│   ├── components.css           ← Shared UI: cards, buttons, badges, tool layout
│   └── tools.css                ← Tool-specific layout helpers (tool-header, tool-body, etc.)
│
├── scripts/
│   ├── app.js                   ← Entry point: init theme, init router, wire up events
│   ├── registry.js              ← TOOLS array with tool metadata
│   ├── router.js                ← Hash router: parse hash, render home or tool view
│   └── utils.js                 ← copyToClipboard(), showToast(), debounce()
│
└── tools/
    ├── vi-name-generator/
    │   └── index.js
    ├── password-generator/
    │   └── index.js
    ├── lorem-ipsum/
    │   └── index.js
    ├── json-formatter/
    │   └── index.js
    ├── uuid-ulid-generator/
    │   └── index.js
    ├── base64/
    │   └── index.js
    ├── color-palette/
    │   └── index.js
    └── regex-tester/
        └── index.js
```

> Tool-specific CSS is written as `<style>` tags injected by the tool's `mount()` function, or as a `style.css` file loaded via a `<link>` injected at mount time. Either approach keeps styles scoped to the tool. For simplicity, inline styles via injected `<style>` tags are the primary approach.

---

## Components and Interfaces

### index.html — App Shell

`index.html` contains only structural HTML that never changes: the sticky header, the `<div id="app">` mount point, and the footer. No tool-specific markup lives here.

```html
<body>
  <a href="#main" class="skip-link">…</a>
  <header>…nav with logo, search, theme toggle…</header>
  <main id="main">
    <div id="app"><!-- router renders here --></div>
  </main>
  <footer>…</footer>
  <div id="toast" aria-live="polite" aria-atomic="true"></div>
  <script type="module" src="scripts/app.js"></script>
</body>
```

### scripts/registry.js — Tool Registry

Exports a `TOOLS` array. Each entry is a plain object:

```js
export const TOOLS = [
  {
    id: 'vi-name-generator',       // matches tools/{id}/index.js path
    name: 'Trình Tạo Tên Việt Nam',
    description: 'Tạo tên người Việt ngẫu nhiên…',
    category: 'generate',          // all | generate | security | dev | text | image
    badge: 'Tạo tên',
    icon: 'user-round-plus',       // Lucide icon name
    accent: 'var(--color-primary)',
    tags: ['Tên Việt', 'Ngẫu nhiên', 'Open Source'],
    featured: true,                // spans 2 columns on home
  },
  {
    id: 'password-generator',
    name: 'Tạo Mật Khẩu Mạnh',
    description: 'Tạo mật khẩu ngẫu nhiên, an toàn…',
    category: 'security',
    badge: 'Bảo mật',
    icon: 'key-round',
    accent: 'var(--color-blue)',
    tags: ['Password', 'Bảo mật', 'Miễn phí'],
    featured: false,
  },
  // … one entry per tool
];
```

This is the single source of truth. Home page cards and navigation are generated from this array.

### scripts/router.js — Hash Router

```js
// Public API
export function initRouter(appEl, tools) { … }
// Internals
function navigate(hash) { … }      // parse hash, dispatch render
function renderHome(appEl, tools) { … }  // build tool cards HTML
async function renderTool(appEl, id) { … }  // dynamic import + mount
```

**`renderHome(appEl, tools)`**: Generates the hero section and tools grid HTML from the `TOOLS` registry, injects it into `#app`, wires filter buttons and search, then calls `lucide.createIcons()`.

**`renderTool(appEl, id)`**: 
1. Sets `appEl.innerHTML` to a loading skeleton
2. Does `const mod = await import(../tools/${id}/index.js)`
3. Calls `mod.mount(appEl)`
4. Calls `lucide.createIcons()`

**Tool Module Contract**: Every `tools/{id}/index.js` must export a `mount(container)` function:
```js
export function mount(container) {
  container.innerHTML = `<div class="tool-view">…</div>`;
  // attach event listeners
  // return nothing (or a cleanup fn — optional for now)
}
```

### scripts/utils.js — Utilities

```js
export async function copyToClipboard(text) { … }  // navigator.clipboard with fallback
export function showToast(message, type = 'success') { … }  // 2s auto-dismiss
export function debounce(fn, ms) { … }
export function escapeHtml(str) { … }             // for safe innerHTML injection
```

### scripts/app.js — Entry Point

```js
import { TOOLS } from './registry.js';
import { initRouter } from './router.js';
import { initTheme } from './utils.js';

initTheme();   // read localStorage / system pref, set data-theme
initRouter(document.getElementById('app'), TOOLS);
```

### Tool View Layout (Shared HTML Pattern)

Every tool renders into a consistent wrapper:

```html
<div class="tool-view">
  <div class="tool-header">
    <a href="#/" class="back-btn">← Về trang chủ</a>
    <div class="tool-title-row">
      <div class="tool-icon"><!-- lucide icon --></div>
      <div>
        <h1 class="tool-name">Tool Name</h1>
        <p class="tool-tagline">Short description</p>
      </div>
    </div>
  </div>
  <div class="tool-body">
    <!-- tool-specific controls and output -->
  </div>
</div>
```

These `.tool-view`, `.tool-header`, `.tool-body` classes live in `styles/tools.css`.

---

## Data Models

### Tool Registry Entry

```ts
interface ToolEntry {
  id: string;           // kebab-case, matches directory name
  name: string;         // display name (Vietnamese)
  description: string;  // card description
  category: 'generate' | 'security' | 'dev' | 'text' | 'image';
  badge: string;        // badge label (Vietnamese)
  icon: string;         // Lucide icon name
  accent: string;       // CSS color value
  tags: string[];       // chip labels
  featured?: boolean;   // spans 2 columns
}
```

### Router State

The router is stateless beyond reading `window.location.hash`. No state object is needed — the DOM is the state.

### Per-Tool State

Each tool manages its own state in local JS variables within the closure created by `mount()`. No global state store is needed.

---

## Individual Tool Designs

### Tool 1: Vietnamese Name Generator (`vi-name-generator`)

**UI Layout**:
```
[Controls row]  Gender: (● Tất cả  ○ Nam  ○ Nữ)    Style: (● Ngẫu nhiên  ○ Truyền thống  ○ Hiện đại)
                Quantity: [1–20 number input]         [Tạo tên] button

[Output area]
  ┌─────────────────────────────────────┐
  │  Nguyễn Minh Tuấn                   │  [Copy]
  │  Trần Thị Lan                       │  [Copy]
  └─────────────────────────────────────┘
```

**Data**: Hardcoded arrays inside the module:
- `SURNAMES`: ~30 common Vietnamese surnames (Nguyễn, Trần, Lê, Phạm, Hoàng, Huỳnh, Phan, Vũ, Võ, Đặng, Bùi, Đỗ, Hồ, Ngô, Dương, Lý, …)
- `MIDDLE_MALE`: middle names suitable for males (Văn, Đình, Hữu, Quốc, Minh, Thanh, Trung, Đức, …)
- `MIDDLE_FEMALE`: middle names suitable for females (Thị, Ngọc, Kim, Thu, Phương, Bảo, …)
- `GIVEN_MALE`: given names for males (Tuấn, Hùng, Dũng, Khoa, Hiếu, Long, Nam, Tùng, …)
- `GIVEN_FEMALE`: given names for females (Lan, Hoa, Linh, Mai, Yến, Ngân, Trang, Hương, …)

**Logic**: `generateName(gender, style)` → picks randomly from arrays, applies style filter (traditional prefers classical names, modern prefers contemporary ones).

---

### Tool 2: Password Generator (`password-generator`)

**UI Layout**:
```
Password output: [••••••••••••••••••]  [👁] [Copy]
Strength meter:  [████████░░] Strong

Length: 16  [————●————————] 8 ←→ 128

☑ Uppercase (A-Z)   ☑ Lowercase (a-z)
☑ Numbers (0-9)     ☑ Symbols (!@#$…)

[Tạo mật khẩu]
```

**Logic**:
- Uses `crypto.getRandomValues()` for cryptographic randomness
- Strength: weak (< 8 or 1 charset), medium (8–12 or 2 charsets), strong (12+ and 3+ charsets)
- Always includes at least one character from each selected charset (shuffle to avoid predictable positions)

---

### Tool 3: Lorem Ipsum Generator (`lorem-ipsum`)

**UI Layout**:
```
Type: (● Đoạn văn  ○ Câu  ○ Từ)    Quantity: [3]    [Tạo văn bản]

[Output textarea — scrollable, read-only]
                                               [Copy]
```

**Logic**:
- Internal corpus: the full classical Lorem Ipsum word bank (~200 distinct Latin words)
- `generateParagraph()`: picks 4–8 sentences, each 8–15 words
- `generateSentence()`: picks 8–15 words, capitalizes first, ends with `.`
- `generateWords(n)`: picks n random words from corpus
- First paragraph always starts with the canonical "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

---

### Tool 4: JSON Formatter (`json-formatter`)

**UI Layout**:
```
[Input area — editable, line-numbered]    [Output area — read-only, syntax-highlighted]

Indent:  (● 2 spaces  ○ 4 spaces  ○ Tab)

[Format]  [Minify]  [Clear]              [Copy output]

Error banner (hidden by default): ⚠ SyntaxError: Unexpected token at line 3
```

**Logic**:
- `JSON.parse()` for validation
- `JSON.stringify(obj, null, indent)` for formatting
- Syntax highlighting: regex-based colorization applied to the formatted string (strings in green, numbers in blue, keys in teal, booleans/null in orange) — output is injected as HTML into a `<pre>` with `escapeHtml` applied first
- Line numbers: CSS counter on `<pre>` lines via `::before` pseudo-element on each line `<span>`

---

### Tool 5: UUID / ULID Generator (`uuid-ulid-generator`)

**UI Layout**:
```
Type: (● UUID v4  ○ UUID v1 (time-based)  ○ ULID)
Quantity: [1–100]

[Tạo ID]

┌────────────────────────────────────────────┐
│  550e8400-e29b-41d4-a716-446655440000  [Copy] │
│  01ARZ3NDEKTSV4RRFFQ69G5FAV         [Copy]   │
└────────────────────────────────────────────┘

[Copy all]
```

**Logic**:
- **UUID v4**: `crypto.getRandomValues(new Uint8Array(16))`, set version bits (4) and variant bits (8,9,a,b), format as `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- **UUID v1 (simplified)**: timestamp-based, uses `Date.now()` + random node component; note: not a true RFC 4122 v1 (no MAC address), but a reasonable approximation
- **ULID**: 48-bit millisecond timestamp (10 chars Crockford Base32) + 80-bit cryptographic random (16 chars Base32)

---

### Tool 6: Base64 Encoder/Decoder (`base64`)

**UI Layout**:
```
Mode: (● Encode  ○ Decode)

[Input textarea]          [⇄ Swap]          [Output textarea — read-only]

[Encode / Decode]                            [Copy output]

Error (hidden): ⚠ Invalid Base64 string
```

**Logic**:
- **Encode**: `btoa(unescape(encodeURIComponent(input)))` — handles UTF-8 correctly
- **Decode**: `decodeURIComponent(escape(atob(input)))` — reverses the above; wrapped in try/catch for invalid input
- **Swap**: copies output back to input, toggles mode
- Live encoding on input (debounced 300ms)

---

### Tool 7: Color Palette Generator (`color-palette`)

**UI Layout**:
```
[Color swatch 1]  [Color swatch 2]  [Color swatch 3]  [Color swatch 4]  [Color swatch 5]
  #2EC4B6          #E71D36           #FF9F1C           #FFBF69           #CBF3F0
  RGB / HSL        🔒 Lock           [color picker]
                                                      [Space / Tạo mới]

Export: [CSS Variables]  [Tailwind Config]  [JSON]
```

**Each swatch**:
- Full-height colored block with overlaid HEX code
- Lock button (🔒/🔓) to pin the color
- Clicking the swatch copies HEX to clipboard
- Hovering shows RGB and HSL values

**Logic**:
- `generateColor()`: `hsl(random*360, 55%–85%, 40%–65%)` — saturated, readable colors
- `generatePalette(lockedColors)`: regenerates unlocked slots, keeps locked slots
- Spacebar shortcut: `document.addEventListener('keydown', e => e.key === ' ' && generate())`
- CSS export: `--color-1: #2EC4B6;\n--color-2: #E71D36;\n…`
- Tailwind export: `colors: { palette: { 1: '#2EC4B6', … } }`

---

### Tool 8: RegEx Tester (`regex-tester`)

**UI Layout**:
```
Pattern: [/              /]  ☑ g  ☑ i  ☐ m  ☐ s

Test string:
┌──────────────────────────────────────────┐
│ The quick brown fox jumps over the lazy  │
│ dog. The fox is very quick.              │
└──────────────────────────────────────────┘

Matches: 2 found
┌──────────────────────────────────────────┐
│ The ⟨quick⟩ brown fox…  ← highlighted   │
└──────────────────────────────────────────┘

Capture groups:
  Group 1: "quick", "quick"

Examples: [Email]  [URL]  [Phone (VN)]  [IPv4]
```

**Logic**:
- On any input change (debounced 150ms):
  1. Build `RegExp(pattern, flags)` inside try/catch
  2. If invalid → show error, clear highlights
  3. If valid → `[...str.matchAll(rx)]` → build highlighted HTML using `escapeHtml` + `<mark>` wraps
- Capture groups: iterate `match.slice(1)` across all matches
- Highlight rendering: walk through the test string, wrap each match range in `<mark class="rx-match">`, escape everything else

---

## Correctness Properties

This feature is primarily a UI refactoring and a collection of browser-based tools. The tools themselves involve data transformation logic (encoding, formatting, generating) that is amenable to property-based testing.

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Base64 round-trip

*For any* UTF-8 string, encoding it to Base64 and then decoding the result should produce the original string.

**Validates: Requirements 10.3, 10.4, 10.8**

### Property 2: Password always satisfies its constraints

*For any* combination of selected character types and any length between 8 and 128, the generated password should have exactly the requested length and contain at least one character from each selected type.

**Validates: Requirements 6.3, 6.8**

### Property 3: JSON formatter round-trip

*For any* valid JSON value (object, array, string, number, boolean, null), formatting it with `JSON.stringify` and then parsing the result with `JSON.parse` should produce a value deeply equal to the original.

**Validates: Requirements 8.3, 8.4**

### Property 4: UUID v4 structural validity

*For any* generated UUID v4, the string should match the pattern `xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx` (RFC 4122 version and variant bits set correctly).

**Validates: Requirements 9.2, 9.3**

### Property 5: ULID monotonically increases with time

*For any* two ULIDs generated in sequence (at least 1ms apart), the lexicographic order of the strings should match the chronological order of their generation.

**Validates: Requirements 9.4**

### Property 6: RegEx match count is consistent

*For any* valid regex pattern with the global flag and any test string, the number of highlighted matches shown in the UI should equal `[...str.matchAll(rx)].length`.

**Validates: Requirements 12.4, 12.5**

### Property 7: Lorem Ipsum paragraph count

*For any* quantity n (1–100), generating n paragraphs should return exactly n paragraph strings, each containing at least one sentence ending in a period.

**Validates: Requirements 7.3, 7.7**

---

## Error Handling

### Navigation Errors
- If `import(../tools/${id}/index.js)` fails (e.g., unknown tool ID), the router catches the error and renders a "Tool not found" message with a link back home.
- If an unknown hash is entered, the router defaults to rendering the home page.

### Tool Errors
- Each tool wraps its core logic in try/catch. Errors surface as inline error banners within the tool view (never as `alert()`).
- Clipboard failures show a toast with error type "error".

### Malformed Input
- JSON Formatter: invalid JSON shows a red error banner with the `SyntaxError` message.
- Base64 Decoder: invalid Base64 shows an inline error.
- RegEx Tester: invalid regex shows an inline error below the pattern input.

---

## Testing Strategy

Since this is a pure static site with no build tooling, tests are written as standalone HTML test files that can be opened directly in the browser, or run with a lightweight test runner like [qunit](https://qunitjs.com/) (loaded from CDN) or plain `console.assert` scripts.

**Unit tests** (example-based):
- Theme toggle: verify `data-theme` attribute switches correctly and persists to localStorage
- Router: verify hash parsing maps to correct tool IDs
- Filter + search: verify correct tools shown/hidden for each combination

**Property-based tests**:
The project uses [fast-check](https://fast-check.io/) loaded from CDN in a test HTML file. Each property test runs a minimum of 100 iterations.

```
tests/
├── base64.test.html       → Property 1: Base64 round-trip
├── password.test.html     → Property 2: Password constraint satisfaction
├── json.test.html         → Property 3: JSON formatter round-trip
├── uuid.test.html         → Property 4: UUID v4 structural validity
├── ulid.test.html         → Property 5: ULID monotonic ordering
├── regex.test.html        → Property 6: RegEx match count consistency
└── lorem.test.html        → Property 7: Lorem Ipsum paragraph count
```

Each test file:
1. Loads fast-check from `https://cdn.skypack.dev/fast-check`
2. Loads the tool module under test
3. Defines and runs the property
4. Outputs pass/fail to the page

**Tag format for each property test**:
`// Feature: toolhub-refactor-and-direct-tools, Property N: <property text>`
