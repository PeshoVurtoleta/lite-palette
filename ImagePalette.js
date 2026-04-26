import { toHex } from "./helpers.js";

export class ImagePalette {
    /** * Extracts the dominant colors from an HTMLImageElement.
     * @param {HTMLImageElement} image
     * @param {number} maxColors - How many top colors to return.
     * @param {number} sampleSize - Downscale size for performance.
     * @param {number} quant - Quantization step size (default 16).
     */
    static extract(image, maxColors = 5, sampleSize = 64, quant = 16) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", {willReadFrequently: true});

        // 3.4 Prevent upscaling blur on tiny icons
        const w = Math.min(image.naturalWidth || image.width, sampleSize);
        const h = Math.min(image.naturalHeight || image.height, sampleSize);

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(image, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h).data;
        const colorCounts = new Map();

        for (let i = 0; i < imageData.length; i += 4) {
            const a = imageData[i + 3];
            if (a === 0) continue; // Ignore pure transparency

            // 3.2 Alpha-premultiplication (blend against black/background)
            const alphaFactor = a / 255;
            const r = imageData[i] * alphaFactor;
            const g = imageData[i + 1] * alphaFactor;
            const b = imageData[i + 2] * alphaFactor;

            // 3.1 Configurable Quantization clustering
            const rBin = Math.min(255, Math.round(r / quant) * quant);
            const gBin = Math.min(255, Math.round(g / quant) * quant);
            const bBin = Math.min(255, Math.round(b / quant) * quant);

            const hex = toHex(rBin, gBin, bBin);

            colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
        }

        const sortedColors = [...colorCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

        return sortedColors.slice(0, maxColors);
    }
}