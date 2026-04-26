import { lerp } from "@zakkster/lite-lerp";
import { parseHex, toHex } from "./helpers.js";

export const WCAG_RATIOS = { AA_TEXT: 4.5, AA_LARGE: 3.0, AAA_TEXT: 7.0, UI_COMPONENT: 3.0 };

export class A11yColor {
    static getLuminance(hex) {
        const { r, g, b } = parseHex(hex);
        return A11yColor._luminanceFromRGB(r, g, b);
    }

    /** @internal Skip the parseHex hop when RGB values are already in hand. */
    static _luminanceFromRGB(r, g, b) {
        const sR = r / 255;
        const sG = g / 255;
        const sB = b / 255;
        const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
        const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
        const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    static getContrast(color1, color2) {
        const lum1 = this.getLuminance(color1);
        const lum2 = this.getLuminance(color2);
        return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    }

    /**
     * Adjusts text color to meet the target contrast ratio against a background.
     * Uses an 8-step binary search blending toward black or white (whichever
     * extreme yields higher contrast against the background).
     *
     * @param {string} textHex - Desired text color (`#RRGGBB` or `#RGB`).
     * @param {string} bgHex - Background color (`#RRGGBB` or `#RGB`).
     * @param {number} [targetRatio=4.5] - WCAG ratio to satisfy.
     * @returns {string} Best-effort hex color. Returns the original if it
     *   already passes, otherwise the closest blend that meets the target.
     *
     * @remarks
     * **Best effort, not guaranteed.** If the target ratio is unreachable
     * given the background (e.g. requesting AAA 7:1 against a mid-gray
     * background where neither black nor white achieves 7:1), the function
     * returns the maximum-contrast extreme (`#FFFFFF` or `#000000`) without
     * throwing. Callers who require a hard guarantee should verify the
     * result themselves:
     *
     * ```js
     * const result = A11yColor.enforce(text, bg, 7);
     * if (A11yColor.getContrast(result, bg) < 7) {
     *   // target was unreachable — fallback or pick a different background
     * }
     * ```
     */
    static enforce(textHex, bgHex, targetRatio = WCAG_RATIOS.AA_TEXT) {
        const bgLum = this.getLuminance(bgHex);

        const cWhite = 1.05 / (bgLum + 0.05);
        const cBlack = (bgLum + 0.05) / 0.05;
        const extremeHex = cWhite >= cBlack ? '#FFFFFF' : '#000000';

        if (textHex.toLowerCase() === bgHex.toLowerCase()) return extremeHex;

        const startRGB = parseHex(textHex);
        const targetRGB = parseHex(extremeHex);

        // Check the input directly — no hex round-trip
        const startLum = A11yColor._luminanceFromRGB(startRGB.r, startRGB.g, startRGB.b);
        const startRatio =
            (Math.max(startLum, bgLum) + 0.05) / (Math.min(startLum, bgLum) + 0.05);
        if (startRatio >= targetRatio) return textHex;

        let bestHex = textHex;
        let bestRatio = startRatio;
        let low = 0;
        let high = 1;

        for (let i = 0; i < 8; i++) {
            const mid = (low + high) / 2;
            const r = Math.round(lerp(startRGB.r, targetRGB.r, mid));
            const g = Math.round(lerp(startRGB.g, targetRGB.g, mid));
            const b = Math.round(lerp(startRGB.b, targetRGB.b, mid));

            const testLum = A11yColor._luminanceFromRGB(r, g, b);
            const ratio =
                (Math.max(testLum, bgLum) + 0.05) / (Math.min(testLum, bgLum) + 0.05);

            if (ratio >= targetRatio) {
                bestHex = toHex(r, g, b); // Only allocate when we keep the result
                bestRatio = ratio;
                high = mid;
            } else {
                low = mid;
            }
        }

        return bestRatio >= targetRatio ? bestHex : extremeHex;
    }
}