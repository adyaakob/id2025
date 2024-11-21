import path from 'path';
import PDFProcessor from './PDFProcessor';

async function main() {
    const pdfFiles = [
        {
            input: path.join(process.cwd(), 'knowledge_base', 'pdfs', 'product-brochure.pdf'),
            output: path.join(process.cwd(), 'knowledge_base', 'product-brochure.json')
        },
        {
            input: path.join(process.cwd(), 'knowledge_base', 'pdfs', 'company-profile.pdf'),
            output: path.join(process.cwd(), 'knowledge_base', 'company-profile.json')
        }
    ];

    for (const file of pdfFiles) {
        try {
            console.log(`Processing ${path.basename(file.input)}...`);
            await PDFProcessor.convertToJSON(file.input, file.output);
            console.log(`Successfully processed and saved to ${path.basename(file.output)}`);
        } catch (error) {
            console.error(`Error processing ${path.basename(file.input)}:`, error);
        }
    }
}

main().catch(console.error);
