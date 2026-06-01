import OpenAI from 'openai';

// Shared OpenRouter client
// timeout is in milliseconds — 120s covers slow vision/image models
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 120_000,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
    'X-Title': 'FloraFind',
  },
});

// Default vision-capable model for plant identification and text tasks
export const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

// Image generation model via OpenRouter
export const IMAGE_MODEL = 'black-forest-labs/flux.2-klein-4b';
