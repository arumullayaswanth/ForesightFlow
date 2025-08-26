// Basic DOCX to text converter usingjszip.
// This is a simplified implementation. For more complex documents, a more robust library might be needed.
import JSZip from 'jszip';

export async function docx2txt(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const content = await zip.file('word/document.xml')?.async('string');

    if (content) {
        // Basic XML parsing to extract text content
        const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return text;
    }
    return '';
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    throw new Error('Could not parse DOCX file.');
  }
}
