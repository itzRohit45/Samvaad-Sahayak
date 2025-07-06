const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs'); // Regular fs for existsSync
const path = require('path');

// Initialize Google Generative AI (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" }); // This is correct for embeddings

// Simple in-memory vector store (in production, use Chroma, Pinecone, etc.)
let schemeDocuments = [];
let schemeEmbeddings = [];
let isInitialized = false;

/**
 * Initialize the knowledge base by loading and embedding scheme documents
 */
async function initializeKnowledgeBase() {
  try {
    // Load scheme data
    const schemeDataPath = path.join(__dirname, '../data/schemes.json');
    console.log('Loading schemes from:', schemeDataPath);
    
    if (!fs.existsSync(schemeDataPath)) {
      console.error('schemes.json file not found!');
      throw new Error('Schemes data file not found');
    }
    
    // Use readFileSync for simplicity
    const data = fs.readFileSync(schemeDataPath, 'utf8');
    if (!data) {
      console.error('Empty schemes.json file');
      throw new Error('Empty schemes data file');
    }
    
    try {
      schemeDocuments = JSON.parse(data);
      console.log(`Successfully loaded ${schemeDocuments.length} schemes`);
    } catch (parseError) {
      console.error('Failed to parse schemes.json:', parseError);
      throw new Error('Invalid JSON in schemes data file');
    }
    
    console.log('Generating embeddings for schemes...');
    // Generate embeddings for each scheme
    for (const doc of schemeDocuments) {
      if (!doc.content) {
        console.warn(`Skipping embedding for scheme "${doc.name}" as it has no content`);
        continue;
      }
      
      try {
        const embedding = await getEmbedding(doc.content);
        schemeEmbeddings.push(embedding);
      } catch (embeddingError) {
        console.error(`Failed to generate embedding for scheme "${doc.name}":`, embeddingError);
      }
    }
    
    isInitialized = true;
    console.log(`Knowledge base initialized with ${schemeEmbeddings.length} embeddings`);
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    throw error;
  }
}

/**
 * Get embedding for text using Google's Generative AI
 * @param {string} text - Text to embed
 * @returns {Array} - Vector embedding
 */
async function getEmbedding(text) {
  try {
    // Gemini's embedding API
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error getting embedding from Gemini:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vec1 - First vector
 * @param {Array} vec2 - Second vector
 * @returns {number} - Similarity score
 */
function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  return dotProduct / (norm1 * norm2);
}

/**
 * Search for relevant scheme information
 * @param {string} query - User's query
 * @returns {Array} - Relevant scheme documents
 */
async function searchSchemeKnowledgeBase(query) {
  try {
    // Initialize if not already done
    if (!isInitialized) {
      console.log('Knowledge base not initialized, initializing now...');
      await initializeKnowledgeBase();
    }
    
    if (schemeEmbeddings.length === 0) {
      console.warn('Warning: No scheme embeddings available for search');
      return [];
    }
    
    console.log(`Searching for relevant schemes for query: "${query}"`);
    
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query);
    
    // Calculate similarities and rank documents
    const similarities = [];
    
    for (let i = 0; i < schemeEmbeddings.length; i++) {
      const embedding = schemeEmbeddings[i];
      const document = schemeDocuments[i];
      
      if (!document || !document.content) {
        continue;
      }
      
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      similarities.push({
        similarity,
        document
      });
    }
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Return top 3 most similar documents
    return similarities
      .slice(0, 3)
      .filter(item => item.similarity > 0.6) // Only return if somewhat relevant
      .map(item => item.document);
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return []; // Return empty array instead of throwing to prevent cascading errors
  }
}

module.exports = {
  searchSchemeKnowledgeBase
};
