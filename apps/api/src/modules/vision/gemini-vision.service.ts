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
Never guess random default fonts unless every microscopic detail matches 100%. Fashion banners, cosmetics, apparel, and modern e-commerce brands (such as Fabrilife, Zara, Mango) use signature geometric typefaces like Nexa, Urbanist, Campton, Mont, or Sofia Pro.

STEP 1: MICROSCOPIC GLYPH-BY-GLYPH FORENSICS:

1. Capital 'A' (CRITICAL APEX CHECK):
   - Is the apex a TRUNCATED FLAT-TOPPED PLATEAU (a flat horizontal cut at the top, e.g. Nexa, Urbanist, Campton, Mont, Avenir, Poppins)?
   - Or is the apex a SHARP POINTED TRIANGLE / NEEDLE (e.g. Futura, Century Gothic, Tenor Sans, Avant Garde)?
   - ⚠️ STRICT NEGATIVE CONSTRAINT: If capital 'A' has a FLAT-TOPPED horizontal plateau, you are STRICTLY FORBIDDEN from suggesting sharp-pointed fonts like Tenor Sans, Futura, or Century Gothic!

2. Lowercase 'a' (SINGLE-STOREY VS DOUBLE-STOREY):
   - Is it SINGLE-STOREY ('ɑ' - geometric circular bowl with vertical right stem, NO top hook)?
     * Check the bottom terminal of the stem:
       - Straight vertical baseline drop without tail or spur (e.g. Nexa, Urbanist, Futura, Campton).
       - Outward curved tail / spur (e.g. Sofia Pro, Comfortaa).
   - Or is it DOUBLE-STOREY ('a' - has a top curved hood/arc over the bowl, e.g. Gilroy, Poppins, Helvetica, Inter, Roboto)?
   - ⚠️ STRICT RULE: If lowercase 'a' is SINGLE-STOREY, NEVER suggest double-storey fonts (Gilroy, Poppins, Helvetica, Roboto, Inter)!

3. Letter 'e' (CRITICAL SERIF / CROSSBAR ANGLE CHECK):
   - Is the crossbar inside the eye of 'e' SLANTED / ANGLED DIAGONALLY upwards at ~15-25° (Venetian / Calligraphic luxury serif, e.g. Ogg Roman, Roslindale, Faustina, ITC Galliard)?
   - Or is it strictly FLAT HORIZONTAL (e.g. Cormorant Display, Didot, Bodoni, Playfair Display, Garamond)?
   - ⚠️ STRICT NEGATIVE CONSTRAINT: If the letter 'e' has a SLANTED / ANGLED diagonal crossbar, you are STRICTLY FORBIDDEN from suggesting fonts with flat horizontal crossbars (such as Cormorant Display, Didot, Bodoni, or Playfair)!

4. Capital 'N' (Serif junctions & contrast):
   - Check stroke contrast between thin vertical and thick diagonal, and bracketed serif terminals.

5. Signatures in Fashion, Apparel & Editorial Branding:
   - **For High-Contrast Luxury Display Serifs with angled 'e' crossbar (e.g. Fabrilife "Neith"):**
     1. **Ogg Roman** (Sharp Type) - Top signature luxury fashion serif with angled 'e' crossbar and calligraphic terminals.
     2. **Roslindale Display** (DJR) - High-contrast editorial serif with slanted 'e' crossbar.
     3. **Faustina** (Google Fonts) - Best free Google Font alternative with angled 'e' crossbar.
     4. **ITC Galliard** (ITC / Matthew Carter)
   - **For Geometric Sans with flat-topped 'A' + single-storey 'a' (e.g. Fabrilife "Aviana"):**
     1. **Nexa** (Fontfabric)
     2. **Urbanist** (Google Fonts)
     3. **Campton**
     4. **Mont**

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
    "glyphForensics": "Describe: (1) flat-topped vs pointed apex on 'A', (2) single-storey 'a' with straight drop vs curved tail, (3) sharp vertex on 'v', (4) circular dot on 'i'",
    "description": "Concise forensic summary of why this font was identified"
  },
  "matches": [
    {
      "family": "Exact font family name",
      "category": "sans-serif | display | serif",
      "source": "google | dafont | adobe | myfonts",
      "similarity": 98,
      "matchedFeatures": [
        "Truncated flat-topped horizontal apex on capital 'A'",
        "Single-storey lowercase 'a' with straight vertical drop",
        "Sharp acute bottom vertex on 'v'",
        "Circular tittle on 'i'"
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
