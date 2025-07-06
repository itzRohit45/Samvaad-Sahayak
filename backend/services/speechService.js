const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

// Base URL for Google Cloud TTS API
const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

/**
 * Convert text to speech using Google Cloud Text-to-Speech API
 * @param {string} text - Text to convert to speech
 * @returns {string} - URL to the audio file
 */
async function textToSpeech(text) {
  try {
    // If API key is not available, return null
    if (!process.env.GOOGLE_TTS_API_KEY) {
      console.warn('Google TTS API key not found, skipping audio generation');
      return null;
    }
    
    // Prepare request data
    const requestData = {
      input: { text },
      voice: {
        languageCode: 'hi-IN',
        name: 'hi-IN-Neural2-A', // Neural Hindi voice
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower
        pitch: 0
      }
    };
    
    // Call Google Cloud TTS API
    const response = await axios.post(
      GOOGLE_TTS_API_URL,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_TTS_API_KEY
        }
      }
    );
    
    // Get audio content (base64 encoded)
    const audioContent = response.data.audioContent;
    
    // Generate unique filename
    const timestamp = Date.now();
    const audioFileName = `response_${timestamp}.mp3`;
    const audioFilePath = path.join(__dirname, '../public/audio', audioFileName);
    
    // Ensure directory exists
    await fs.mkdir(path.join(__dirname, '../public/audio'), { recursive: true });
    
    // Write audio file
    await fs.writeFile(audioFilePath, Buffer.from(audioContent, 'base64'));
    
    // Return URL to the audio file
    return `/api/audio/${audioFileName}`;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null; // Return null on error
  }
}

module.exports = {
  textToSpeech
};
