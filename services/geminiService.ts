
import { GoogleGenAI, Type } from "@google/genai";
import { StoryBook, StoryPage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateStoryOutline(prompt: string, genre: string): Promise<StoryBook> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Buatlah buku cerita pendek dalam Bahasa Indonesia berdasarkan petunjuk ini: "${prompt}". Genre: ${genre}. 
    Berikan hasil dalam format JSON yang berisi:
    1. title: Judul cerita yang menarik.
    2. author: Nama penulis (bisa anonim).
    3. genre: Genre cerita.
    4. pages: Daftar minimal 5 halaman, maksimal 8 halaman. Setiap halaman berisi:
       - pageNumber: nomor urut.
       - content: Narasi cerita yang mendalam (sekitar 3-5 kalimat).
       - imagePrompt: Deskripsi visual mendetail dalam Bahasa Inggris untuk ilustrasi halaman ini (gaya buku gambar anak yang artistik).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          genre: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pageNumber: { type: Type.NUMBER },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["pageNumber", "content", "imagePrompt"]
            }
          }
        },
        required: ["title", "author", "genre", "pages"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as StoryBook;
}

export async function generatePageImage(imagePrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Children's storybook illustration, whimsical, soft colors, high quality, artistic style: ${imagePrompt}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Gagal menghasilkan gambar");
}
