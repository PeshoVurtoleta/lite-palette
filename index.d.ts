/**
 * Standard WCAG 2.1 Contrast Ratios.
 */
export const WCAG_RATIOS: {
    /** 4.5:1 — Standard requirement for normal text (e.g., 14pt or 18px). */
    AA_TEXT: 4.5;
    /** 3.0:1 — Standard requirement for large text (e.g., 18pt or 24px) or bold text. */
    AA_LARGE: 3.0;
    /** 7.0:1 — Enhanced requirement for maximum accessibility. */
    AAA_TEXT: 7.0;
    /** 3.0:1 — Requirement for UI components and graphical objects (e.g., borders, icons). */
    UI_COMPONENT: 3.0;
};

/**
 * Mathematical accessibility color calculations.
 *
 * All methods operate on **hex strings** (e.g., `"#FF0000"`).
 */
export class A11yColor {
    /**
     * Calculates the relative luminance of a color.
     * @param hex - Hexadecimal color string (e.g., "#FF0000").
     * @returns Luminance value between 0 (black) and 1 (white).
     */
    static getLuminance(hex: string): number;

    /**
     * Calculates the exact WCAG contrast ratio between two colors.
     * @param color1 - First hex color.
     * @param color2 - Second hex color.
     * @returns Contrast ratio from 1.0 (no contrast) to 21.0 (maximum contrast).
     */
    static getContrast(color1: string, color2: string): number;

    /**
     * Ensures a text color meets the target contrast ratio against a background.
     * Uses a highly optimized 8-step binary search to find the closest valid color.
     *
     * @param textHex - The desired text color (hex).
     * @param bgHex - The background color it sits on (hex).
     * @param targetRatio - The target WCAG ratio (defaults to 4.5).
     * @returns A safely adjusted hex color, or the original if it already passes.
     */
    static enforce(textHex: string, bgHex: string, targetRatio?: number): string;
}

/**
 * Procedural generation of color gradients and scales.
 *
 * All methods operate on **OKLCH CSS strings** (e.g., `"oklch(0.7 0.15 180)"`).
 * Returns arrays of formatted OKLCH CSS strings via `@zakkster/lite-color`.
 */
export class ColorScale {
    /**
     * Generates a linear color scale between two OKLCH colors.
     *
     * @param start - Starting color as an OKLCH CSS string.
     * @param end - Ending color as an OKLCH CSS string.
     * @param steps - Number of colors to generate (defaults to 5).
     * @returns Array of OKLCH CSS strings.
     */
    static linear(start: string, end: string, steps?: number): string[];

    /**
     * Generates a multi-stop gradient evenly distributed across the total steps.
     * Ideal for heatmaps, particle lifetimes, and complex UI gradients.
     *
     * @param stops - Array of OKLCH CSS color strings acting as keyframes.
     * @param totalSteps - Total number of colors to generate (defaults to 10).
     * @returns Array of OKLCH CSS strings.
     */
    static multiStop(stops: string[], totalSteps?: number): string[];
}

/**
 * High-performance image quantization and dominant color extraction.
 *
 * Requires a DOM environment (`<canvas>` + `getImageData`).
 */
export class ImagePalette {
    /**
     * Extracts the dominant colors from an image using math-based quantization.
     * Avoids the performance overhead of K-Means clustering.
     *
     * @param image - The loaded HTMLImageElement. Set `crossOrigin="Anonymous"` if external.
     * @param maxColors - Maximum number of dominant colors to return (defaults to 5).
     * @param sampleSize - Internal canvas downscale size for fast reads (defaults to 64).
     * @param quant - Quantization step size (defaults to 16).
     * @returns Array of the most dominant hex colors, sorted by prominence.
     */
    static extract(
        image: HTMLImageElement,
        maxColors?: number,
        sampleSize?: number,
        quant?: number
    ): string[];
}
