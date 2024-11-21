import pdfplumber
import os
import json
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from string import punctuation

# Download required NLTK data
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
nltk.download('stopwords')

class PDFAssistant:
    def __init__(self):
        self.pdf_dir = 'knowledge_base/pdfs'
        self.text_content = self.load_pdfs()
        self.stopwords = set(stopwords.words('english'))
        self.specs = self.load_specifications()
        
    def load_pdfs(self):
        """Load and extract text from all PDFs in the knowledge base"""
        content = []
        
        for filename in os.listdir(self.pdf_dir):
            if filename.endswith('.pdf'):
                pdf_path = os.path.join(self.pdf_dir, filename)
                print(f"Loading {filename}...")
                
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            # Clean and normalize text
                            text = ' '.join(text.split())  # Remove extra whitespace
                            content.extend(sent_tokenize(text))
        
        return content
        
    def load_specifications(self):
        """Load product specifications from JSON"""
        try:
            with open('specifications.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load specifications.json: {e}")
            return None
            
    def get_specification(self, category, attribute):
        """Get a specific product specification"""
        if not self.specs:
            return None
            
        try:
            return self.specs['specifications'][category][attribute]
        except KeyError:
            return None
        
    def find_relevant_sentences(self, query):
        """Find sentences that might answer the query"""
        # Tokenize and clean query
        query_words = set(word_tokenize(query.lower()))
        query_words = {w for w in query_words if w not in self.stopwords and w not in punctuation}
        
        # Score sentences based on relevance
        scored_sentences = []
        for sentence in self.text_content:
            sentence_words = set(word_tokenize(sentence.lower()))
            sentence_words = {w for w in sentence_words if w not in self.stopwords and w not in punctuation}
            
            # Calculate overlap score
            overlap = len(query_words & sentence_words)
            if overlap > 0:
                # Weight longer matches more heavily
                score = overlap * (overlap / len(query_words))
                scored_sentences.append((score, sentence))
        
        # Sort by score and return top matches
        scored_sentences.sort(reverse=True)
        return [sent for score, sent in scored_sentences]

    def get_answer(self, query):
        """Get answer for a query"""
        query = query.lower().strip()
        
        # Direct mapping for common queries
        query_mapping = {
            'weight': ('physical', 'weight'),
            'dimensions': ('physical', 'dimensions'),
            'power': ('power', 'input_voltage'),
            'temperature': ('environmental', 'operating_temperature')
        }
        
        # Check for exact matches first
        for key, (category, attribute) in query_mapping.items():
            if query in [key, f"what is the {key}", f"what's the {key}"]:
                value = self.get_specification(category, attribute)
                if value:
                    return f"The {key} is {value}."
        
        # If no exact match, try the general search
        relevant = self.find_relevant_sentences(query)
        if not relevant:
            return "I couldn't find that information in the documentation."
        
        return "\n".join(relevant[:2])

if __name__ == "__main__":
    print("Loading PDF knowledge base...")
    assistant = PDFAssistant()
    print("\nPDF Assistant ready! Ask me anything about the product.")
    print("Type 'quit' to exit\n")
    
    while True:
        try:
            query = input("> ")
            if query.lower() in ['quit', 'exit', '']:
                break
            print("\nAnswer:", assistant.get_answer(query))
            print()
        except (KeyboardInterrupt, EOFError):
            break
        except Exception as e:
            print(f"Error: {str(e)}")
            continue
            
    print("\nGoodbye!")
