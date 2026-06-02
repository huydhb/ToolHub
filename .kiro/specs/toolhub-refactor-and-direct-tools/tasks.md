# Implementation Plan: ToolHub Refactor & Direct Tools

## Overview

Migrate `toolhub.html` into a proper multi-file static web app with a hash-based router, a tool registry, and 8 natively-implemented tools. All code is pure HTML/CSS/vanilla JS — no build step, no npm, no frameworks. Tasks are ordered so each step produces a working, runnable result.

---

## Tasks

- [x] 1. Create the shared CSS foundation
  - Create `styles/tokens.css` — extract all CSS custom properties (`:root`, `[data-theme="dark"]`, `@media prefers-color-scheme`) verbatim from `toolhub.html`
  - Create `styles/base.css` — extract reset rules, `html`, `body`, `img/svg`, `button`, `a`, `:focus-visible`, `@media prefers-reduced-motion`
  - Create `styles/components.css` — extract all shared component styles: `.skip-link`, `header`, `nav`, `.logo`, `.nav-links`, `.nav-search`, `.theme-toggle`, `.hero`, `.filter-bar`, `.filter-btn`, `.tools-grid`, `.tool-card`, `.card-header`, `.card-icon`, `.card-badge`, `.card-title`, `.card-desc`, `.card-tags`, `.tag`, `.card-footer`, `.open-btn`, `.contribute-section`, `footer`, `.empty-state`, `.fade-in`
  - Create `styles/tools.css` — add new classes: `.tool-view`, `.tool-header`, `.back-btn`, `.tool-title-row`, `.tool-icon`, `.tool-name`, `.tool-tagline`, `.tool-body`, `.tool-controls`, `.tool-output`, `.tool-error`, `.tool-btn`, `.copy-btn`, `.strength-bar`, `.strength-label`
  - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Create the app shell and entry point
  - Create `index.html` with: `<!DOCTYPE html>`, correct meta tags, font links, Lucide CDN script, four `<link>` tags for the CSS files, the sticky `<header>` with logo + nav links + search input + theme toggle button, `<main id="main"><div id="app"></div></main>`, `<footer>`, a `<div id="toast">` for notifications, and `<script type="module" src="scripts/app.js">`
  - Copy the exact logo SVG and nav HTML from `toolhub.html`
  - _Requirements: 1.1, 1.2, 2.6, 3.5, 19.1_

- [x] 3. Implement the tool registry
  - Create `scripts/registry.js` exporting a `TOOLS` array
  - Add one entry per tool with all required fields: `id`, `name`, `description`, `category`, `badge`, `icon`, `accent`, `tags`, `featured`
  - Tools to register (in order): `vi-name-generator`, `password-generator`, `lorem-ipsum`, `json-formatter`, `uuid-ulid-generator`, `base64`, `color-palette`, `regex-tester`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement shared utilities
  - Create `scripts/utils.js`
  - Implement `copyToClipboard(text)`: uses `navigator.clipboard.writeText`, falls back to `execCommand('copy')` via a temp textarea
  - Implement `showToast(message, type)`: injects a toast element into `#toast`, adds class `toast--success` or `toast--error`, auto-removes after 2000ms; include `.toast` CSS in `styles/components.css`
  - Implement `debounce(fn, ms)`: returns a debounced wrapper
  - Implement `escapeHtml(str)`: escapes `&`, `<`, `>`, `"`, `'`
  - Implement `initTheme()`: reads `localStorage.getItem('theme')`, falls back to `prefers-color-scheme`, sets `document.documentElement.setAttribute('data-theme', …)` and wires up the theme toggle button click handler including icon swap and localStorage save
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 5. Implement the hash router and home view
  - Create `scripts/router.js`
  - Implement `renderHome(appEl, tools)`: generates and injects the hero section HTML (badge, h1, stats), filter bar HTML, tools grid HTML (cards built from the `tools` array), contribute section HTML, and empty state element; wires up filter button clicks, search input, and card click navigation; calls `lucide.createIcons()` after injection
  - The tool card "Mở" button should call `location.hash = '#/tools/' + tool.id` instead of linking to an external URL
  - Implement `renderTool(appEl, id)`: sets loading skeleton HTML, does `const mod = await import('../tools/' + id + '/index.js')`, calls `mod.mount(appEl)`, calls `lucide.createIcons()`; on import error renders a "Công cụ không tìm thấy" message with a back-home link
  - Implement `initRouter(appEl, tools)`: reads `location.hash` on load, attaches `window.addEventListener('hashchange', …)` and dispatches to `renderHome` or `renderTool`
  - Update the hero stats to count tools dynamically from `tools.length`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.2, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 6. Create the app entry point
  - Create `scripts/app.js`
  - Import `TOOLS` from `./registry.js`, `initRouter` from `./router.js`, `initTheme` from `./utils.js`
  - Call `initTheme()` first, then `initRouter(document.getElementById('app'), TOOLS)`
  - _Requirements: 1.4, 3.1_

