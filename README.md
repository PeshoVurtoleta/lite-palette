# @zakkster/lite-palette

[![npm version](https://img.shields.io/npm/v/@zakkster/lite-palette.svg?style=for-the-badge&color=latest)](https://www.npmjs.com/package/@zakkster/lite-palette)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zakkster/lite-palette?style=for-the-badge)](https://bundlephobia.com/result?p=@zakkster/lite-palette)
[![npm downloads](https://img.shields.io/npm/dm/@zakkster/lite-palette?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-palette)
[![npm total downloads](https://img.shields.io/npm/dt/@zakkster/lite-palette?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-palette)
![TypeScript](https://img.shields.io/badge/TypeScript-Types-informational)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

High-performance color utilities for procedural generation, dynamic UI theming, and accessibility compliance. Built for HTML5 game engines and fast web apps.

Part of the `@zakkster/lite-*` zero-GC engine ecosystem.

## Features

1. **`A11yColor`**: Calculates WCAG luminance/contrast and automatically corrects inaccessible text colors using an ultra-fast binary search.
2. **`ColorScale`**: Generates linear and multi-stop color gradients in perceptually uniform OKLCH space.
3. **`ImagePalette`**: Extracts dominant colors from images using blazing-fast quantization (no heavy K-Means clustering).

## Installation

```bash
npm install @zakkster/lite-palette
```

---

## 1. Accessibility & Contrast (A11yColor)

Ensure your procedurally generated UI is always readable. If a generated color fails WCAG contrast ratios against its background, `A11yColor.enforce()` finds the closest mathematically valid color in exactly 8 binary-search steps.

```javascript
import { A11yColor, WCAG_RATIOS } from '@zakkster/lite-palette';

const bg = '#1a1a1a';    // Dark background
const text = '#3b82f6';  // Dark blue text (fails WCAG)

// Automatically lightens the blue until it passes the AA standard (4.5:1)
const safeColor = A11yColor.enforce(text, bg, WCAG_RATIOS.AA_TEXT);

console.log(safeColor); // Outputs a legible, lighter blue
```

**Available WCAG Constants:**

- `WCAG_RATIOS.AA_TEXT` (4.5) — Standard text
- `WCAG_RATIOS.AA_LARGE` (3.0) — Large headers
- `WCAG_RATIOS.AAA_TEXT` (7.0) — Maximum accessibility
- `WCAG_RATIOS.UI_COMPONENT` (3.0) — Borders, icons, input fields

---

## 2. Multi-Stop Gradients (ColorScale)

Create continuous color scales for heatmaps, particle lifetimes, or UI gradients. ColorScale operates in **OKLCH color space** for perceptually uniform interpolation.

```javascript
import { ColorScale } from '@zakkster/lite-palette';

// Linear interpolation between two OKLCH colors
const steps = ColorScale.linear('oklch(0.63 0.26 29)', 'oklch(0.45 0.31 264)', 5);

// Complex multi-stop interpolation (e.g., Fire particle gradient)
const fireScale = ColorScale.multiStop(
    ['oklch(1 0 0)', 'oklch(0.8 0.18 90)', 'oklch(0.5 0.2 30)', 'oklch(0 0 0)'],
    10 // Returns 10 evenly spaced colors across the 4 stops
);
```

---

## 3. Dominant Color Extraction (ImagePalette)

Extract the dominant colors from any loaded image, sprite, or texture to create dynamic UI themes (similar to Spotify or Apple Music).

Unlike typical libraries that use slow K-Means clustering, `ImagePalette` uses an ultra-fast hardware `<canvas>` downsample and math-based quantization to achieve the same result in a fraction of a millisecond.

```javascript
import { ImagePalette } from '@zakkster/lite-palette';

const img = new Image();
img.crossOrigin = "Anonymous"; // Required if loading from external CDN
img.src = "assets/hero_portrait.png";

img.onload = () => {
    // Returns the top 5 dominant colors as hex strings
    const colors = ImagePalette.extract(img, 5);
    console.log(colors); // ['#2a3b4c', '#e2e8f0', ...]
};
```

> For maximum performance on large images, the extractor automatically downsamples to a 64×64 buffer and uses `willReadFrequently: true`.

---

## API

### `WCAG_RATIOS`

| Constant | Value | Description |
|---|---|---|
| `AA_TEXT` | 4.5 | Normal text requirement |
| `AA_LARGE` | 3.0 | Large/bold text requirement |
| `AAA_TEXT` | 7.0 | Enhanced accessibility |
| `UI_COMPONENT` | 3.0 | Non-text UI elements |

### `A11yColor`

All methods are static and operate on `#RRGGBB` hex strings.

| Method | Returns | Description |
|---|---|---|
| `.getLuminance(hex)` | `number` | Relative luminance (0–1). |
| `.getContrast(hex1, hex2)` | `number` | WCAG contrast ratio (1–21). |
| `.enforce(text, bg, ratio?)` | `string` | Adjusts text color to meet target ratio. Defaults to 4.5. |

### `ColorScale`

All methods are static and operate on **OKLCH CSS strings**.

| Method | Returns | Description |
|---|---|---|
| `.linear(start, end, steps?)` | `string[]` | Linear interpolation. Defaults to 5 steps. |
| `.multiStop(stops, totalSteps?)` | `string[]` | Multi-keyframe gradient. Defaults to 10 steps. |

### `ImagePalette`

| Method | Returns | Description |
|---|---|---|
| `.extract(img, max?, sampleSize?, quant?)` | `string[]` | Dominant hex colors sorted by prominence. |

**Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `img` | `HTMLImageElement` | — | Loaded image element |
| `max` | `number` | 5 | Colors to return |
| `sampleSize` | `number` | 64 | Downscale size |
| `quant` | `number` | 16 | Quantization bin size |

---

## Caveats

1. **DOM Required for ImagePalette.** Uses `<canvas>` + `getImageData()`. Will fail in Node.js unless mocked.
2. **CORS.** Cross-origin images taint the canvas. Set `img.crossOrigin = "Anonymous"` before `img.src`.
3. **Binary Search Cap.** `enforce()` runs exactly 8 iterations — sufficient for 8-bit color accuracy, guaranteed O(1).
4. **Hex Only for A11yColor.** Named CSS colors (`"red"`) and `rgb()` strings are not supported.
5. **OKLCH for ColorScale.** `ColorScale` accepts OKLCH CSS strings, not hex. Use `@zakkster/lite-color` for conversion.

---

## License

MIT

## Part of the @zakkster ecosystem

Zero-GC, deterministic, tree-shakeable micro-libraries for high-performance web applications.
