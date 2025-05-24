import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

interface GeneratePlanResponse {
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    order: number;
  }>;
}

export async function generateResponse(prompt: string): Promise<string> {


const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generatePlan(prompt: string): Promise<GeneratePlanResponse | null> {
  try {
    const systemPrompt = `
      Create a structured plan based on the user's request. 
      Format your response as a JSON object with the following structure:
      {
        "title": "Brief, descriptive title",
        "description": "Overview of the plan",
        "steps": [
          {
            "title": "Step title",
            "description": "Detailed explanation",
            "order": number
          }
        ]
      }
    `;
    
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    console.log(response,'response')
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]) as GeneratePlanResponse;
  } catch (error) {
    console.error('Error generating plan:', error);
    return null;
  }
}