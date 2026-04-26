import { toHex } from "./helpers.js";

export class ImagePalette {
    /**
     * Extracts the dominant colors from an HTMLImageElement.
     * @param {HTMLImageElement} image
     * @param {number} maxColors - How many top colors to return.
     * @param {number} sampleSize - Downscale size for performance.
     * @param {number} quant - Quantization step size (default 16).
     */
    static extract(image, maxColors = 5, sampleSize = 64, quant = 16) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const w = Math.min(image.naturalWidth || image.width, sampleSize);
        const h = Math.min(image.naturalHeight || image.height, sampleSize);

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(image, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h).data;
        const colorCounts = new Map();

        for (let i = 0; i < imageData.length; i += 4) {
            const a = imageData[i + 3];
            if (a === 0) continue;

            const alphaFactor = a / 255;
            const r = imageData[i] * alphaFactor;
            const g = imageData[i + 1] * alphaFactor;
            const b = imageData[i + 2] * alphaFactor;

            const rBin = Math.min(255, Math.round(r / quant) * quant);
            const gBin = Math.min(255, Math.round(g / quant) * quant);
            const bBin = Math.min(255, Math.round(b / quant) * quant);

            // Pack into a 24-bit integer — zero string allocation in the hot loop
            const key = (rBin << 16) | (gBin << 8) | bBin;
            colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
        }

        // Convert to hex only for the final top-N slice
        return [...colorCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxColors)
            .map(([key]) => toHex((key >> 16) & 255, (key >> 8) & 255, key & 255));
    }
}