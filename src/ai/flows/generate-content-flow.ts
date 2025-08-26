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

const analysisPrompt = ai.definePrompt({
  name: 'generateContentAnalysisPrompt',
  input: { schema: GenerateContentInputSchema },
  output: { schema: z.object({
    contentType: z.enum(['image', 'pdf', 'docx', 'unsupported']),
    prompt: z.string().describe('For an image, this is the generation prompt. For a document, this is the topic or subject.'),
    fileName: z.string().describe('A suitable filename for the generated content.'),
  }) },
  prompt: `You are an intelligent assistant that helps users generate content.
  Your task is to analyze the user's request and determine what kind of content they want to create (image, PDF, or DOCX).
  
  User Request: "{{{request}}}"
  
  - If the user asks for an image, set contentType to "image" and create a descriptive prompt for an image generation model.
  - If the user asks for a PDF or a text document (e.g., "summary", "report"), set contentType to "pdf". The prompt should be a clear topic for the document.
  - If the user asks for a Word document, set contentType to "docx". The prompt should be a clear topic for the document.
  - If the request is unclear or cannot be fulfilled, set contentType to "unsupported".
  - Finally, suggest a suitable filename.
  `,
});

const documentGenerationPrompt = ai.definePrompt({
    name: 'documentGenerationPrompt',
    input: { schema: z.object({
        topic: z.string(),
        dailyData: z.string(),
        monthlyData: z.string(),
    })},
    output: { format: 'text' },
    prompt: `You are a data analyst. Your task is to generate a detailed text document based on the provided topic and data.

    Topic: "{{{topic}}}"

    Available Data:
    - Daily Data Summary: Contains revenue and file uploads for the last year.
    - Monthly Data Summary: Contains aggregate revenue and file uploads.

    Based on the topic and the data, generate a well-structured and informative document.
    Use headings, lists, and clear paragraphs.
    If the topic is "summary of last month's revenue", provide a detailed breakdown and analysis.
    If the topic is "report on file uploads", analyze the trends and key statistics.
    Ensure the generated text is comprehensive and directly addresses the user's request.
    `,
});


const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async (input) => {
    const llmResponse = await analysisPrompt(input);
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

    // For documents, generate the actual content first
    const documentContentResponse = await documentGenerationPrompt({
        topic: analysis.prompt,
        dailyData: `Total ${MOCK_DATA.dailyData.length} days of data available.`,
        monthlyData: ` ${MOCK_DATA.monthlyData.length} months of data available from ${MOCK_DATA.monthlyData[0]?.date} to ${MOCK_DATA.monthlyData[MOCK_DATA.monthlyData.length-1]?.date}.`,
    });
    
    const documentText = documentContentResponse.text;

    if (analysis.contentType === 'pdf') {
        const doc = new jspdf();
        // Handle multi-line text properly
        const lines = doc.splitTextToSize(documentText, 180);
        doc.text(lines, 10, 10);
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
        const xmlText = documentText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>');
        zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
        zip.folder("_rels")?.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
        zip.folder("word")?.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${xmlText}</w:t></w:r></w:p></w:body></w:document>`);

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