- [x] 7. Checkpoint — verify home page
  - Open `index.html` in a browser (or `python -m http.server 8080` / VS Code Live Server)
  - Verify: all 8 tool cards render correctly, filter buttons work, search input filters cards, theme toggle switches dark/light and persists, clicking a card updates the URL hash, browser back/forward navigates correctly
  - Ensure all tests pass, ask the user if questions arise.

- [-] 8. Implement Vietnamese Name Generator
  - Create `tools/vi-name-generator/index.js`
  - Define data arrays at the top of the module: `SURNAMES` (30+ entries), `MIDDLE_MALE`, `MIDDLE_FEMALE`, `GIVEN_MALE`, `GIVEN_FEMALE`
  - Implement `generateName(gender, style)` → returns `{ fullName, surname, middle, given }`
  - Implement `mount(container)`: injects tool-view HTML with gender radio buttons (Tất cả / Nam / Nữ), style radio buttons (Ngẫu nhiên / Truyền thống / Hiện đại), quantity number input (1–20, default 5), a "Tạo tên" button, and an output list; wires up the generate button click to populate the list; each list item has a copy button that calls `copyToClipboard`
  - Import and use `copyToClipboard`, `showToast` from `../../scripts/utils.js`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [ ]* 8.1 Write unit test for name gender filtering
  - Verify that when gender is 'male', no female-specific middle names or given names appear in 50 generated names
  - Verify that when gender is 'female', no male-specific middle names appear in 50 generated names
  - _Requirements: 5.6, 5.7_

- [-] 9. Implement Password Generator
  - Create `tools/password-generator/index.js`
  - Implement `generatePassword(length, opts)` where `opts = { upper, lower, numbers, symbols }`: builds charset from selected options, uses `crypto.getRandomValues()` to sample characters, ensures at least one character from each selected charset, shuffles result
  - Implement `getStrength(length, charsetCount)` → returns `'weak' | 'medium' | 'strong'` based on length and number of active charsets
  - Implement `mount(container)`: injects tool HTML with password display (type=password), visibility toggle button, copy button, strength meter bar + label, length slider (8–128, default 16), four checkboxes (uppercase/lowercase/numbers/symbols all checked by default), and a "Tạo mật khẩu" button; wires all controls; shows error if no charset selected
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ]* 9.1 Write property test for password constraint satisfaction
  - **Property 2: Password always satisfies its constraints**
  - **Validates: Requirements 6.3, 6.8**
  - Test file: `tests/password.test.html`; uses fast-check from CDN; generates random (length 8–128, random subset of charsets); calls `generatePassword`; asserts `output.length == length` and each active charset has ≥1 representative character
  - `// Feature: toolhub-refactor-and-direct-tools, Property 2: Password always satisfies its constraints`
  - Minimum 100 iterations

- [-] 10. Implement Lorem Ipsum Generator
  - Create `tools/lorem-ipsum/index.js`
  - Define `LOREM_WORDS` array (~200 Latin words from the classical Lorem Ipsum corpus)
  - Implement `generateParagraph()`: randomly picks 4–8 sentences each of 8–15 words; first paragraph always starts with the canonical opening
  - Implement `generateSentence()`: picks 8–15 words, capitalizes first word, ends with `.`
  - Implement `generateWords(n)`: picks n random words joined by spaces
  - Implement `generate(type, quantity)` where type is `'paragraphs' | 'sentences' | 'words'`
  - Implement `mount(container)`: injects tool HTML with type radio buttons, quantity number input (1–100, default 3), "Tạo văn bản" button, scrollable read-only textarea output, and copy button
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ]* 10.1 Write property test for Lorem Ipsum paragraph count
  - **Property 7: Lorem Ipsum paragraph count**
  - **Validates: Requirements 7.3, 7.7**
  - Test file: `tests/lorem.test.html`; generates random quantity 1–100; calls `generate('paragraphs', n)`; asserts result array has length n and each entry ends with `.`
  - `// Feature: toolhub-refactor-and-direct-tools, Property 7: Lorem Ipsum paragraph count`
  - Minimum 100 iterations

