import { GoogleGenAI } from '@google/genai';

export interface GeminiMatchItem {
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  source: 'google' | 'dafont' | 'adobe' | 'myfonts';
  similarity: number;
  matchedFeatures: string[];
  downloadUrl: string;
  previewUrl?: string;
}

export interface GeminiFontIdentificationResult {
  detectedText: string;
  primaryFont: string;
  typographicAnalysis: {
    category: string;
    width: string;
    weight: string;
    contrast: string;
    serifType: string;
    description: string;
  };
  matches: GeminiMatchItem[];
}

/**
 * World-class typographic visual font identification using Gemini Multimodal AI.
 * Recognizes exact text without OCR errors, and identifies the exact font family
 * and closest alternatives across Google Fonts, DaFont, Adobe Fonts, and MyFonts.
 */
export async function identifyFontWithGemini(
  base64Image: string,
  providedApiKey?: string,
  userCorrectedText?: string
): Promise<GeminiFontIdentificationResult | null> {
  const activeKey = providedApiKey || process.env.GEMINI_API_KEY;
  if (!activeKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are WhatTheFont / Fontastic AI, the world's most capable forensic typography identification engine.
Analyze this cropped image of text with microscopic typographic precision.
${userCorrectedText ? `User hint / corrected text: "${userCorrectedText}".` : ''}

CRITICAL FORENSIC METHODOLOGY & ZERO-HALLUCINATION RULES:
Never guess common default fonts (like Helvetica, Arial, Roboto, or standard Gilroy/Poppins) unless every microscopic detail matches 100%. Fashion banners, cosmetics, apparel, luxury, and streetwear brands deliberately use distinctive geometric, editorial, or fashion display typefaces with unique letterform traits.

STEP 1: MICROSCOPIC GLYPH-BY-GLYPH FORENSICS:

1. Letter 'a' (Lowercase) - CRITICAL FIRST CHECK:
   - Is it SINGLE-STOREY ('ɑ' - a clean circle or oval with a vertical right stem, NO top hook)?
     * Examples: Century Gothic, Futura, Sofia Pro, ITC Avant Garde, Nexa, Josefin Sans, Avenir, Tenor Sans, Product Sans, Comfortaa, Circular.
   - Or is it DOUBLE-STOREY ('a' - has a top curved hood/arc over the bowl)?
     * Examples: Gilroy, Poppins, Helvetica, Inter, Roboto, Gotham, Proxima Nova.
   - ⚠️ STRICT RULE: If the letter 'a' in the image is SINGLE-STOREY, you are STRICTLY FORBIDDEN from suggesting Gilroy, Poppins, Helvetica, Roboto, or Inter as matches!

2. Letter 'v' / 'V' & 'w' / 'W' (Vertices & Apex):
   - Bottom vertex of 'v'/'V': Is it an ULTRA-SHARP acute needle/pinpoint vertex? Or does it have a blunt, flat horizontal cut, or rounded corner?
   - Stroke weighting of 'v': Is the left stroke heavy and right stroke thin/hairline, or uniform monoline?
   - Vertices of 'w'/'W': Sharp points vs flat horizontal bases. Does the center vertex meet at the top cap-height, or remain lower?

3. Letter 'A' (Capital):
   - Apex: Sharp pointed needle apex (sharp triangle), blunt flat-top horizontal cut, or rounded?
   - Crossbar position: Low fashion crossbar (e.g. Josefin Sans, Tenor Sans, Century Gothic, Marcellus) vs centered crossbar?

4. Letter 'i' & 'j' (Tittle / Dot):
   - Shape of dot: Is it a perfect circular dot, a square/rectangular block, a diamond, or an oval?
   - Spacing: Does the dot float high above the stem or sit tight?

5. Letter 'R' & 'k' (Legs):
   - Is the leg of 'R' a STRAIGHT DIAGONAL stroke (e.g. Montserrat, Futura, Sofia, Avant Garde, DIN)?
   - Or is it a CURVED leg with a horizontal foot hook (e.g. Helvetica, Neue Haas)?

6. Letter 't':
   - Top cut: Flat horizontal cut, diagonal angle cut, or pointed?
   - Base: Does it curve to the right, or is it a straight vertical cross?

7. General Aesthetics & Foundries:
   - Fashion / Editorial / Luxury: Tenor Sans, Sofia Pro, Century Gothic, Josefin Sans, Futura, Avenir, Classico, Didot, Bodoni, Cormorant, Syne, Tan Aegean, Voyage, Playfair.
   - Streetwear / Athletic / Tech: Akira Expanded, Integral CF, Space Grotesk, Druk Wide, Tusker Grotesk, Microgramma, Orbitron, Prompt, Michroma.

OUTPUT FORMAT: Return ONLY pure raw JSON (no markdown blocks, no preamble):
{
  "detectedText": "Exact text transcribed without error",
  "primaryFont": "Exact master commercial font or best matching typeface",
  "typographicAnalysis": {
    "category": "sans-serif | serif | display",
    "width": "condensed | normal | expanded",
    "weight": "thin | light | regular | medium | bold | black",
    "contrast": "monoline | low | medium | high",
    "serifType": "none | bracketed | unbracketed | slab",
    "glyphForensics": "Describe specifically: (1) single vs double-storey 'a', (2) sharpness of 'v' vertex, (3) apex and crossbar of 'A', (4) dot of 'i'",
    "description": "Concise forensic summary of why this font was identified"
  },
  "matches": [
    {
      "family": "Exact font family name",
      "category": "sans-serif | display | serif",
      "source": "google | dafont | adobe | myfonts",
      "similarity": 98,
      "matchedFeatures": [
        "Single-storey lowercase 'a' with vertical right stem",
        "Ultra-sharp acute pinpoint bottom vertex on 'v'",
        "Pointed sharp apex on capital 'A'",
        "Matching geometric circular proportions"
      ],
      "downloadUrl": "direct specimen or download url",
      "previewUrl": "preview url"
    }
  ]
}`;

    // Attempt with gemini-3.6-flash (or fallback to gemini-3.7-flash)
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          prompt
        ]
      });
    } catch (modelErr) {
      console.warn('[Gemini Vision] gemini-3.6-flash failed, trying gemini-3.5-flash-lite:', modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          prompt
        ]
      });
    }

    const text = response.text || '';
    const cleanJson = text.replace(/^```json/im, '').replace(/```$/im, '').replace(/```/g, '').trim();
    const result: GeminiFontIdentificationResult = JSON.parse(cleanJson);

    console.log(`[Gemini Font Vision] Success! Primary: ${result.primaryFont}, Detected: "${result.detectedText}", Matches: ${result.matches?.length}`);
    return result;
  } catch (err) {
    console.error('[Gemini Font Vision Exception]:', err);
    return null;
  }
}
