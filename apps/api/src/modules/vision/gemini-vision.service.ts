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

CRITICAL FORENSIC METHODOLOGY:
Do NOT guess popular default fonts (like Helvetica, Arial, or Roboto) unless every micro-detail matches 100%. Most modern streetwear, sportswear, tech, and poster designs use specialized modern geometric, athletic, or branding display typefaces.

STEP 1: GLYPH FORENSICS (Examine each visible letter individually):
1. Letter 'W':
   - Bottom vertices: Are they sharp pointed tips, angled points, or flat horizontal cuts?
   - Center apex: Does the center V meet at the top cap-height, or does it stop lower?
   - Diagonals: Do the strokes cross, join, or have uniform thickness?
2. Letter 'R':
   - Leg / Tail: Is the leg a STRAIGHT DIAGONAL stem (e.g. Montserrat, Gilroy, Gotham, DIN, Akira, Barlow, Integral CF, Futura)? Or is it a CURVED leg with a horizontal hook (e.g. Helvetica, Neue Haas Grotesk)?
   - Bowl: Where does the leg intersect the bowl?
3. Letter 'A':
   - Apex: Sharp pointed triangle apex, or blunt flat-cut top?
   - Crossbar: Low, centered, or high?
4. Letter 'E':
   - Terminal cuts: Are the top/bottom arm ends cut horizontally at 90°, vertically, or diagonally?
   - Middle arm: Is it significantly shorter or near equal?
5. Proportions & Category:
   - Is it modern athletic/sports, geometric sans, extended/wide display, or neo-grotesque?

STRICT NEGATIVE CONSTRAINT:
- If the letter 'R' has a STRAIGHT DIAGONAL leg, it CANNOT be Helvetica or Neue Haas Grotesk!
- If the letter 'W' has sharp points or center apex reaching full height, it CANNOT be Helvetica!
- In modern activewear / sportswear (like Fabrilife, Nike, Adidas posters), prioritize contemporary athletic & geometric fonts such as:
  Akira Expanded, Integral CF, Montserrat Bold, Gilroy Bold, Gotham Bold, Barlow Bold/Black, DIN 2014, Space Grotesk, Tusker Grotesk, Industry, Prompt, Nexa, Proxima Nova, Unbounded, Outfit, Syne, Cabinet Grotesk, Microgramma, Eurostile.

OUTPUT FORMAT: Return ONLY pure raw JSON (no markdown blocks, no preamble):
{
  "detectedText": "Exact text transcribed without error",
  "primaryFont": "Exact master commercial font or best matching typeface",
  "typographicAnalysis": {
    "category": "sans-serif",
    "width": "normal | expanded | condensed",
    "weight": "bold | black | heavy",
    "contrast": "low | monoline",
    "serifType": "none",
    "glyphForensics": "Describe the exact forensic shape of W vertices, R leg, and terminals",
    "description": "Concise forensic summary of why this font was identified"
  },
  "matches": [
    {
      "family": "Exact font family name",
      "category": "sans-serif | display | serif",
      "source": "google | dafont | adobe | myfonts",
      "similarity": 98,
      "matchedFeatures": [
        "Identical straight diagonal R leg",
        "Matching W vertex angle & apex height",
        "Exact athletic headline weighting",
        "Geometric terminal cuts"
      ],
      "downloadUrl": "specimen or download url",
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
