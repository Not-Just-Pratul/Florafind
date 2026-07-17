/**
 * @fileOverview Identifies a plant from an image using OpenRouter.
 *
 * - identifyPlantFromImage - A function that identifies a plant from an image.
 * - IdentifyPlantFromImageInput - The input type for the identifyPlantFromImage function.
 * - IdentifyPlantFromImageOutput - The return type for the identifyPlantFromImage function.
 */

import { openrouter, DEFAULT_MODEL } from '@/ai/openrouter';
import { z } from 'zod';

export const maxDuration = 120;

const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type IdentifyPlantFromImageInput = z.infer<
  typeof IdentifyPlantFromImageInputSchema
>;

const IdentifyPlantFromImageOutputSchema = z.object({
  scientificName: z.string(),
  commonName: z.string(),
  hindiName: z.string(),
  description: z.string(),
  uses: z.string(),
  benefits: z.string(),
  nativeRegion: z.string(),
  growingConditions: z.string(),
  isPoisonous: z.boolean(),
  toxicityDetails: z.string().optional(),
  confidence: z.number(),
});

export type IdentifyPlantFromImageOutput = z.infer<
  typeof IdentifyPlantFromImageOutputSchema
>;

export async function identifyPlantFromImage(
  input: IdentifyPlantFromImageInput
): Promise<IdentifyPlantFromImageOutput> {
  const systemPrompt = `You are an expert botanist. When given a plant image, respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.

The JSON must match this exact structure:
{
  "scientificName": "string",
  "commonName": "string",
  "hindiName": "string (or empty string if unknown)",
  "description": "string",
  "uses": "- Use 1\\n- Use 2\\n- Use 3",
  "benefits": "- Benefit 1\\n- Benefit 2",
  "nativeRegion": "string",
  "growingConditions": "string",
  "isPoisonous": true or false,
  "toxicityDetails": "string",
  "confidence": 0.0 to 1.0
}`;

  const response = await openrouter.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              systemPrompt +
              '\n\nIdentify the plant in this image and return the JSON described above.',
          },
          {
            type: 'image_url',
            image_url: {
              url: input.photoDataUri,
            },
          },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;

  if (!raw) {
    throw new Error('No response from OpenRouter');
  }

  // Strip any markdown code fences the model may have added
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  return IdentifyPlantFromImageOutputSchema.parse(parsed);
}