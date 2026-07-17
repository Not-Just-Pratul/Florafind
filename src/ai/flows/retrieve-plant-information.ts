/**
 * @fileOverview Retrieves detailed plant information using OpenRouter.
 *
 * - retrievePlantInformation - A function that retrieves detailed plant information.
 * - RetrievePlantInformationInput - The input type for the retrievePlantInformation function.
 * - RetrievePlantInformationOutput - The return type for the retrievePlantInformation function.
 */

import { openrouter, DEFAULT_MODEL } from '@/ai/openrouter';
import { z } from 'zod';

export const maxDuration = 120;

const RetrievePlantInformationInputSchema = z.object({
  plantName: z
    .string()
    .describe(
      'The name of the plant to retrieve information about.'
    ),
});

export type RetrievePlantInformationInput = z.infer<
  typeof RetrievePlantInformationInputSchema
>;

const RetrievePlantInformationOutputSchema = z.object({
  description: z.string(),
  uses: z.string(),
  benefits: z.string(),
  nativeRegions: z.string(),
  growingConditions: z.string(),
  isPoisonous: z.boolean(),
  toxicityDetails: z.string().optional(),
  regionalInsights: z.string(),
  medicinalApplications: z.string(),
});

export type RetrievePlantInformationOutput = z.infer<
  typeof RetrievePlantInformationOutputSchema
>;

export async function retrievePlantInformation(
  input: RetrievePlantInformationInput
): Promise<RetrievePlantInformationOutput> {
  const systemPrompt = `You are an expert botanist. Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.

The JSON must match this exact structure:
{
  "description": "string",
  "uses": "- Use 1\\n- Use 2\\n- Use 3",
  "benefits": "- Benefit 1\\n- Benefit 2",
  "nativeRegions": "string",
  "growingConditions": "string",
  "isPoisonous": true or false,
  "toxicityDetails": "string",
  "regionalInsights": "string",
  "medicinalApplications": "- Application 1\\n- Application 2"
}`;

  const response = await openrouter.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Provide detailed botanical information about: ${input.plantName}`,
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

  return RetrievePlantInformationOutputSchema.parse(parsed);
}