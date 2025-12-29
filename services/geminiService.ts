
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Chat haute performance optimisé pour le streaming temps réel.
 */
export const chatWithCyberExpertStream = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[],
  onChunk: (chunk: string) => void,
  image?: { data: string; mimeType: string },
  userContext?: string
) => {
  const model = 'gemini-3-flash-preview';
  
  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: h.parts
  }));

  const userParts: any[] = [{ text: message }];
  if (image) {
    userParts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }
  contents.push({ role: 'user', parts: userParts });

  const result = await ai.models.generateContentStream({
    model,
    contents,
    config: {
      systemInstruction: `Tu es CyberAI OS, une intelligence de pointe en cybersécurité. 
      CONTEXTE UTILISATEUR: ${userContext || 'Session Standard'}.
      STYLE: Futuriste, professionnel, très structuré.
      FORMATAGE: Utilise des titres clairs [ANALYSES], [VULNÉRABILITÉS], [ACTIONS].
      ÉLARGISSEMENT: Prends l'espace nécessaire pour expliquer les concepts complexes. Utilise des listes à puces.
      PAS D'ÉTOILES (*). Utilise des tirets ou des symboles cyber pour les listes.
      TON: Calme, expert, rassurant mais vigilant.`,
      temperature: 0.7,
      topP: 0.9,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  for await (const chunk of result) {
    const text = chunk.text;
    if (text) onChunk(text);
  }
};

/**
 * Synthèse de conversation ultra-rapide.
 */
export const summarizeConversation = async (
  history: { role: string; parts: { text: string }[] }[]
) => {
  const model = 'gemini-3-flash-preview';
  const conversationText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ 
      role: 'user', 
      parts: [{ text: `SYNTHÈSE AUDIT CYBER:\n\n${conversationText}` }] 
    }],
    config: {
      systemInstruction: "Expert Audit. Rapport technique structuré.",
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  
  return response.text?.replace(/\*/g, '').trim() || "Erreur de génération du rapport.";
};

/**
 * Génération de quiz optimisée avec JSON Schema.
 */
export const generateQuizQuestions = async (count: number, difficulty: string): Promise<Question[]> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: [{
      role: 'user',
      parts: [{ text: `Génère ${count} questions de cybersécurité (${difficulty}).` }]
    }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.9,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["id", "category", "difficulty", "text", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (e) {
    console.error("Quiz JSON error", e);
    return [];
  }
};

/**
 * Analyse SOC instantanée.
 */
export const analyzeSecurityLog = async (data: string, image?: { data: string; mimeType: string }) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      role: 'user', 
      parts: [
        { text: `ANALYSE SOC: ${data}` }, 
        ...(image ? [{ inlineData: { data: image.data, mimeType: image.mimeType }}] : [])
      ] 
    }],
    config: { 
      systemInstruction: "Expert SOC. Verdict rapide: Menace/Impact/Action.",
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text;
};