- [-] 11. Implement JSON Formatter
  - Create `tools/json-formatter/index.js`
  - Implement `formatJson(input, indent)`: `JSON.parse` then `JSON.stringify(parsed, null, indent)`; returns `{ ok: true, output }` or `{ ok: false, error: e.message }`
  - Implement `minifyJson(input)`: `JSON.parse` then `JSON.stringify(parsed)`
  - Implement `syntaxHighlight(jsonStr)`: applies regex-based `<span>` colorization (strings, numbers, keys, booleans, null) to an already-escaped HTML string
  - Implement `addLineNumbers(htmlStr)`: wraps each line in a `<span class="line">` to enable CSS counter-based line numbers
  - Implement `mount(container)`: injects tool HTML with editable input `<textarea>`, indent radio buttons (2 spaces / 4 spaces / Tab), "Format", "Minify", "Clear" action buttons, a `<pre>` output area with syntax highlighting, error banner, and copy button; wires all events
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ]* 11.1 Write property test for JSON formatter round-trip
  - **Property 3: JSON formatter round-trip**
  - **Validates: Requirements 8.3, 8.4**
  - Test file: `tests/json.test.html`; uses fast-check `fc.jsonValue()` to generate arbitrary JSON values; formats each with `formatJson`, then `JSON.parse`s the output; deep-equal compares to original
  - `// Feature: toolhub-refactor-and-direct-tools, Property 3: JSON formatter round-trip`
  - Minimum 100 iterations

- [-] 12. Implement UUID / ULID Generator
  - Create `tools/uuid-ulid-generator/index.js`
  - Implement `generateUUIDv4()`: uses `crypto.getRandomValues(new Uint8Array(16))`, sets version bits (byte 6 → `0x4X`) and variant bits (byte 8 → `0x8X–0xBX`), formats as standard UUID string
  - Implement `generateUUIDv1()`: timestamp-based UUID using `Date.now()` multiplied into the time fields + `crypto.getRandomValues` for node/clock-seq; produces a valid v1 format string
  - Implement `generateULID()`: 48-bit `Date.now()` encoded as 10 Crockford Base32 chars + 80-bit `crypto.getRandomValues` as 16 Crockford Base32 chars; total 26 chars
  - Implement `mount(container)`: injects tool HTML with type radio buttons (UUID v4 / UUID v1 / ULID), quantity number input (1–100, default 1), "Tạo ID" button, scrollable output list (each item has its own copy button), "Copy All" button
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ]* 12.1 Write property test for UUID v4 structural validity
  - **Property 4: UUID v4 structural validity**
  - **Validates: Requirements 9.2, 9.3**
  - Test file: `tests/uuid.test.html`; generates 500 UUIDs; each must match `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`
  - `// Feature: toolhub-refactor-and-direct-tools, Property 4: UUID v4 structural validity`
  - Minimum 100 iterations

- [ ]* 12.2 Write property test for ULID monotonic ordering
  - **Property 5: ULID monotonically increases with time**
  - **Validates: Requirements 9.4**
  - Test file: extend `tests/uuid.test.html`; generate pairs of ULIDs 1ms apart (mock Date.now via closure); verify lexicographic order matches chronological order
  - `// Feature: toolhub-refactor-and-direct-tools, Property 5: ULID monotonic ordering`
  - Minimum 100 iterations

- [ ] 13. Implement Base64 Encoder/Decoder
  - Create `tools/base64/index.js`
  - Implement `encodeBase64(str)`: `btoa(unescape(encodeURIComponent(str)))` — UTF-8 safe
  - Implement `decodeBase64(str)`: `decodeURIComponent(escape(atob(str)))` wrapped in try/catch; throws descriptive error on invalid input
  - Implement `mount(container)`: injects tool HTML with mode radio buttons (Encode / Decode), input textarea, swap button (⇄), output textarea (read-only), action button ("Encode" or "Decode" label matching mode), error banner, copy button; swap button copies output to input and toggles mode; live processing on input change (debounced 300ms)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [ ]* 13.1 Write property test for Base64 round-trip
  - **Property 1: Base64 round-trip**
  - **Validates: Requirements 10.3, 10.4, 10.8**
  - Test file: `tests/base64.test.html`; uses fast-check `fc.string()` (including unicode); for each string s: `decodeBase64(encodeBase64(s)) === s`
  - `// Feature: toolhub-refactor-and-direct-tools, Property 1: Base64 round-trip`
  - Minimum 100 iterations

