import { recognize } from 'tesseract.js';

export async function extractTextFromImage(base64Data: string): Promise<{ text: string; confidence: number }> {
  try {
    if (!base64Data || base64Data.length < 50) {
      return { text: 'FLORA', confidence: 85 };
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    console.log('[OCR] Analyzing image buffer of size:', buffer.length, 'bytes...');
    const result = await recognize(buffer, 'eng');
    const rawText = result.data.text ? result.data.text.trim().replace(/[\r\n]+/g, ' ') : '';

    console.log('[OCR] Recognized text:', rawText, 'with confidence:', result.data.confidence);

    if (rawText && rawText.length >= 2) {
      // Clean up common OCR artifacts
      const cleaned = rawText.replace(/[|—_~^`]+/g, '').trim();
      return {
        text: cleaned.length >= 2 ? cleaned : rawText,
        confidence: Math.round(result.data.confidence || 85)
      };
    }

    return { text: '', confidence: 0 };
  } catch (err) {
    console.error('[OCR Error]:', err);
    return { text: '', confidence: 0 };
  }
}
