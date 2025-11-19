import { GoogleGenAI, Type } from "@google/genai";
import { DreamAnalysis } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes audio using Gemini 2.5 Flash to get transcription and interpretation.
 */
export const analyzeDreamAudio = async (audioBase64: string): Promise<DreamAnalysis> => {
  try {
    const prompt = `
      You are an expert dream analyst and Jungian psychologist.
      1. Transcribe the following spoken dream report exactly.
      2. Identify the core emotional theme (a concise phrase suitable for image generation).
      3. Provide a psychological interpretation based on Jungian archetypes.

      Return the result in valid JSON format conforming to the specified schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm', // Assuming WebM from MediaRecorder
              data: audioBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            emotionalTheme: { type: Type.STRING },
            interpretation: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                archetypes: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                psychologicalMeaning: { type: Type.STRING }
              }
            }
          },
          required: ['transcription', 'emotionalTheme', 'interpretation']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");
    
    return JSON.parse(jsonText) as DreamAnalysis;
  } catch (error) {
    console.error("Error analyzing dream audio:", error);
    throw error;
  }
};

/**
 * Generates a surrealist image using Imagen 3 based on the theme.
 */
export const generateDreamImage = async (theme: string, details: string): Promise<string> => {
  try {
    const prompt = `A surrealist oil painting style masterpiece, reminiscent of Dali or Magritte. 
    Theme: ${theme}. 
    Context: ${details.slice(0, 200)}.
    The image should be dreamlike, symbolic, and emotionally resonant. High detail, 4k.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) throw new Error("No image generated");

    return `data:image/jpeg;base64,${imageBytes}`;
  } catch (error) {
    console.error("Error generating dream image:", error);
    // Return a fallback placeholder if image generation fails, to not break the flow
    return `https://picsum.photos/1024/1024?blur=2`;
  }
};

/**
 * Chat with the dream analyst using Gemini 3 Pro Preview.
 */
export const createDreamChat = (initialContext: DreamAnalysis) => {
  const systemInstruction = `
    You are a wise and empathetic dream analyst specializing in Jungian psychology.
    You have just analyzed a user's dream.
    
    Dream Transcript: "${initialContext.transcription}"
    Interpretation Summary: "${initialContext.interpretation.summary}"
    Archetypes Identified: ${initialContext.interpretation.archetypes.join(', ')}
    
    Your goal is to help the user explore their dream deeper. Answer follow-up questions, explain symbols, and help them find personal meaning.
    Be concise but profound.
  `;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });
};