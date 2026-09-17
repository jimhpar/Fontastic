import { GoogleGenAI } from '@google/genai';
import { FontSource } from '@fontastic/shared-types';

export interface GeminiMatchItem {
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  source: FontSource;
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
 * Cross-references the full typographic universes of:
 * - Fontshare (Indian Type Foundry)
 * - DaFont / DaFontFree (40,000+ fonts)
 * - BeFonts & Unblast
 * - Awwwards Collections
 * - Google Fonts (1,700+ families)
 * - High-end Foundries (Sharp Type, Fontfabric, DJR, Pangram Pangram, Linotype, Monotype)
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
${userCorrectedText ? `User hint / transcribed text: "${userCorrectedText}".` : ''}

SEARCH UNIVERSE:
You must search across the ENTIRE font universes of:
1. Fontshare (https://www.fontshare.com/ - Satoshi, Clash Display, Cabinet Grotesk, General Sans, Switzer, Ranade, Zodiak, Boska, Chillax, Melodrama, etc.)
2. DaFont & DaFontFree (https://www.dafontfree.io/ / https://www.dafont.com/ - Nexa, Campton, Mont, Cera Pro, Gilroy, Akira Expanded, Integral CF, Lemon Milk, The Bold Font, Caviar Dreams, Coolvetica)
3. BeFonts & Unblast (https://befonts.com/ & https://unblast.com/ - Ogg, Roslindale, Tan Aegean, Voyage, Formula, Mirtha Display, Blenny)
4. Awwwards Collections (Neue Montreal, Neue Machina, Monument Extended, Editorial New, Woodland)
5. Google Fonts (Urbanist, Faustina, Plus Jakarta Sans, Outfit, Syne, Tenor Sans, Space Grotesk, Cinzel, Prata, Bodoni Moda, Cormorant Garamond, Marcellus)
6. Modern Type Foundries (Sharp Type, Fontfabric, DJR, Pangram Pangram, Linotype, Monotype, Commercial Type, Lineto)

STEP 1: MICROSCOPIC GLYPH ISOLATION & REJECTION RULES:
For EVERY visible letter in the image, you must strictly test:

1. Capital 'A' (APEX & CROSSBAR):
   - Is the apex a TRUNCATED FLAT-TOPPED PLATEAU (horizontal cut at the top, like Nexa, Urbanist, Campton, Mont, Avenir, Poppins)?
   - Or is it a SHARP POINTED TRIANGLE / NEEDLE (like Futura, Century Gothic, Tenor Sans, Avant Garde)?
   - ⚠️ REJECTION RULE: If 'A' has a FLAT-TOPPED plateau, REJECT Futura, Century Gothic, and Tenor Sans!

2. Lowercase 'a' (SINGLE-STOREY VS DOUBLE-STOREY):
   - Is it SINGLE-STOREY ('ɑ' - circle with vertical right stem, no top hood)?
     * Terminal check: Does it drop straight to the baseline WITHOUT a tail (Nexa, Urbanist, Campton, Futura), or does it curve out into a spur/tail (Sofia Pro, Comfortaa)?
   - Or is it DOUBLE-STOREY ('a' - has a top curved hood/arc over the bowl, like Gilroy, Poppins, Helvetica, Inter, Roboto)?
   - ⚠️ REJECTION RULE: If 'a' is SINGLE-STOREY, REJECT Gilroy, Poppins, Helvetica, Roboto, and Inter!

3. Lowercase 'e' (CROSSBAR ANGLE):
   - Is the crossbar inside the eye of 'e' SLANTED / ANGLED DIAGONALLY upwards at ~15-25° (Venetian/calligraphic luxury serif, like Ogg Roman, Roslindale, Faustina, ITC Galliard)?
   - Or is it strictly FLAT HORIZONTAL (like Cormorant Display, Didot, Bodoni, Playfair Display, Garamond)?
   - ⚠️ REJECTION RULE: If 'e' has a SLANTED / ANGLED crossbar, REJECT Cormorant Display, Didot, Bodoni, and Playfair Display!

4. Lowercase 'v' & 'V':
   - Bottom vertex: Sharp acute needle convergence vs blunt shelf vs rounded curve.

5. Lowercase 'i' & 'j':
   - Tittle: Round circular dot vs square block vs diamond.

6. Capital 'N':
   - Contrast between thin vertical and thick diagonal; bracketed serifs.

OUTPUT FORMAT:
Return ONLY pure raw JSON (no markdown formatting blocks, no extra commentary):
{
  "detectedText": "Exact text transcribed without error",
  "primaryFont": "Exact master font or closest visual twin from the libraries",
  "typographicAnalysis": {
    "category": "sans-serif | serif | display",
    "width": "condensed | normal | expanded",
    "weight": "thin | light | regular | medium | bold | black",
    "contrast": "monoline | low | medium | high",
    "serifType": "none | bracketed | unbracketed | slab",
    "glyphForensics": "Concise forensic breakdown of specific glyphs (A apex, a storey, e crossbar angle, v vertex, i tittle)",
    "description": "Why this specific font was matched"
  },
  "matches": [
    {
      "family": "Exact font family name",
      "category": "sans-serif | serif | display",
      "source": "fontshare | befonts | unblast | dafont | google | adobe | myfonts",
      "similarity": 98,
      "matchedFeatures": [
        "Identical anatomical feature 1",
        "Identical anatomical feature 2",
        "Identical anatomical feature 3",
        "Identical anatomical feature 4"
      ],
      "downloadUrl": "Direct specimen/download URL on Fontshare, DaFontFree, BeFonts, Unblast, Google Fonts, or Foundry",
      "previewUrl": "Direct specimen link"
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
