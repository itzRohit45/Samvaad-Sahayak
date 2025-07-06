const { GoogleGenerativeAI } = require("@google/generative-ai");
const { searchSchemeKnowledgeBase } = require("./ragService");

// Initialize Google Generative AI (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  // Fix: Use the correct model name format for the current SDK version
  model: "gemini-1.5-flash", // Changed from gemini-pro to gemini-1.5-flash
  generationConfig: {
    maxOutputTokens: parseInt(process.env.MAX_TOKENS_PER_REQUEST) || 500,
    temperature: 0.7,
  },
});

/**
 * Process user query and generate response
 * @param {string} query - User's query text
 * @param {string} language - Selected language for response
 * @returns {Object} - Response with text
 */
async function processQuery(query, language = "hindi") {
  try {
    console.log(
      "[QueryProcessor] Processing query:",
      query,
      "in language:",
      language
    );

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "[QueryProcessor] GEMINI_API_KEY is missing in environment variables"
      );
      const errorMessages = {
        hindi:
          "माफ़ करें, सिस्टम कॉन्फ़िगरेशन में त्रुटि है। कृपया व्यवस्थापक से संपर्क करें।",
        english:
          "Sorry, there is an error in system configuration. Please contact administrator.",
        tamil:
          "மன்னிக்கவும், கணினி கட்டமைப்பில் பிழை உள்ளது. நிர்வாகியைத் தொடர்பு கொள்ளவும்.",
        telugu:
          "క్షమించండి, సిస్టమ్ కాన్ఫిగరేషన్‌లో లోపం ఉంది. దయచేసి నిర్వాహకుడిని సంప్రదించండి.",
        bengali:
          "দুঃখিত, সিস্টেম কনফিগারেশনে ত্রুটি আছে। দয়া করে প্রশাসকের সাথে যোগাযোগ করুন।",
      };
      return {
        text: errorMessages[language] || errorMessages.hindi,
        error: "GEMINI_API_KEY is missing",
      };
    }

    // Search for relevant scheme information
    console.log("[QueryProcessor] Searching knowledge base...");

    let relevantSchemes = [];
    try {
      relevantSchemes = await searchSchemeKnowledgeBase(query);
    } catch (searchError) {
      console.error(
        "[QueryProcessor] Error in searchSchemeKnowledgeBase:",
        searchError
      );
      // Continue with empty results instead of crashing
    }

    console.log(
      `[QueryProcessor] Found ${
        relevantSchemes ? relevantSchemes.length : 0
      } relevant schemes`
    );

    // Generate response based on relevant schemes
    const response = await generateResponse(
      query,
      relevantSchemes || [],
      language
    );

    return { text: response };
  } catch (error) {
    console.error("[QueryProcessor] Error processing query:", error);
    const errorMessages = {
      hindi:
        "माफ़ करें, आपके प्रश्न का उत्तर देने में कोई त्रुटि हुई है। कृपया अपना प्रश्न दोबारा पूछें या बाद में प्रयास करें।",
      english:
        "Sorry, there was an error answering your question. Please try asking again or try later.",
      tamil:
        "மன்னிக்கவும், உங்கள் கேள்விக்கு பதிலளிப்பதில் பிழை ஏற்பட்டுள்ளது. மீண்டும் கேட்கவும் அல்லது பின்னர் முயற்சிக்கவும்.",
      telugu:
        "క్షమించండి, మీ ప్రశ్నకు సమాధానం ఇవ్వడంలో లోపం ఉంది. దయచేసి మళ్లీ అడగండి లేదా తర్వాత ప్రయత్నించండి.",
      bengali:
        "দুঃখিত, আপনার প্রশ্নের উত্তর দিতে ত্রুটি হয়েছে। দয়া করে আবার জিজ্ঞাসা করুন বা পরে চেষ্টা করুন।",
    };
    return {
      text: errorMessages[language] || errorMessages.hindi,
      error: error.message,
    };
  }
}

/**
 * Generate response using Gemini
 * @param {string} query - User's query
 * @param {Array} relevantSchemes - Relevant scheme information
 * @param {string} language - Selected language for response
 * @returns {string} - Generated response text
 */
