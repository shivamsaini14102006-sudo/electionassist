const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// We are treating gemini simply as a fallback FAQ/Explanation service.
let ai;
try {
    if(process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
        logger.warn("GEMINI_API_KEY not found in environment. Gemini features will be disabled.");
    }
} catch (err) {
     logger.error("Failed to initialize GoogleGenAI client: " + err.message);
}

const FAQ_SYSTEM_PROMPT = `
You are a neutral, objective, and unbiased Election Assistant FAQ bot.
Your sole purpose is to answer generic user questions regarding the election process.
You are NOT allowed to decide their eligibility. 
You are NOT allowed to collect their personal data.
Keep your answers brief, under 50 words.
Do not hallucinate rules; encourage them to check official documentation if uncertain.
`;

const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Delay helper for exponential backoff.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates an FAQ answer using Google Gemini with retry logic and timeout.
 * @param {string} userQuestion - The question asked by the user.
 * @returns {Promise<string>} The AI's response text.
 */
async function generateFAQResponse(userQuestion) {
    if (!ai) {
        logger.warn("Attempted to call Gemini but API key is missing.");
        return "I'm currently unable to answer FAQs because my AI service is disconnected.";
    }

    const cachedResponse = cache.get(userQuestion);
    if (cachedResponse) {
        logger.info(`Returning cached Gemini response for prompt length: ${userQuestion.length}`);
        return cachedResponse;
    }

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Exponential backoff on retries
            if (attempt > 0) {
                const backoffMs = Math.pow(2, attempt) * 500; // 1s, 2s
                logger.info(`Gemini retry attempt ${attempt} after ${backoffMs}ms backoff`);
                await delay(backoffMs);
            }

            // Create an AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: userQuestion }]
                        }
                    ],
                    config: {
                        systemInstruction: FAQ_SYSTEM_PROMPT,
                        temperature: 0.1, // Keep it highly deterministic and neutral
                        maxOutputTokens: 100
                    }
                });

                clearTimeout(timeoutId);
                logger.info(`Gemini API called for FAQ. Prompt size: ${userQuestion.length}, attempt: ${attempt + 1}`);
                cache.set(userQuestion, response.text);
                return response.text;
            } finally {
                clearTimeout(timeoutId);
            }

        } catch (error) {
            lastError = error;

            // Classify errors
            if (error.status === 429) {
                logger.warn(`Gemini rate limited (429). Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
                continue; // Retry on rate limit
            }

            if (error.name === 'AbortError') {
                logger.error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS}ms`);
                break; // Don't retry on timeout — likely a systemic issue
            }

            if (error.status >= 500) {
                logger.error(`Gemini server error (${error.status}). Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
                continue; // Retry on server errors
            }

            // Client errors (4xx except 429) — don't retry
            logger.error(`Gemini client error: ${error.message}`);
            break;
        }
    }

    logger.error(`Gemini FAQ failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
    return "I'm sorry, I'm having trouble connecting to my knowledge source right now. Please try again shortly.";
}

module.exports = {
    generateFAQResponse
};