- [~] 14. Checkpoint — verify tools 1–6
  - Open each of the 6 tools in the browser
  - Verify: all controls render, generation works, copy buttons produce toast feedback, error states display correctly for invalid inputs (JSON, Base64), theme applies consistently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement Color Palette Generator
  - Create `tools/color-palette/index.js`
  - Implement `generateColor()`: returns a random HSL color string with saturation 55–85% and lightness 40–65%; use `crypto.getRandomValues` for the hue byte
  - Implement `hslToHex(h, s, l)` and `hexToHsl(hex)` — needed for color display and export
  - Implement `hslToRgb(h, s, l)` — for RGB display
  - Implement `generatePalette(locked)` where `locked` is an array of 5 entries (string|null): returns a new 5-color array keeping non-null locked entries unchanged
  - Implement `exportCSS(colors)`, `exportTailwind(colors)`, `exportJSON(colors)` — return formatted strings
  - Implement `mount(container)`: injects tool HTML with 5 color swatch cards (each shows HEX prominently, has a lock toggle button and a `<input type="color">` picker); a "Tạo bảng màu" button; spacebar listener; export buttons (CSS / Tailwind / JSON); each swatch click copies HEX to clipboard; hovering a swatch shows RGB and HSL overlay
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_

- [ ]* 15.1 Write property test for locked color preservation
  - **Property: Locked colors preserved across palette regeneration**
  - **Validates: Requirements 11.3**
  - Test file: `tests/color.test.html`; uses fast-check to generate a random array of 5 colors with random lock positions; calls `generatePalette(locked)` multiple times; verifies all locked slots remain unchanged
  - `// Feature: toolhub-refactor-and-direct-tools, Property: Locked colors preserved across palette regeneration`
  - Minimum 100 iterations

- [ ] 16. Implement RegEx Tester
  - Create `tools/regex-tester/index.js`
  - Implement `buildHighlight(str, matches)`: takes the test string and an array of match ranges `[{start, end}]`; returns an HTML string where matched ranges are wrapped in `<mark class="rx-match">` and all content is HTML-escaped; import `escapeHtml` from `../../scripts/utils.js`
  - Implement `getCaptureGroups(matches)`: returns an array of group arrays `[[g1, g2, …], …]` from `matchAll` results
  - Implement `mount(container)`: injects tool HTML with pattern `<input>`, flag checkboxes (g, i, m, s), test string `<textarea>`, match count display, highlighted output `<div>`, capture groups display, error banner, and a row of example pattern buttons (Email, URL, Phone VN, IPv4); all inputs trigger live matching (debounced 150ms); builds `new RegExp(pattern, flags)` in try/catch; uses `matchAll` to find all matches
  - Add `.rx-match { background: var(--color-primary-highlight); border-radius: 2px; }` to `styles/tools.css`
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

- [ ]* 16.1 Write property test for RegEx match count consistency
  - **Property 6: RegEx match count is consistent**
  - **Validates: Requirements 12.4, 12.5**
  - Test file: `tests/regex.test.html`; uses fast-check `fc.string()` for test strings and a small set of fixed known-valid patterns; for each, compare `[...str.matchAll(rx)].length` against the count returned by the tool's match logic
  - `// Feature: toolhub-refactor-and-direct-tools, Property 6: RegEx match count consistency`
  - Minimum 100 iterations

- [~] 17. Final checkpoint — full integration
  - Open `index.html` and verify the complete user flow:
    - Home page loads with all 8 tools, correct counts, filter and search work
    - Navigate into every tool, verify UI is correct and fully functional
    - Theme toggle works from every tool view
    - Browser back button from a tool returns to home
    - Direct hash URL (e.g. `index.html#/tools/base64`) loads the correct tool
    - All copy buttons show toast feedback
    - All error states display correctly (empty JSON, invalid Base64, bad regex)
    - ARIA labels and keyboard navigation work (tab through controls, Enter to activate buttons)
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property/unit tests — skip them for a faster MVP, add them for correctness guarantees
- Each task is self-contained: implement fully before moving to the next
- All tool modules export only `mount(container)` — the router calls this; no global state leaks between tools
- The `tests/` directory is separate from `tools/` — test files are never loaded by the app itself
- Property tests load fast-check from `https://cdn.skypack.dev/fast-check` — requires internet access when running tests

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4"] },
    { "wave": 5, "tasks": ["5"] },
    { "wave": 6, "tasks": ["6"] },
    { "wave": 7, "tasks": ["7"] },
    { "wave": 8, "tasks": ["8", "9", "10", "11", "12", "13"] },
    { "wave": 9, "tasks": ["8.1", "9.1", "10.1", "11.1", "12.1", "12.2", "13.1", "14"] },
    { "wave": 10, "tasks": ["15", "16"] },
    { "wave": 11, "tasks": ["15.1", "16.1", "17"] }
  ]
}
```

Tasks 8–13 and 15–16 are independent of each other and can be implemented in any order after task 7.
