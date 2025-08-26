'use server';
/**
 * @fileOverview An AI data analyst that can detect anomalies in ForesightFlow data.
 *
 * - detectAnomalies - A function that handles anomaly detection.
 * - DetectAnomaliesInput - The input type for the detectAnomalies function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DetectAnomaliesInputSchema = z.object({
  dailyData: z
    .string()
    .describe(
      'A JSON string representing an array of daily data points for the last 30 days. Each point includes date, files, and revenue.'
    ),
  monthlyData: z
    .string()
    .describe(
      'A JSON string representing an array of monthly data points for the last 12 months. Each point includes date, files, and revenue.'
    ),
});
export type DetectAnomaliesInput = z.infer<typeof DetectAnomaliesInputSchema>;

const AnomalySchema = z.object({
    date: z.string().describe("The date or date range of the anomaly (e.g., '2024-07-28' or 'Jul 24')."),
    description: z.string().describe("A concise, human-readable description of the anomaly."),
    severity: z.enum(['low', 'medium', 'high']).describe("The estimated severity or impact of the anomaly."),
});

const DetectAnomaliesOutputSchema = z.array(AnomalySchema);
export type Anomaly = z.infer<typeof AnomalySchema>;

export async function detectAnomalies(input: DetectAnomaliesInput): Promise<Anomaly[]> {
  const result = await detectAnomaliesFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'detectAnomaliesPrompt',
  input: { schema: DetectAnomaliesInputSchema },
  output: { schema: DetectAnomaliesOutputSchema },
  prompt: `You are an expert data analyst for an application called ForesightFlow.
  Your task is to identify significant anomalies from the provided daily and monthly data.
  Focus on identifying unusual spikes or drops in file uploads or revenue that deviate from normal patterns.

  Today's date is ${new Date().toLocaleDateString()}.

  Here is the available historical data:
  - Daily data for the last 30 days: {{{dailyData}}}
  - Monthly data for the last 12 months: {{{monthlyData}}}

  Analyze this data and identify up to 3 of the most significant anomalies. For each anomaly, provide:
  1. The specific date or month.
  2. A concise description of what happened (e.g., "File uploads dropped by 50% compared to the weekly average.").
  3. A severity level (low, medium, high) based on the deviation from the norm.

  If there are no significant anomalies, return an empty array.
  `,
});

const detectAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAnomaliesFlow',
    inputSchema: DetectAnomaliesInputSchema,
    outputSchema: DetectAnomaliesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || [];
  }
);
