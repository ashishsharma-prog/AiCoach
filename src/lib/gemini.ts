import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// if (!apiKey) {
//   throw new Error('Missing Gemini API key');
// }

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

export async function generatePlan(
    prompt: string
): Promise<GeneratePlanResponse | null> {
    try {
        // Validate input
        if (!prompt || prompt.trim().length === 0) {
            console.error('Error: Empty prompt provided');
            return null;
        }

        // Check if model is initialized
        if (!model) {
            console.error('Error: Model is not initialized');
            return null;
        }

        const systemPrompt = `
You are a helpful assistant that creates structured plans. Please respond with ONLY a valid JSON object, no additional text or markdown formatting.

Create a structured plan based on the user's request using this exact format:
{
  "title": "Brief, descriptive title",
  "description": "Overview of the plan",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed explanation",
      "order": 1
    }
  ]
}

Important: Return only the JSON object, no other text.`;

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `${systemPrompt}\n\nUser request: ${prompt}`,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        });

        const response = await result.response;

        // Check if response exists
        if (!response) {
            console.error('Error: No response received from model');
            return null;
        }

        const text = response.text();

        // Log the raw response for debugging
        console.log('Raw response:', text);

        if (!text || text.trim().length === 0) {
            console.error('Error: Empty response text');
            return null;
        }

        // Clean the response text
        let cleanedText = text.trim();

        // Remove markdown code blocks if present
        cleanedText = cleanedText
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '');

        // Try to extract JSON - look for the first complete JSON object
        let jsonMatch = cleanedText.match(/\{[\s\S]*?\}(?=\s*$)/);

        if (!jsonMatch) {
            // Try alternative patterns
            jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        }

        if (!jsonMatch) {
            console.error(
                'Error: No JSON object found in response:',
                cleanedText
            );
            return null;
        }

        let jsonString = jsonMatch[0];

        // Basic JSON validation and cleanup
        try {
            // Remove any trailing commas before closing brackets/braces
            jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');

            const parsed = JSON.parse(jsonString) as GeneratePlanResponse;

            // Validate the structure
            if (
                !parsed.title ||
                !parsed.description ||
                !Array.isArray(parsed.steps)
            ) {
                console.error('Error: Invalid plan structure:', parsed);
                return null;
            }

            // Validate steps
            for (let i = 0; i < parsed.steps.length; i++) {
                const step = parsed.steps[i];
                if (
                    !step.title ||
                    !step.description ||
                    typeof step.order !== 'number'
                ) {
                    console.error(
                        `Error: Invalid step structure at index ${i}:`,
                        step
                    );
                    return null;
                }
            }

            return parsed;
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.error('JSON string that failed to parse:', jsonString);
            return null;
        }
    } catch (error) {
        console.error('Error generating plan:', error);

        // More specific error handling
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return null;
    }
}

// Alternative function with retry logic
export async function generatePlanWithRetry(
    prompt: string,
    maxRetries: number = 3
): Promise<GeneratePlanResponse | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Attempt ${attempt} of ${maxRetries}`);

        const result = await generatePlan(prompt);

        if (result) {
            return result;
        }

        if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    console.error(`Failed to generate plan after ${maxRetries} attempts`);
    return null;
}

// Test function to validate your setup
export async function testModelConnection(): Promise<boolean> {
    try {
        if (!model) {
            console.error('Model is not initialized');
            return false;
        }

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: "Respond with just the word 'test'",
                        },
                    ],
                },
            ],
        });

        const response = await result.response;
        const text = response.text();

        console.log('Test response:', text);
        return text.trim().toLowerCase().includes('test');
    } catch (error) {
        console.error('Model connection test failed:', error);
        return false;
    }
}
