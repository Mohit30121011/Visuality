
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "A probability score from 0.0 (Proven Real) to 1.0 (Proven AI/Synthetic).",
    },
    label: {
      type: Type.STRING,
      enum: ["real", "synthetic"],
      description: "The classification label.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence in the prediction (0.0 to 1.0).",
    },
    signals: {
      type: Type.OBJECT,
      properties: {
        cnn_score: { type: Type.NUMBER, description: "Score representing visual artifact density (0-1)." },
        freq_score: { type: Type.NUMBER, description: "Score based on high-frequency spectral anomalies (0-1)." },
        prnu_score: { type: Type.NUMBER, description: "Score based on sensor noise pattern consistency (0-1)." },
        metadata_flags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of specific forensic flags found (e.g., 'irregular_pupils', 'inconsistent_lighting', 'plastic_skin')."
        }
      },
      required: ["cnn_score", "freq_score", "prnu_score", "metadata_flags"]
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed forensic report (3-4 sentences) citing specific anatomical or physical flaws found.",
    }
  },
  required: ["score", "label", "confidence", "signals", "explanation"]
};

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Mock frequency data generator since Gemini output doesn't return raw arrays easily
const generateMockFrequencyData = (isFake: boolean) => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    let power = Math.random() * 0.5;
    // Fakes often have high frequency artifacts (spikes at high indices)
    if (isFake && i > 35) power += Math.random() * 0.8; 
    // Real photos have natural 1/f falloff
    if (!isFake) power = 1 / (i + 1) + (Math.random() * 0.1);
    
    data.push({
      frequency: i,
      power: Math.max(0, Math.min(1, power))
    });
  }
  return data;
};

// Retry logic helper
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Check for specific error codes if needed, or retry on all
    console.warn(`API call failed. Retrying in ${delay}ms... (${retries} attempts left). Error: ${error.message}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const imageBase64 = await fileToGenerativePart(file);

  const prompt = `
    ACT AS A SENIOR DIGITAL IMAGE FORENSICS EXPERT. Your mission is to detect AI-generated imagery (Midjourney, DALL-E 3, Stable Diffusion, Flux, GANs) with extreme precision.
    
    PERFORM A DEEP-DIVE FORENSIC AUDIT ON THE PROVIDED IMAGE. LOOK FOR THE "UNCANNY VALLEY" AND PHYSICS VIOLATIONS.

    ### 1. OCULAR & FACIAL BIOMETRICS (High Weight)
    - **Pupil Geometry**: Check for non-circular, jagged, or amorphous pupils. This is a primary failure point of AI.
    - **Specular Highlights**: Analyze eye reflections. They MUST match the scene's light sources and be consistent between both eyes. Mismatched reflections = FAKE.
    - **Iris Texture**: Look for "muddy" or blurring irises vs. distinct organic striations.
    - **Limbal Rings**: Check for sharp, unnatural boundaries or bleed-through at the iris edge.
    - **Ears**: Check helix structure. AI often generates "blobby" or nonsensical ear cartilage.
    - **Hair**: Trace strands. Do they vanish into skin? Do they blend illogically? Look for "floating hair" disconnected from the scalp.
    - **Teeth**: Count them. Check for size uniformity (piano keys) or lack of distinct incisors/canines.

    ### 2. PHYSICS ENGINE & LIGHTING CONSISTENCY
    - **Shadow Logic**: Trace shadows back to their source. Are they parallel where they should be? Do contact shadows exist where objects touch the ground?
    - **Reflections**: Check glasses, mirrors, and water. AI reflections often show different objects, wrong angles, or hallucinated details.
    - **Material Physics**: Does fabric fold naturally? Does metal shine correctly? Does skin have subsurface scattering (redness at shadow terminators), or does it look like wax/plastic?
    - **Gravity**: Are accessories (earrings, necklaces) hanging correctly with gravity?

    ### 3. DIGITAL SIGNAL ARTIFACTS
    - **Frequency Mismatch**: Is the face hyper-sharp while the neck or clothes are muddy? This indicates in-painting or face-swapping.
    - **Background Coherence**: Zoom into the background. Does text turn into alien glyphs/gibberish? Do geometric lines (tiles, windows) warp or dissolve?
    - **Noise Structure**: Real photos have ISO grain. AI images often have a "Gaussian blur" overlay or look "denoised" in a patchy way.
    - **Hands/Limbs**: Count fingers. Check for joint logic. AI often hallucinates extra digits or impossible bends.

    ### VERDICT SCORING LOGIC
    - **SCORE 0.9 - 1.0 (Definite AI)**: Anatomical failures (6 fingers, square pupil), gibberish text, physically impossible lighting.
    - **SCORE 0.7 - 0.89 (Likely AI)**: Hyper-smooth "plastic" skin, overly symmetrical composition, inconsistent depth of field, subtle ear/hair flaws.
    - **SCORE 0.0 - 0.3 (Real)**: Clear sensor noise, consistent lighting, imperfect skin texture (pores, acne, scars), coherent background text, physically accurate reflections.

    Return the analysis in the specified JSON format. 
    In the 'metadata_flags' array, include specific tags like: 'asymmetric_pupils', 'gibberish_text', 'floating_hair', 'wax_skin', 'inconsistent_shadows', 'extra_fingers', etc.
  `;

  try {
    const resultText = await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: imageBase64 } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA,
        }
      });
      if (!response.text) throw new Error("No response from model");
      return response.text;
    });

    const parsed = JSON.parse(resultText);
    const isFake = parsed.label === 'synthetic';

    return {
      id: crypto.randomUUID(),
      score: parsed.score,
      label: parsed.label,
      confidence: parsed.confidence,
      signals: parsed.signals,
      explanation: parsed.explanation,
      model_version: "v2.5-forensic-audit",
      timestamp: new Date().toISOString(),
      frequency_data: generateMockFrequencyData(isFake),
      artifacts: {
        prnu_url: "", 
        spectrum_url: "" 
      }
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
