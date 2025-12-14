import { GoogleGenAI } from "@google/genai";
import { KeywordData } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAsinsWithGemini = async (asins: string[]): Promise<KeywordData[]> => {
  const ai = getClient();
  const asinString = asins.join(", ");

  const prompt = `
    You are an expert Amazon SEO and PPC algorithm specialist.
    
    TASK:
    Perform a "Reverse ASIN" keyword analysis for the following Amazon ASINs: ${asinString}.
    
    Step 1: Use Google Search to identify what products these ASINs actually are (Title, Category, Niche). 
    CRITICAL: If you cannot find specific details for an ASIN (e.g. it doesn't exist or search fails), simply INFER the likely product category based on the ASIN format or assume it is a generic "Best Selling Product" in a random popular category (like Kitchen or Tech) and proceed. DO NOT STOP. DO NOT APOLOGIZE.
    
    Step 2: Generate a list of 30-40 highly relevant keywords based on the identified product niche.
    
    Step 3: Classify and Analyze each keyword based on the rules below.

    Output Format:
    You must output ONLY a valid JSON array.
    Do not output any introductory text (like "I have analyzed..." or "Here is the JSON").
    Do not output any markdown formatting (like \`\`\`json).
    Just start with [ and end with ].
    
    Each object in the array must match this structure exactly:
    {
      "term": "keyword phrase",
      "classification": "Attack" | "Support" | "Waste", 
      "intentScore": number (0-10),
      "competition": "Low" | "Medium" | "High",
      "searchVolumeEst": number,
      "isOrganic": boolean,
      "isSponsored": boolean,
      "asinOverlap": number,
      "recommendation": "Title" | "Bullets" | "Backend" | "PPC (Exact)" | "PPC (Phrase)" | "Negative" | "Ignore",
      "reasoning": "Short explanation"
    }

    Classification Rules:
    - Attack: High Buyer Intent (Score 8-10), Low/Medium Competition.
    - Support: Relevance builders, broad terms, indexing terms.
    - Waste: High traffic but low intent, or irrelevant terms.
    
    Recommendation Rules:
    - Choose the single best action for the seller.
    - Be specific: "PPC (Exact)" for high intent, "Negative" for waste.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1 // Lower temperature for stricter adherence to format
      }
    });

    if (response.text) {
      let jsonText = response.text;
      
      // Clean markdown code blocks if they appear despite instructions
      jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      // Extract array part
      const firstBracket = jsonText.indexOf('[');
      const lastBracket = jsonText.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        jsonText = jsonText.substring(firstBracket, lastBracket + 1);
        try {
          return JSON.parse(jsonText) as KeywordData[];
        } catch (e) {
          console.error("JSON Parse Error. Content was:", jsonText);
          throw new Error("Failed to parse keyword data. The AI returned invalid JSON.");
        }
      } else {
        // Fallback or Error if no JSON found
        console.error("No JSON array found in response:", response.text);
        throw new Error("The analysis did not return structured data. Please try again with different ASINs.");
      }
    }
    throw new Error("No data returned from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};