const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchSchemeKnowledgeBase } = require('./ragService');

// Initialize Google Generative AI (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Try with 'gemini-pro' which is more widely supported
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro", // This is the most commonly available model
  generationConfig: {
    maxOutputTokens: parseInt(process.env.MAX_TOKENS_PER_REQUEST) || 500,
    temperature: 0.7
  }
});

/**
 * Process a user query and generate a response
 * @param {string} query - User's query text
 * @returns {Object} - Response with text and optional audioUrl
 */
async function processQuery(query) {
  try {
    console.log('Processing query:', query);
    
    // Search knowledge base for relevant scheme information
    const relevantSchemes = await searchSchemeKnowledgeBase(query);
    
    // Prepare context from relevant schemes
    let context = '';
    if (relevantSchemes && relevantSchemes.length > 0) {
      context = 'Related government scheme information:\n\n' + 
        relevantSchemes.map(scheme => 
          `${scheme.name}: ${scheme.content}`
        ).join('\n\n');
    } else {
      context = 'No specific scheme information found for this query.';
    }
    
    // Prepare prompt for Gemini
    const prompt = `
    You are SamvadSahayak, a helpful Hindi-speaking AI assistant specializing in Indian government welfare schemes.
    
    Query: ${query}
    
    Context information: ${context}
    
    Instructions:
    1. Respond in Hindi with simple, easy-to-understand language
    2. Be direct and to the point in your answers
    3. If you don't have specific information, clearly say so
    4. Include basic eligibility criteria and application process if relevant
    5. Format your answer for clarity and readability
    6. If the query is not related to government schemes, politely redirect to scheme-related topics
    
    Your response:
    `;

    // Generate response using Gemini
    console.log('Sending prompt to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Successfully received response from Gemini API');
    
    return { 
      text,
      // No audioUrl when using browser TTS
    };
  } catch (error) {
    console.error('Error processing query:', error);
    
    // Provide a fallback response for farmer-related queries
    if (query.toLowerCase().includes('किसान') || 
        query.toLowerCase().includes('कृषि') || 
        query.toLowerCase().includes('खेती') ||
        query.toLowerCase().includes('farmer')) {
      return {
        text: "किसानों के लिए प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) एक महत्वपूर्ण योजना है। इस योजना के तहत, छोटे और सीमांत किसानों को प्रति वर्ष 6,000 रुपये की आर्थिक सहायता प्रदान की जाती है, जो 2,000 रुपये की तीन किस्तों में सीधे किसानों के बैंक खातों में स्थानांतरित की जाती है। इस योजना के लिए आवेदन करने के लिए, आप अपने क्षेत्र के राजस्व अधिकारी या ग्राम पंचायत सचिव से संपर्क कर सकते हैं।"
      };
    }
    
    // Provide a general fallback response
    return {
      text: "माफ़ करें, मैं अभी आपके प्रश्न का उत्तर नहीं दे पा रहा हूँ। कृपया कुछ समय बाद पुन: प्रयास करें या अपना प्रश्न दूसरे तरीके से पूछें।",
      error: error.message
    };
  }
}

module.exports = {
  processQuery
};
