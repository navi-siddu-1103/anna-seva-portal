'use server';
/**
 * @fileOverview Personalized grocery recommendations flow for ration card holders.
 *
 * - getPersonalizedRecommendations - A function that returns personalized grocery recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  purchaseHistory: z
    .string()
    .describe("The user's past purchase history as a JSON string."),
  regionalAvailability: z
    .string()
    .describe('The regional availability of grocery items as a JSON string.'),
  currentSeason: z.string().describe('The current season.'),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Personalized grocery item recommendations.'),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized grocery recommendations based on user's purchase history, regional availability, and the current season.

  Purchase History: {{{purchaseHistory}}}
  Regional Availability: {{{regionalAvailability}}}
  Current Season: {{{currentSeason}}}

  Provide concise and relevant grocery item recommendations.
  Respond in a simple string format.`, // Changed from JSON format.
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
