/**
 * @fileOverview Generates an image of a plant variation using the Flux image model via OpenRouter.
 *
 * - generatePlantVariation - A function that generates a plant variation image.
 * - GeneratePlantVariationInput - The input type for the generatePlantVariation function.
 * - GeneratePlantVariationOutput - The return type for the generatePlantVariation function.
 */

import { openrouter, IMAGE_MODEL } from '@/ai/openrouter';
import { z } from 'zod';

const GeneratePlantVariationInputSchema = z.object({
  plantName: z.string().describe('The name of the plant.'),
  variationDescription: z
    .string()
    .describe('A description of the desired visual variation (e.g., "in full bloom", "autumn colors", "as a sapling").'),
  originalPhotoDataUri: z
    .string()
    .optional()
    .describe('Optional. An original photo of the plant as a data URI for visual context.'),
});
export type GeneratePlantVariationInput = z.infer<typeof GeneratePlantVariationInputSchema>;

const GeneratePlantVariationOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe('A URL or base64 data URI of the generated plant variation image.'),
});
export type GeneratePlantVariationOutput = z.infer<typeof GeneratePlantVariationOutputSchema>;

export async function generatePlantVariation(
  input: GeneratePlantVariationInput
): Promise<GeneratePlantVariationOutput> {
  const prompt = `A high-quality botanical illustration of ${input.plantName}, ${input.variationDescription}. Detailed, realistic, natural lighting, vibrant colors, professional plant photography style.`;

  // OpenRouter image generation uses the images endpoint
  // AbortSignal.timeout gives a clean timeout instead of hanging indefinitely
  const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    signal: AbortSignal.timeout(120_000),
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
      'X-Title': 'FloraFind',
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation failed: ${error}`);
  }

  const data = await response.json();
  const imageUrl = data?.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('No image URL returned from image generation model');
  }

  return { generatedImage: imageUrl };
}
