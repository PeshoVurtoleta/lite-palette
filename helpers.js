export const parseHex = (hex) => {
    const start = hex.charCodeAt(0) === 35 ? 1 : 0; // 35 = '#'
    let h = hex.substring(start);
    if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const v = parseInt(h, 16);
    return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};

export const toHex = (r, g, b) =>
    '#' + (
        (1 << 24) |
        (Math.round(r) << 16) |
        (Math.round(g) << 8) |
        Math.round(b)
    ).toString(16).slice(1);