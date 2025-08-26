'use server';
/**
 * @fileOverview An AI data analyst that can answer questions about ForesightFlow data and uploaded files.
 *
 * - askAi - A function that handles querying the data.
 * - AskAiInput - The input type for the askAi function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { docx2txt } from '@/lib/docx2txt';

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
  file: z.string().optional().describe("An optional file uploaded by the user, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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
  prompt: `You are an expert data analyst for an application called ForesightFlow. Your task is to answer user questions.

  Today's date is ${new Date().toLocaleDateString()}.

  You have access to two sources of information:
  1. Historical data about file uploads and revenue.
  2. A file that the user may have uploaded.

  Here is the available historical data:
  - Daily data for the last 365 days: {{{dailyData}}}
  - Monthly aggregate data: {{{monthlyData}}}

  {{#if file}}
  The user has also uploaded a file. Here is the content:
  {{{file}}}
  {{/if}}

  Based on all available information, please answer the following question:
  Question: "{{{question}}}"

  Provide a clear, concise, and friendly answer. If the question cannot be answered with the given data, explain why.
  When providing numerical answers related to revenue, format them in Indian Rupees (e.g., ₹1,23,456).
  If you are analyzing a document, summarize the key points relevant to the user's question.
  `,
});

const askAiFlow = ai.defineFlow(
  {
    name: 'askAiFlow',
    inputSchema: AskAiInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    let processedFileInput: string | undefined = input.file;

    if (input.file) {
      try {
        const [header, base64Data] = input.file.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        if (mimeType?.includes('pdf')) {
            const data = await pdf(buffer);
            processedFileInput = `File Type: PDF\nContent:\n${data.text}`;
        } else if (mimeType?.includes('image')) {
            // Let the prompt handle the image directly with the data URI
            processedFileInput = `{{media url="${input.file}"}}`;
        } else if (mimeType?.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            const text = await docx2txt(buffer);
            processedFileInput = `File Type: DOCX\nContent:\n${text}`;
        } else {
            // For other text-based files, just pass the content.
            // This is a simplification; more robust handling might be needed.
            processedFileInput = buffer.toString('utf-8');
        }
      } catch (e) {
        console.error("Error processing file:", e);
        return "Sorry, I was unable to process the uploaded file. It might be corrupted or in an unsupported format.";
      }
    }

    const llmResponse = await prompt({
      ...input,
      file: processedFileInput,
    });

    return llmResponse.text;
  }
);
