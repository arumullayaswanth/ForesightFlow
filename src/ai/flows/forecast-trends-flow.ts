
'use server';
/**
 * @fileOverview An AI data analyst that can forecast future trends.
 *
 * - forecastTrends - A function that handles forecasting.
 * - ForecastTrendsInput - The input type for the forecastTrends function.
 * - Forecast - The output type for a single forecast item.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ForecastTrendsInputSchema = z.object({
  monthlyData: z
    .string()
    .describe(
      'A JSON string representing an array of historical monthly data points. Each point includes date, files, and revenue.'
    ),
});
export type ForecastTrendsInput = z.infer<typeof ForecastTrendsInputSchema>;

const ForecastSchema = z.object({
    date: z.string().describe("The forecasted month and year (e.g., 'Jul 24')."),
    files: z.number().describe('The predicted number of file uploads for the month.'),
    revenue: z.number().describe('The predicted revenue for the month.'),
});
export type Forecast = z.infer<typeof ForecastSchema>;

const ForecastTrendsOutputSchema = z.array(ForecastSchema);


export async function forecastTrends(input: ForecastTrendsInput): Promise<Forecast[]> {
  const result = await forecastTrendsFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'forecastTrendsPrompt',
  input: { schema: ForecastTrendsInputSchema },
  output: { schema: ForecastTrendsOutputSchema },
  prompt: `You are an expert data scientist specializing in time-series forecasting.
  Your task is to predict file uploads and revenue for the next 3 months based on the provided historical data.

  Analyze the trends, seasonality, and any growth patterns in the historical data to make your predictions as accurate as possible.

  Historical Monthly Data:
  {{{monthlyData}}}

  Provide a forecast for the next 3 consecutive months following the last date in the historical data.
  Ensure the 'date' in your output follows the 'MMM yy' format (e.g., 'Aug 24').
  `,
});

const forecastTrendsFlow = ai.defineFlow(
  {
    name: 'forecastTrendsFlow',
    inputSchema: ForecastTrendsInputSchema,
    outputSchema: ForecastTrendsOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.output!;
  }
);
