import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

interface Section {
    title: string;
    content: string[];
    pageNumber: number;
}

interface ProcessedSection {
    title: string;
    content: string;
    pageNumber: number;
}

interface PDFContent {
    title: string;
    type: string;
    lastUpdated: string;
    sections: ProcessedSection[];
}

class PDFProcessor {
    private static async extractContent(filePath: string): Promise<{ content: string, fileName: string, numPages: number }> {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return {
            content: data.text,
            fileName: path.basename(filePath, '.pdf'),
            numPages: data.numpages
        };
    }

    private static cleanText(text: string): string {
        return text
            // Fix common OCR issues
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // TEQArmada -> TEQ Armada
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\.(\w)/g, '. $1') // Add space after periods
            .replace(/,(\w)/g, ', $1') // Add space after commas
            .replace(/(\w)&(\w)/g, '$1 & $2') // Add space around &
            .replace(/(\w):(\w)/g, '$1: $2') // Add space after colons
            .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Add space between number and text
            .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between text and number
            .replace(/×/g, ' x ') // Replace × with x and add spaces
            .replace(/([<>])/g, ' $1 ') // Add spaces around < and >
            .replace(/(\d)mm/gi, '$1 mm') // Add space between number and mm
            .replace(/(\d)kg/gi, '$1 kg') // Add space between number and kg
            .replace(/(\d)g\b/gi, '$1 g') // Add space between number and g
            .replace(/(\w)(\()/g, '$1 $2') // Add space before parentheses
            .replace(/(\))(\w)/g, '$1 $2') // Add space after parentheses
            .trim();
    }

    private static isSpecificationLine(line: string): boolean {
        const specPatterns = [
            /size:\s*.*$/i,
            /weight:\s*.*$/i,
            /dimensions?:\s*.*$/i,
            /material:\s*.*$/i,
            /\d+\s*(?:mm|cm|m)\b/i,
            /\d+\s*(?:kg|g)\b/i,
            /\d+\s*(?:x|\*)\s*\d+/i,
            /^(?:width|height|depth|length):/i,
            /^material:/i,
            /^weight:/i,
            /aluminum|aluminium/i,
            /specifications?:/i,
            /physical\s+(?:specs?|specifications?)/i
        ];
        
        return specPatterns.some(pattern => pattern.test(line));
    }

    private static isLikelyHeader(line: string): boolean {
        // More sophisticated header detection
        if (line.length < 3 || line.length > 100) return false;
        
        // Check if line is all caps or title case
        const isAllCaps = line === line.toUpperCase();
        const isTitleCase = line.split(' ').every(word => 
            word.length > 0 && word[0] === word[0].toUpperCase()
        );
        
        // Common header indicators
        const headerIndicators = [
            'CHAPTER', 'SECTION', 'PART',
            'OVERVIEW', 'INTRODUCTION', 'SUMMARY',
            'CAPABILITIES', 'FEATURES', 'SPECIFICATIONS',
            'MISSION', 'VISION', 'PROFILE',
            'PHYSICAL', 'TECHNICAL', 'DIMENSIONS',
            'WEIGHT', 'SIZE', 'MATERIAL',
            'SPECIFICATIONS', 'SPECS', 'CHARACTERISTICS'
        ];
        
        const containsHeaderWord = headerIndicators.some(word => 
            line.toUpperCase().includes(word)
        );
        
        // Bullet points and numbering patterns
        const hasBulletOrNumber = /^[•\-\d\.\[\]]+/.test(line);
        
        // Common specification patterns
        const isSpecification = this.isSpecificationLine(line);
        
        // Exclude lines that are too long to be headers
        if (line.length > 50 && !hasBulletOrNumber && !isSpecification) return false;
        
        return (isAllCaps || isTitleCase || containsHeaderWord || hasBulletOrNumber || isSpecification);
    }

    private static shouldMergeSections(current: Section, next: Section): boolean {
        // Don't merge if they're on different pages
        if (current.pageNumber !== next.pageNumber) return false;
        
        // Don't merge if current section is a major header
        if (current.title === current.title.toUpperCase() && 
            current.title.length > 3 && 
            !current.title.startsWith('•')) return false;
            
        // Merge bullet points with their parent section
        if (next.title.startsWith('•')) return true;
        
        // Merge specifications with their parent section
        if (current.title.toUpperCase().includes('SPECIFICATIONS') ||
            current.title.toUpperCase().includes('PHYSICAL') ||
            current.title.toUpperCase().includes('DIMENSIONS') ||
            this.isSpecificationLine(current.title)) {
            return next.title.includes(':') || 
                   next.title.startsWith('•') ||
                   this.isSpecificationLine(next.title);
        }
        
        // Merge if next section looks like a continuation
        if (next.content.length < 2 && next.title.length > 50) return true;
        
        return false;
    }

    private static detectSections(content: string, numPages: number): Section[] {
        const sections: Section[] = [];
        const lines = content.split('\n')
            .map(line => this.cleanText(line.trim()))
            .filter(line => line.length > 0);
        
        let currentSection: Section = {
            title: 'Introduction',
            content: [],
            pageNumber: 1
        };
        
        let pageMarkers = new Set(
            Array.from({ length: numPages }, (_, i) => (i + 1).toString())
        );
        
        let currentPage = 1;
        let skipNext = false;
        
        for (let i = 0; i < lines.length; i++) {
            if (skipNext) {
                skipNext = false;
                continue;
            }
            
            const line = lines[i];
            
            // Update page number if we find a page marker
            if (pageMarkers.has(line)) {
                currentPage = parseInt(line);
                continue;
            }
            
            // Skip if line is just a number (likely a page number)
            if (/^\d+$/.test(line)) continue;
            
            // Check for new section
            if (this.isLikelyHeader(line)) {
                // Look ahead to see if next line should be part of the title
                let title = line;
                if (i + 1 < lines.length && !this.isLikelyHeader(lines[i + 1])) {
                    const nextLine = lines[i + 1];
                    if (line.length + nextLine.length < 50) {
                        title = `${line} ${nextLine}`;
                        skipNext = true;
                    }
                }
                
                // Save previous section if it has content
                if (currentSection.content.length > 0) {
                    sections.push({
                        title: currentSection.title,
                        content: currentSection.content,
                        pageNumber: currentSection.pageNumber
                    });
                }
                
                // Start new section
                currentSection = {
                    title: title,
                    content: [],
                    pageNumber: currentPage
                };
            } else {
                currentSection.content.push(line);
            }
        }
        
        // Add the last section
        if (currentSection.content.length > 0) {
            sections.push({
                title: currentSection.title,
                content: currentSection.content,
                pageNumber: currentSection.pageNumber
            });
        }
        
        // Merge related sections
        const mergedSections: Section[] = [];
        for (let i = 0; i < sections.length; i++) {
            const current = sections[i];
            const next = i + 1 < sections.length ? sections[i + 1] : null;
            
            if (next && this.shouldMergeSections(current, next)) {
                // Merge the sections
                current.content.push(...next.content);
                i++; // Skip the next section since we merged it
            }
            mergedSections.push(current);
        }
        
        return mergedSections;
    }

    private static processContent(fileName: string, content: string, sections: Section[]): PDFContent {
        return {
            title: fileName,
            type: 'pdf',
            lastUpdated: new Date().toISOString(),
            sections: sections.map(s => ({
                title: s.title,
                content: s.content
                    .map(line => this.cleanText(line))
                    .join('\n'),
                pageNumber: s.pageNumber
            }))
        };
    }

    static async convertToJSON(inputPath: string, outputPath: string): Promise<PDFContent> {
        try {
            // Extract content from PDF
            const { content, fileName, numPages } = await this.extractContent(inputPath);
            
            // Detect sections
            const sections = this.detectSections(content, numPages);
            
            // Process and format content
            const processedContent = this.processContent(fileName, content, sections);
            
            // Write to JSON file
            fs.writeFileSync(outputPath, JSON.stringify(processedContent, null, 2));
            
            return processedContent;
        } catch (error) {
            console.error(`Error processing PDF ${inputPath}:`, error);
            throw error;
        }
    }
}

export default PDFProcessor;
