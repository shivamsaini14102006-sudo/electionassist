const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const logger = require('./src/utils/logger');
const { validateChatInput } = require('./src/utils/inputValidator');
const rateLimit = require('express-rate-limit');
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// Security Middleware
// ---------------------

// Helmet: sets various HTTP security headers (CSP, X-Frame-Options, etc.)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Disable X-Powered-By header
app.disable('x-powered-by');

// CORS: restricted to same-origin since frontend is served from this server
app.use(cors({
    origin: process.env.CORS_ORIGIN || false, // false = same-origin only
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// JSON body parser with payload size limit (prevents abuse)
app.use(express.json({ limit: '10kb' }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} [${req.ip}]`);
    next();
});

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

const { getSession, transitionState } = require('./src/engine/stateManager');
const { evaluateInput } = require('./src/engine/decisionEngine');
const { generateFAQResponse } = require('./src/services/geminiService');
const knowledge = require('./data/knowledge.json');

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running', timestamp: new Date().toISOString() });
});

const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        // --- Input Validation ---
        const { valid, errors, sanitized } = validateChatInput(req.body);
        if (!valid) {
            return res.status(400).json({
                error: 'Invalid input',
                details: errors
            });
        }

        const { sessionId: inputSessionId, message } = sanitized;
        const { sessionId: currentSessionId, session } = await getSession(inputSessionId);

        // Evaluate deterministic rules first
        const outcome = evaluateInput(currentSessionId, session.state, message, session.data);

        if (outcome && outcome.handled && outcome.newState) {
            await transitionState(currentSessionId, outcome.newState, outcome.dataUpdates || {});

            return res.json({
                sessionId: currentSessionId,
                reply: outcome.reply,
                options: outcome.options,
                state: outcome.newState,
                timeline: knowledge.timeline,
                journeySummary: outcome.journeySummary || null
            });
        }

        // If rule engine didn't handle state transition, forward to FAQ fallback
        try {
            const faqReply = await generateFAQResponse(message);

            return res.json({
                sessionId: currentSessionId,
                reply: faqReply,
                options: [],
                state: session.state,
                timeline: knowledge.timeline
            });
        } catch (faqError) {
            logger.error(`Gemini FAQ Error: ${faqError.message}`);
            return res.json({
                sessionId: currentSessionId,
                reply: "I'm having trouble connecting to my knowledge source right now. Please try again in a moment.",
                options: [],
                state: session.state,
                timeline: knowledge.timeline
            });
        }

    } catch (error) {
        logger.error(`API Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- Export app for testing (Supertest) ---
module.exports = app;

// Start the server only when run directly (not when imported for tests)
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`Server started. Listening on port ${PORT}`);
    });
}