async function generateResponse(query, relevantSchemes, language = "hindi") {
  try {
    // Prepare context from relevant schemes
    let context = "";
    if (relevantSchemes && relevantSchemes.length > 0) {
      // Add null check and defensive programming
      const validSchemes = relevantSchemes.filter(
        (scheme) => scheme && scheme.content
      );

      if (validSchemes.length > 0) {
        context =
          "Related government scheme information:\n\n" +
          validSchemes
            .map(
              (scheme) =>
                `${scheme.name || "Unnamed scheme"}: ${scheme.content}`
            )
            .join("\n\n");
      } else {
        console.log(
          "[QueryProcessor] No valid schemes found with content property"
        );
        context = "No specific scheme information found for this query.";
      }
    } else {
      context = "No specific scheme information found for this query.";
    }

    // Define language-specific prompts
    const languagePrompts = {
      hindi: {
        role: "आप SamvadSahayak हैं, भारतीय सरकारी कल्याणकारी योजनाओं के विशेषज्ञ हिंदी-भाषी AI सहायक हैं।",
        instructions: `निर्देश:
1. सरल, समझने योग्य हिंदी में उत्तर दें
2. अपने उत्तरों में प्रत्यक्ष और संक्षिप्त रहें
3. यदि आपके पास विशिष्ट जानकारी नहीं है, तो स्पष्ट रूप से कहें
4. प्रासंगिक होने पर बुनियादी पात्रता मानदंड और आवेदन प्रक्रिया शामिल करें
5. स्पष्टता और पठनीयता के लिए अपने उत्तर को अच्छी तरह प्रारूपित करें:
   - मुख्य शीर्षकों के लिए **शीर्षक** का उपयोग करें
   - सूची के लिए * या - का उपयोग करें
   - अलग-अलग बिंदुओं के लिए नई लाइन का उपयोग करें
   - महत्वपूर्ण शब्दों को **बोल्ड** करें
6. यदि प्रश्न सरकारी योजनाओं से संबंधित नहीं है, तो विनम्रता से योजना-संबंधी विषयों की ओर पुनर्निर्देशित करें
7. उत्तर को पैराग्राफ में व्यवस्थित करें, बहुत लंबे ब्लॉक टेक्स्ट से बचें`,
      },
      english: {
        role: "You are SamvadSahayak, a helpful English-speaking AI assistant specializing in Indian government welfare schemes.",
        instructions: `Instructions:
1. Respond in clear, easy-to-understand English
2. Be direct and to the point in your answers
3. If you don't have specific information, clearly say so
4. Include basic eligibility criteria and application process if relevant
5. Format your answer for clarity and readability:
   - Use **headings** for main sections
   - Use * or - for lists
   - Use new lines for different points
   - Make important words **bold**
6. If the query is not related to government schemes, politely redirect to scheme-related topics
7. Organize your response in well-structured paragraphs, avoid long text blocks`,
      },
      tamil: {
        role: "நீங்கள் SamvadSahayak, இந்திய அரசு நலன்புரி திட்டங்களில் நிபுணத்துவம் வாய்ந்த தமிழ்-பேசும் AI உதவியாளர்.",
        instructions: `வழிமுறைகள்:
1. எளிய, புரியக்கூடிய தமிழில் பதிலளிக்கவும்
2. உங்கள் பதில்களில் நேரடியாகவும் சுருக்கமாகவும் இருங்கள்
3. உங்களிடம் குறிப்பிட்ட தகவல் இல்லையென்றால், தெளிவாகக் கூறுங்கள்
4. பொருத்தமான தகுதி அளவுகோல்கள் மற்றும் விண்ணப்ப செயல்முறையைச் சேர்க்கவும்
5. தெளிவு மற்றும் படிக்கக்கூடிய தன்மைக்காக உங்கள் பதிலை நன்றாக வடிவமைக்கவும்:
   - முக்கிய பகுதிகளுக்கு **தலைப்புகள்** பயன்படுத்தவும்
   - பட்டியலுக்கு * அல்லது - பயன்படுத்தவும்
   - வெவ்வேறு புள்ளிகளுக்கு புதிய வரிகள் பயன்படுத்தவும்
   - முக்கியமான சொற்களை **தடிமனாக** செய்யவும்
6. கேள்வி அரசு திட்டங்களுடன் தொடர்புடையதாக இல்லையென்றால், திட்டம் தொடர்பான தலைப்புகளுக்கு மரியாதையுடன் திருப்பிவிடவும்
7. உங்கள் பதிலை நல்ல பத்திகளில் ஒழுங்கமைக்கவும், நீண்ட உரை தொகுதிகளைத் தவிர்க்கவும்`,
      },
      telugu: {
        role: "మీరు SamvadSahayak, భారతీయ ప్రభుత్వ సంక్షేమ పథకాలలో నిపుణత కలిగిన తెలుగు-మాట్లాడే AI సహాయకుడు.",
        instructions: `సూచనలు:
1. సరళమైన, అర్థం చేసుకోగలిగే తెలుగులో సమాధానం ఇవ్వండి
2. మీ సమాధానాలలో ప్రత్యక్షంగా మరియు సంక్షిప్తంగా ఉండండి
3. మీ వద్ద నిర్దిష్ట సమాచారం లేకుంటే, స్పష్టంగా చెప్పండి
4. సంబంధిత అయితే ప్రాథమిక అర్హత ప్రమాణాలు మరియు దరఖాస్తు ప్రక్రియను చేర్చండి
5. స్పష్టత మరియు చదవడానికి సులభంగా ఉండేలా మీ సమాధానాన్ని బాగా ఫార్మాట్ చేయండి:
   - ముఖ్య విభాగాలకు **శీర్షికలు** ఉపయోగించండి
   - జాబితాలకు * లేదా - ఉపయోగించండి
   - వేర్వేరు పాయింట్లకు కొత్త లైన్లు ఉపయోగించండి
   - ముఖ్యమైన పదాలను **బోల్డ్** చేయండి
6. ప్రశ్న ప్రభుత్వ పథకాలకు సంబంధించినది కాకుంటే, మర్యాదపూర్వకంగా పథకం-సంబంధిత అంశాలకు మళ్లించండి
7. మీ సమాధానాన్ని బాగా నిర్మాణాత్మక పేరాలలో నిర్వహించండి, పొడవైన టెక్స్ట్ బ్లాక్లను నివారించండి`,
      },
      bengali: {
        role: "আপনি SamvadSahayak, ভারতীয় সরকারি কল্যাণ প্রকল্পে বিশেষজ্ঞ একজন বাংলা-ভাষী AI সহায়ক।",
        instructions: `নির্দেশনা:
1. সরল, বোধগম্য বাংলায় উত্তর দিন
2. আপনার উত্তরে সরাসরি এবং সংক্ষিপ্ত হন
3. যদি আপনার কাছে নির্দিষ্ট তথ্য না থাকে, তবে স্পষ্টভাবে বলুন
4. প্রাসঙ্গিক হলে মৌলিক যোগ্যতার মানদণ্ড এবং আবেদন প্রক্রিয়া অন্তর্ভুক্ত করুন
5. স্পষ্টতা এবং পাঠযোগ্যতার জন্য আপনার উত্তর ভালভাবে ফরম্যাট করুন:
   - মূল বিভাগের জন্য **শিরোনাম** ব্যবহার করুন
   - তালিকার জন্য * বা - ব্যবহার করুন
   - বিভিন্ন পয়েন্টের জন্য নতুন লাইন ব্যবহার করুন
   - গুরুত্বপূর্ণ শব্দগুলি **বোল্ড** করুন
6. যদি প্রশ্নটি সরকারি প্রকল্পের সাথে সম্পর্কিত না হয়, তবে বিনয়ের সাথে প্রকল্প-সম্পর্কিত বিষয়ে পুনর্নির্দেশ করুন
7. আপনার উত্তরকে সুগঠিত অনুচ্ছেদে সংগঠিত করুন, দীর্ঘ টেক্সট ব্লক এড়িয়ে চলুন`,
      },
    };

    const selectedPrompt = languagePrompts[language] || languagePrompts.hindi;

    // Prepare prompt for Gemini
    const prompt = `
    ${selectedPrompt.role}
    
    Query: ${query}
    
    Context information: ${context}
    
    ${selectedPrompt.instructions}
    
    Your response:
    `;

    console.log(
      "[QueryProcessor] Sending prompt to Gemini for language:",
      language
    );

    try {
      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        console.error("[QueryProcessor] Empty response from Gemini");
        const defaultErrors = {
          hindi:
            "माफ़ करें, मुझे इस प्रश्न का उत्तर देने में समस्या हो रही है। कृपया थोड़ी देर बाद पुन: प्रयास करें।",
          english:
            "Sorry, I'm having trouble answering this question. Please try again later.",
          tamil:
            "மன்னிக்கவும், இந்த கேள்விக்கு பதிலளிப்பதில் சிக்கல் உள்ளது. பின்னர் முயற்சிக்கவும்.",
          telugu:
            "క్షమించండి, ఈ ప్రశ్నకు సమాధానం ఇవ్వడంలో సమస్య ఉంది. దయచేసి తర్వాత ప్రయత్నించండి.",
          bengali:
            "দুঃখিত, এই প্রশ্নের উত্তর দিতে সমস্যা হচ্ছে। দয়া করে পরে চেষ্টা করুন।",
        };
        return defaultErrors[language] || defaultErrors.hindi;
      }

      const response = result.response;
      const text = response.text();
      console.log(
        "[QueryProcessor] Response generated successfully in language:",
        language
      );

      if (!text) {
        const noResponseErrors = {
          hindi:
            "माफ़ करें, मुझे उत्तर प्राप्त नहीं हुआ। कृपया अपना प्रश्न दोबारा पूछें।",
          english:
            "Sorry, I couldn't get a response. Please ask your question again.",
          tamil:
            "மன்னிக்கவும், பதில் கிடைக்கவில்லை. உங்கள் கேள்வியை மீண்டும் கேட்கவும்.",
          telugu:
            "క్షమించండి, నాకు సమాధానం రాలేదు. దయచేసి మీ ప్రశ్న మళ్లీ అడగండి.",
          bengali:
            "দুঃখিত, আমি উত্তর পাইনি। দয়া করে আপনার প্রশ্ন আবার জিজ্ঞাসা করুন।",
        };
        return noResponseErrors[language] || noResponseErrors.hindi;
      }

      return text;
    } catch (geminiError) {
      console.error("[QueryProcessor] Gemini API error:", geminiError);
      const geminiErrors = {
        hindi:
          "माफ़ करें, Google Gemini API से उत्तर प्राप्त करने में समस्या आ रही है। कृपया थोड़ी देर बाद पुन: प्रयास करें।",
        english:
          "Sorry, there's an issue getting response from Google Gemini API. Please try again later.",
        tamil:
          "மன்னிக்கவும், Google Gemini API இலிருந்து பதில் பெறுவதில் சிக்கல் உள்ளது. பின்னர் முயற்சிக்கவும்.",
        telugu:
          "క్షమించండి, Google Gemini API నుండి ప్రతిస్పందన పొందడంలో సమస్య ఉంది. దయచేసి తర్వాత ప్రయత్నించండి.",
        bengali:
          "দুঃখিত, Google Gemini API থেকে উত্তর পেতে সমস্যা হচ্ছে। দয়া করে পরে চেষ্টা করুন।",
      };
      return geminiErrors[language] || geminiErrors.hindi;
    }
  } catch (error) {
    console.error("[QueryProcessor] Error generating response:", error);
    const generalErrors = {
      hindi:
        "माफ़ करें, उत्तर बनाने में समस्या आई है। कृपया अपना प्रश्न दोबारा पूछें।",
      english:
        "Sorry, there was a problem generating the response. Please ask your question again.",
      tamil:
        "மன்னிக்கவும், பதில் உருவாக்குவதில் சிக்கல் உள்ளது. உங்கள் கேள்வியை மீண்டும் கேட்கவும்.",
      telugu:
        "క్షమించండి, ప్రతిస్పందనను రూపొందించడంలో సమస్య ఉంది. దయచేసి మీ ప్రశ్న మళ్లీ అడగండి.",
      bengali:
        "দুঃখিত, উত্তর তৈরি করতে সমস্যা হয়েছে। দয়া করে আপনার প্রশ্ন আবার জিজ্ঞাসা করুন।",
    };
    return generalErrors[language] || generalErrors.hindi;
  }
}

module.exports = {
  processQuery,
};
