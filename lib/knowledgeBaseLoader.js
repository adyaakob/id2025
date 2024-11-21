const fs = require('fs');
const path = require('path');

/**
 * Recursively reads all JSON files in the given directory and its subdirectories.
 * @param {string} dir - The directory to read.
 * @returns {Object} - The aggregated knowledge base.
 */
const loadKnowledgeBase = (dir) => {
  let knowledge = {};

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      knowledge = { ...knowledge, ...loadKnowledgeBase(fullPath) };
    } else if (stat.isFile() && path.extname(fullPath) === '.json') {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      knowledge = { ...knowledge, ...data };
    }
  });

  return knowledge;
};

module.exports = {
  loadKnowledgeBase,
}; 