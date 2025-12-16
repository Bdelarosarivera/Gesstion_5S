import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    // Determine mimeType (simplified assumption for base64 strings usually starting with data:image/...)
    const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';
    const data = base64Image.split(',')[1]; // Remove header

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let resultImage = '';
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            resultImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
        }
      }
    }

    if (!resultImage) {
        throw new Error("No image returned from Gemini. Ensure the prompt asks for an image modification.");
    }

    return resultImage;

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};
