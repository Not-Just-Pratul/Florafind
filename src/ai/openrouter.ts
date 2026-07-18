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

// Default vision-capable model for plant identification and text tasks.
// google/gemma-4-31b-it: vision capable, $0.10/M input — very cheap and no strict rate limits.
export const DEFAULT_MODEL = 'google/gemma-4-31b-it';

// Image generation model via OpenRouter.
// black-forest-labs/flux.2-klein-4b: affordable, fast Flux model for plant visual variations.
export const IMAGE_MODEL = 'black-forest-labs/flux.2-klein-4b';
