'use server';
/**
 * @fileOverview An AI content generator that can create images, PDFs, and Word documents.
 *
 * - generateContent - A function that handles the content generation process.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The output type for the generateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import jspdf from 'jspdf';
import JSZip from 'jszip';
import { MOCK_DATA } from '@/lib/mock-data';

const GenerateContentInputSchema = z.object({
  request: z.string().describe('The user request for content generation.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  fileDataUri: z.string().describe("The generated content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  fileName: z.string().describe('The suggested file name for the generated content.'),
  type: z.enum(['image', 'pdf', 'docx']).describe('The type of content generated.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  const result = await generateContentFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: { schema: GenerateContentInputSchema },
  output: { schema: z.object({
    contentType: z.enum(['image', 'pdf', 'docx', 'unsupported']),
    prompt: z.string().describe('The detailed prompt for the image/document content.'),
    fileName: z.string().describe('A suitable filename for the generated content.'),
  }) },
  prompt: `You are an intelligent assistant that helps users generate content.
  Your task is to determine what kind of content the user wants to create (image, PDF, or DOCX) based on their request.
  You also need to formulate a detailed prompt for the content generation and suggest a filename.

  User Request: "{{{request}}}"
  
  If the user asks for an image, set contentType to "image" and create a descriptive prompt for an image generation model.
  If the user asks for a PDF or a text document summary, set contentType to "pdf".
  If the user asks for a Word document, set contentType to "docx".
  If the request is unclear or cannot be fulfilled, set contentType to "unsupported".

  The content for documents should be based on the provided ForesightFlow data.
  Daily Data Summary: Total ${MOCK_DATA.dailyData.length} days of data available.
  Monthly Data Summary: ${MOCK_DATA.monthlyData.length} months of data available from ${MOCK_DATA.monthlyData[0]?.date} to ${MOCK_DATA.monthlyData[MOCK_DATA.monthlyData.length-1]?.date}.
  `,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const analysis = llmResponse.output;

    if (!analysis || analysis.contentType === 'unsupported') {
      throw new Error('Unsupported content generation request.');
    }

    if (analysis.contentType === 'image') {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: analysis.prompt,
      });
      if (!media.url) {
        throw new Error('Image generation failed.');
      }
      return {
        fileDataUri: media.url,
        fileName: `${analysis.fileName}.png`,
        type: 'image',
      };
    }

    if (analysis.contentType === 'pdf') {
        const doc = new jspdf();
        doc.text(analysis.prompt, 10, 10);
        const pdfData = doc.output('datauristring');
        return {
            fileDataUri: pdfData,
            fileName: `${analysis.fileName}.pdf`,
            type: 'pdf',
        };
    }
    
    if (analysis.contentType === 'docx') {
        const zip = new JSZip();
        // A very basic DOCX structure
        zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
        zip.folder("_rels")?.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
        zip.folder("word")?.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${analysis.prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p></w:body></w:document>`);

        const docxContent = await zip.generateAsync({ type: "base64" });
        
        return {
            fileDataUri: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxContent}`,
            fileName: `${analysis.fileName}.docx`,
            type: 'docx',
        };
    }

    throw new Error('Something went wrong during content generation.');
  }
);
