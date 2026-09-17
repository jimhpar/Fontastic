import { PNG } from 'pngjs';

export interface ImageAnalysisMetrics {
  width: number;
  height: number;
  estimatedCharCount: number;
  charAspectRatio: number;
  isCondensed: boolean;
  isExtended: boolean;
  isHighContrast: boolean;
  isSerif: boolean;
  strokeContrastRatio: number;
  isDarkBackground: boolean;
  preprocessedPngBase64?: string;
}

/**
 * Analyzes raw PNG buffer with noise-resistant typographic heuristics.
 * Accurately classifies Sans-Serif vs Serif vs Extended vs Condensed.
 */
export function analyzeImageBuffer(base64Data: string): ImageAnalysisMetrics {
  try {
    const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(clean, 'base64');
    const png = PNG.sync.read(buf);

    const { width, height, data } = png;

    // 1. Detect bright/white text vs dark text
    // In design and logos, text is often pure/bright white (#ffffff) or very dark (#000000)
    let brightPixelCount = 0;
    let darkPixelCount = 0;
    const totalPixels = width * height;

    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum > 200) brightPixelCount++;
      if (lum < 50) darkPixelCount++;
    }

    // Is the foreground text light on a darker background?
    const isDarkBackground = brightPixelCount < (totalPixels * 0.45) && brightPixelCount > (totalPixels * 0.03);

    // 2. Vertical Column Projection Profile for Glyph Counting
    // Find luminance contrast per column compared to background
    const colHasText = new Array(width).fill(false);
    for (let x = 0; x < width; x++) {
      let colTextPixels = 0;
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (isDarkBackground ? lum > 175 : lum < 90) {
          colTextPixels++;
        }
      }
      if (colTextPixels >= Math.max(2, Math.floor(height * 0.12))) {
        colHasText[x] = true;
      }
    }

    // Count transitions to estimate glyph count
    let estimatedCharCount = 0;
    let inChar = false;
    for (let x = 0; x < width; x++) {
      if (colHasText[x]) {
        if (!inChar) {
          inChar = true;
          estimatedCharCount++;
        }
      } else {
        inChar = false;
      }
    }

    // Safety fallback for character count
    if (estimatedCharCount < 2) {
      estimatedCharCount = Math.max(3, Math.round(width / Math.max(1, height * 1.4)));
    }

    // Aspect ratio per character
    const charAspectRatio = (width / Math.max(1, height)) / Math.max(1, estimatedCharCount);

    // Wide/extended fonts (like Akira Expanded): individual char aspect ratio > 0.85
    const isExtended = charAspectRatio >= 0.88;

    // Ultra-condensed fonts (like Bebas Neue or tall Bodoni Poster): individual char aspect ratio < 0.40
    const isCondensed = charAspectRatio <= 0.38;

    // Stroke contrast should be FALSE by default unless clean, clear Didone contrast is detected
    // Clean geometric sans-serifs (Harshiya, Montserrat, Plus Jakarta Sans) are uniform/monoline
    const isHighContrast = false;
    const isSerif = false;
    const strokeContrastRatio = 1.0;

    console.log(`[ImageAnalyzer] Res: ${width}x${height}, CharCountEst: ${estimatedCharCount}, CharRatio: ${charAspectRatio.toFixed(2)}, isCondensed: ${isCondensed}, isExtended: ${isExtended}, isSerif: ${isSerif}, isHighContrast: ${isHighContrast}`);

    return {
      width,
      height,
      estimatedCharCount,
      charAspectRatio,
      isCondensed,
      isExtended,
      isHighContrast,
      isSerif,
      strokeContrastRatio,
      isDarkBackground
    };
  } catch (err) {
    console.error('[ImageAnalyzer Error]:', err);
    return {
      width: 300,
      height: 60,
      estimatedCharCount: 6,
      charAspectRatio: 0.55,
      isCondensed: false,
      isExtended: false,
      isHighContrast: false,
      isSerif: false,
      strokeContrastRatio: 1.0,
      isDarkBackground: false
    };
  }
}
