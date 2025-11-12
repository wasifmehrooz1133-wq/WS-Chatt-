

import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Suggestion, GroundingSource } from "../types";

interface AiResponse {
  text: string;
  suggestions?: Suggestion[];
  groundingSources?: GroundingSource[];
}

const getAiClient = () => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set. Using mock service.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// ===================== MOCK IMPLEMENTATION =====================
const generateMockResponse = async (prompt: string): Promise<AiResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { text: `Mock response for: "${prompt}"` };
};

// ===================== GEOLOCATION HELPER =====================
const getUserLocation = (): Promise<{ latitude: number, longitude: number } | null> => {
    return new Promise(resolve => {
        if (!navigator.geolocation) {
            resolve(null);
        }
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }),
            () => resolve(null)
        );
    });
};

// ===================== API IMPLEMENTATIONS =====================

export const generateAiResponse = async (prompt: string, systemInstruction?: string): Promise<AiResponse> => {
  const ai = getAiClient();
  if (!ai) return generateMockResponse(prompt);

  try {
    const location = await getUserLocation();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        tools: [{ googleMaps: {} }],
        ...(location && {
            toolConfig: {
                retrievalConfig: { latLng: location }
            }
        })
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources: GroundingSource[] = groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.maps?.title || chunk.web?.title || 'Source',
        uri: chunk.maps?.uri || chunk.web?.uri,
      }))
      .filter((source: any) => source.uri);

    return { text: response.text, groundingSources };
  } catch (error) {
    console.error("AI service error:", error);
    return { text: "Sorry, I'm having trouble connecting to the AI service right now." };
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        await new Promise(r => setTimeout(r, 1000));
        return "https://picsum.photos/seed/mock-image/512/512"; // mock response
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Image generation error:", error);
        throw new Error("Failed to generate image.");
    }
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        await new Promise(r => setTimeout(r, 1000));
        return imageBase64; // mock response
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageBase64.split(',')[1], mimeType } },
                    { text: prompt },
                ],
            },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        throw new Error("No image data in response.");
    } catch (error) {
        console.error("Image editing error:", error);
        throw new Error("Failed to edit image.");
    }
};

export const generateVideo = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    // Per Veo guidelines, create a new instance right before the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    if (!process.env.API_KEY) {
        await new Promise(r => setTimeout(r, 1000));
        // Return a stock video as a mock response
        return "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
    }

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: { imageBytes: imageBase64.split(',')[1], mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio,
            },
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation succeeded but no URI was returned.");
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Video generation error:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found")) {
            throw new Error("API key is invalid. Please select a valid key.");
        }
        throw new Error("Failed to generate video.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not available");

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data in TTS response.");
        return base64Audio;
    } catch (error) {
        console.error("TTS generation error:", error);
        throw new Error("Failed to generate speech.");
    }
};
