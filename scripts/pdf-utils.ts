const fs = require('fs');
const pathModule = require('path');
const pdfParse = require('pdf-parse');

interface ProcessedPDF {
    title: string;
    content: string;
    sections: Array<{
        title: string;
        content: string;
        pageNumber: number;
    }>;
}

interface Section {
    title: string;
    content: string[];
    pageNumber: number;
}

interface PDFContent {
    title: string;
    type: string;
    lastUpdated: string;
    sections: Array<{
        title: string;
        content: string;
        pageNumber: number;
    }>;
}

async function processPDFContent(filePath: string): Promise<ProcessedPDF> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Basic text processing
    const content = data.text;
    const fileName = pathModule.basename(filePath, '.pdf');
    
    // Simple section detection (based on newlines and potential headers)
    const sections: Section[] = [];
    const lines = content.split('\n').filter((line: string) => line.trim());
    let currentSection: Section = {
        title: '',
        content: [],
        pageNumber: 1
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Heuristic for detecting section headers (uppercase lines with reasonable length)
        if (line === line.toUpperCase() && line.length > 3 && line.length < 50) {
            // Save previous section if it has content
            if (currentSection.title && currentSection.content.length > 0) {
                sections.push({
                    title: currentSection.title,
                    content: currentSection.content,
                    pageNumber: currentSection.pageNumber
                });
            }
            
            // Start new section
            currentSection = {
                title: line,
                content: [],
                pageNumber: Math.floor(i / 40) + 1 // Rough page estimation
            };
        } else {
            currentSection.content.push(line);
        }
    }
    
    // Add the last section
    if (currentSection.title && currentSection.content.length > 0) {
        sections.push({
            title: currentSection.title,
            content: currentSection.content,
            pageNumber: currentSection.pageNumber
        });
    }

    return {
        title: fileName,
        content: content,
        sections: sections.map(s => ({
            title: s.title,
            content: s.content.join('\n'),
            pageNumber: s.pageNumber
        }))
    };
}

async function convertPDFToJSON(pdfPath: string, outputPath: string): Promise<PDFContent> {
    try {
        const processed = await processPDFContent(pdfPath);
        
        // Create JSON structure
        const jsonContent: PDFContent = {
            title: processed.title,
            type: 'pdf',
            lastUpdated: new Date().toISOString(),
            sections: processed.sections
        };
        
        // Save to JSON file
        fs.writeFileSync(
            outputPath,
            JSON.stringify(jsonContent, null, 2),
            'utf-8'
        );
        
        return jsonContent;
    } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
    }
}

module.exports = {
    processPDFContent,
    convertPDFToJSON
};
