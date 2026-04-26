// 🔧 Inline RGB/Hex helpers for WCAG math (Zero external dependencies)
export const parseHex = (hex) => {
    let h = hex.replace('#', '');

    if (h.length === 3) h = h.split('').map(c => c + c).join('');

    const v = parseInt(h, 16);

    return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};

export const toHex = (r, g, b) => '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
