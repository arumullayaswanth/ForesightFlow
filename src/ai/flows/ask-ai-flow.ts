'use server';
/**
 * @fileOverview An AI data analyst that can answer questions about ForesightFlow data.
 *
 * - askAi - A function that handles querying the data.
 * - AskAiInput - The input type for the askAi function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AskAiInputSchema = z.object({
  question: z.string().describe('The user question about the data.'),
  dailyData: z
    .string()
    .describe(
      'A JSON string representing an array of daily data points. Each point includes date, files, and revenue.'
    ),
  monthlyData: z
    .string()
    .describe(
      'A JSON string representing an array of monthly data points. Each point includes date, files, and revenue.'
    ),
});
export type AskAiInput = z.infer<typeof AskAiInputSchema>;

export async function askAi(input: AskAiInput): Promise<string> {
  const result = await askAiFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'askAiPrompt',
  input: { schema: AskAiInputSchema },
  output: { format: 'text' },
  prompt: `You are an expert data analyst for an application called ForesightFlow. Your task is to answer user questions based on the provided JSON data.

  Today's date is ${new Date().toLocaleDateString()}.

  Here is the available data:
  - Daily data for the last 365 days: {{{dailyData}}}
  - Monthly aggregate data: {{{monthlyData}}}

  Based on this data, please answer the following question:
  Question: "{{{question}}}"

  Provide a clear, concise, and friendly answer. If the question cannot be answered with the given data, explain why.
  When providing numerical answers related to revenue, format them in Indian Rupees (e.g., ₹1,23,456).`,
});

const askAiFlow = ai.defineFlow(
  {
    name: 'askAiFlow',
    inputSchema: AskAiInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.text;
  }
);
