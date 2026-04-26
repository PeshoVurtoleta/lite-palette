import { describe, it, expect, vi, afterEach } from 'vitest';

import { A11yColor, WCAG_RATIOS } from './A11yColor.js';
import { ColorScale } from './ColorScale.js';
import { ImagePalette } from './ImagePalette.js';

// ═══════════════════════════════════════════════════════════════
//  A11yColor Tests (Remains unchanged: pure Hex/RGB internally)
// ═══════════════════════════════════════════════════════════════

describe('A11yColor — Luminance & Contrast', () => {
    it('calculates correct luminance for black and white', () => {
        expect(A11yColor.getLuminance('#000000')).toBeCloseTo(0, 2);
        expect(A11yColor.getLuminance('#FFFFFF')).toBeCloseTo(1, 2);
    });

    it('calculates exact 21:1 contrast for black vs white', () => {
        expect(A11yColor.getContrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
        expect(A11yColor.getContrast('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
    });

    it('returns 1:1 contrast for identical colors', () => {
        expect(A11yColor.getContrast('#808080', '#808080')).toBe(1);
    });
});

describe('A11yColor — Enforcement Binary Search', () => {
    it('returns original color if it already passes WCAG AA', () => {
        const bg = '#FFFFFF';
        const text = '#000000';
        const safeColor = A11yColor.enforce(text, bg, WCAG_RATIOS.AA_TEXT);
        expect(safeColor.toLowerCase()).toBe(text.toLowerCase());
    });

    it('lightens an inaccessible dark color on a dark background', () => {
        const bg = '#111111';
        const badText = '#333333';

        const safeColor = A11yColor.enforce(badText, bg, WCAG_RATIOS.AA_TEXT);
        const newContrast = A11yColor.getContrast(safeColor, bg);

        expect(newContrast).toBeGreaterThanOrEqual(WCAG_RATIOS.AA_TEXT);
        expect(A11yColor.getLuminance(safeColor)).toBeGreaterThan(A11yColor.getLuminance(badText));
    });

    it('darkens an inaccessible light color on a light background', () => {
        const bg = '#EEEEEE';
        const badText = '#CCCCCC';

        const safeColor = A11yColor.enforce(badText, bg, WCAG_RATIOS.AA_TEXT);
        const newContrast = A11yColor.getContrast(safeColor, bg);

        expect(newContrast).toBeGreaterThanOrEqual(WCAG_RATIOS.AA_TEXT);
        expect(A11yColor.getLuminance(safeColor)).toBeLessThan(A11yColor.getLuminance(badText));
    });

    it('fast-paths to maximum extreme if text exactly matches background', () => {
        const bgDark = '#000000';
        expect(A11yColor.enforce(bgDark, bgDark)).toBe('#FFFFFF');

        const bgLight = '#FFFFFF';
        expect(A11yColor.enforce(bgLight, bgLight)).toBe('#000000');
    });
});

// ═══════════════════════════════════════════════════════════════
//  ColorScale Tests (Upgraded to native OKLCH strings)
// ═══════════════════════════════════════════════════════════════

describe('ColorScale — Linear', () => {
    it('generates correct number of steps', () => {
        const scale = ColorScale.linear('oklch(0 0 0)', 'oklch(1 0 0)', 5);
        expect(scale).toHaveLength(5);
        // lite-color formats to fixed precision: oklch(l.toFixed(4) c.toFixed(4) h.toFixed(2) / a)
        expect(scale[0]).toBe('oklch(0.0000 0.0000 0.00 / 1)');
        expect(scale[4]).toBe('oklch(1.0000 0.0000 0.00 / 1)');
    });

    it('handles 1 step edge-case safely', () => {
        const scale = ColorScale.linear('oklch(0 0 0)', 'oklch(1 0 0)', 1);
        expect(scale).toHaveLength(1);
        expect(scale[0]).toBe('oklch(0.0000 0.0000 0.00 / 1)'); // Always formatted, matches multi-step output
    });
});

describe('ColorScale — Multi-Stop', () => {
    it('distributes 3 colors over 5 steps perfectly', () => {
        const stops = ['oklch(0 0 0)', 'oklch(0.5 0 0)', 'oklch(1 0 0)'];
        const scale = ColorScale.multiStop(stops, 5);

        expect(scale).toHaveLength(5);
        expect(scale[0]).toBe('oklch(0.0000 0.0000 0.00 / 1)');
        expect(scale[2]).toBe('oklch(0.5000 0.0000 0.00 / 1)'); // Center should hit the middle stop exactly
        expect(scale[4]).toBe('oklch(1.0000 0.0000 0.00 / 1)');
    });

    it('handles fewer steps than stops gracefully', () => {
        const stops = ['oklch(1 0 0)', 'oklch(0.5 0.2 120)', 'oklch(0 0 240)'];
        const scale = ColorScale.multiStop(stops, 2);

        expect(scale).toHaveLength(2);
        expect(scale[0]).toBe('oklch(1.0000 0.0000 0.00 / 1)');
        expect(scale[1]).toBe('oklch(0.0000 0.0000 240.00 / 1)');
    });

    it('returns formatted single color if not enough stops provided', () => {
        expect(ColorScale.multiStop(['oklch(1 0 0)']))
            .toEqual(['oklch(1.0000 0.0000 0.00 / 1)']);
    });
});

// ═══════════════════════════════════════════════════════════════
//  ImagePalette Tests (With Canvas Mock)
// ═══════════════════════════════════════════════════════════════

describe('ImagePalette — Extraction', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('extracts and sorts dominant colors from image data', () => {
        // Fake 2x2 image: 3 red pixels, 1 blue pixel, fully opaque
        const mockContext = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Uint8ClampedArray([
                    255, 0,   0, 255,    // Red
                    255, 0,   0, 255,    // Red
                    0,   0, 255, 255,    // Blue
                    255, 0,   0, 255     // Red
                ])
            }))
        };

        vi.stubGlobal('document', {
            createElement: (tag) => {
                if (tag === 'canvas') {
                    return {
                        getContext: () => mockContext,
                        width: 0,
                        height: 0
                    };
                }
                return {};
            }
        });

        const fakeImage = { naturalWidth: 100, naturalHeight: 100, width: 100, height: 100 };
        const colors = ImagePalette.extract(fakeImage, 2);

        expect(mockContext.drawImage).toHaveBeenCalled();
        expect(colors).toHaveLength(2);
        expect(colors[0].toLowerCase()).toBe('#ff0000'); // Red dominates
        expect(colors[1].toLowerCase()).toBe('#0000ff'); // Blue second
    });
});