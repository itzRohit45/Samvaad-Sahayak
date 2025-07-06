// Test script to verify which Gemini models work with your API key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiModels() {
  console.log('Testing Gemini API with various model names...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ GoogleGenerativeAI initialized');
  
  // Array of model names to test
  const modelNames = [
    "gemini-pro",
    "gemini-1.5-flash", 
    "gemini-1.5-pro",
    "gemini-pro-vision"
  ];
  
  // Test each model
  for (const modelName of modelNames) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Respond with 'Hello from Gemini!' if you can read this.");
      
      console.log(`✅ ${modelName} WORKS!`);
      console.log('-'.repeat(40));
      console.log(result.response.text());
      console.log('-'.repeat(40));
      
    } catch (error) {
      console.error(`❌ ${modelName} failed with error:`, error.message);
    }
  }
  
  // Also test embedding model if you're using it for RAG
  try {
    console.log('\n🧪 Testing embedding model: embedding-001');
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    await embeddingModel.embedContent("Test embedding text");
    console.log('✅ embedding-001 model works for embeddings!');
  } catch (error) {
    console.error('❌ embedding-001 failed:', error.message);
    console.log('You may need a different model for embeddings');
  }
}

testGeminiModels();
