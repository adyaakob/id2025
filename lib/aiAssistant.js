const { loadKnowledgeBase } = require('./knowledgeBaseLoader');
const path = require('path');

// Load the knowledge base at startup
const knowledgeBasePath = path.join(__dirname, '../knowledge_base');
const knowledgeBase = loadKnowledgeBase(knowledgeBasePath);

/**
 * Simple keyword matching to find relevant information in the knowledge base.
 * @param {string} question - The user's question.
 * @returns {string|null} - The answer from the knowledge base or null if not found.
 */
const searchKnowledgeBase = (question) => {
  const lowerQuestion = question.toLowerCase();

  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (lowerQuestion.includes(key.toLowerCase())) {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value;
    }
  }

  return null;
};

/**
 * Generates a general AI response (placeholder for actual AI integration).
 * @param {string} question - The user's question.
 * @returns {string} - The general AI response.
 */
const generateGeneralAIResponse = (question) => {
  // Integrate with your AI service (e.g., OpenAI) here
  return "I'm not sure about that. Let me get back to you!";
};

/**
 * Handles user questions by first checking the knowledge base.
 * @param {string} question - The user's question.
 * @returns {string} - The appropriate response.
 */
const handleUserQuestion = (question) => {
  // 1. Search the knowledge base
  const kbResponse = searchKnowledgeBase(question);
  if (kbResponse) {
    return kbResponse;
  }

  // 2. Fallback to general AI response
  return generateGeneralAIResponse(question);
};

module.exports = {
  handleUserQuestion,
}; 