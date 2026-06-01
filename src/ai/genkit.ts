// This file is kept for Genkit dev tooling (genkit:dev / genkit:watch scripts).
// The actual AI calls use the openrouter client directly via src/ai/openrouter.ts.
import {genkit} from 'genkit';
import {openAI} from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
  model: 'openai/google/gemini-2.0-flash-001',
});
