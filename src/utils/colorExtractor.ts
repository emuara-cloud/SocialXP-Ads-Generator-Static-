/**
 * Utility to extract dominant color tones from an image Data URL using HTML Canvas
 */

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function extractDominantColors(dataUrl: string, maxColors = 3): Promise<string[]> {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve(['#0ea5e9']);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#0ea5e9']);
          return;
        }

        // Downscale image to 64x64 for fast pixel processing
        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Color bucket map (quantized by 16)
        const colorCounts: { [hex: string]: { count: number; r: number; g: number; b: number; sat: number } } = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip mostly transparent pixels
          if (a < 128) continue;

          // Calculate brightness & saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = max;
          const saturation = max === 0 ? 0 : (max - min) / max;

          // Skip extreme darks (near black) or extreme lights (near white) to get colorful tones
          if (brightness < 30 || (brightness > 230 && saturation < 0.15)) {
            continue;
          }

          // Quantize RGB values to 24 steps
          const qR = Math.round(r / 24) * 24;
          const qG = Math.round(g / 24) * 24;
          const qB = Math.round(b / 24) * 24;

          const hex = rgbToHex(qR, qG, qB);

          if (!colorCounts[hex]) {
            colorCounts[hex] = { count: 0, r: qR, g: qG, b: qB, sat: saturation };
          }

          // Weighted count: give higher priority to saturated, vibrant colors
          colorCounts[hex].count += 1 + saturation * 2;
        }

        const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);

        if (sorted.length === 0) {
          // Fallback if image was pure white/black
          resolve(['#0ea5e9']);
          return;
        }

        const extractedHexes: string[] = [];
        for (const item of sorted) {
          const hex = rgbToHex(item.r, item.g, item.b);
          if (!extractedHexes.includes(hex)) {
            extractedHexes.push(hex);
          }
          if (extractedHexes.length >= maxColors) break;
        }

        resolve(extractedHexes);
      } catch (err) {
        console.warn('Color extraction failed:', err);
        resolve(['#0ea5e9']);
      }
    };

    img.onerror = () => {
      resolve(['#0ea5e9']);
    };

    img.src = dataUrl;
  });
}
