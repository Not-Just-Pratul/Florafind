/**
 * @fileOverview Generates an image of a plant variation using Pollinations.ai (free, no API key required).
 *
 * - generatePlantVariation - A function that generates a plant variation image.
 * - GeneratePlantVariationInput - The input type for the generatePlantVariation function.
 * - GeneratePlantVariationOutput - The return type for the generatePlantVariation function.
 */

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

  // Use Pollinations.ai for free image generation (no API key required)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

  // Verify the image is accessible
  const response = await fetch(imageUrl, { method: 'HEAD' });
  if (!response.ok) {
    throw new Error('Image generation failed');
  }

  return { generatedImage: imageUrl };
}
