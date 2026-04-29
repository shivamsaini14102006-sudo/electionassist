/**
 * Input validation & sanitization for all incoming chat requests.
 * Prevents injection attacks, payload abuse, and malformed data.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 500;

/**
 * Strips HTML tags from a string to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function stripHtml(str) {
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Validates and sanitizes the chat request body.
 * @param {{ sessionId?: string, message?: string }} body
 * @returns {{ valid: boolean, errors: string[], sanitized: { sessionId: string|null, message: string } }}
 */
function validateChatInput(body) {
    const errors = [];
    let sessionId = null;
    let message = '';

    // --- Validate sessionId (optional, but if present must be UUID) ---
    if (body.sessionId !== undefined && body.sessionId !== null) {
        if (typeof body.sessionId !== 'string') {
            errors.push('sessionId must be a string.');
        } else if (!UUID_REGEX.test(body.sessionId.trim())) {
            errors.push('sessionId must be a valid UUID format.');
        } else {
            sessionId = body.sessionId.trim();
        }
    }

    // --- Validate message (required) ---
    if (body.message === undefined || body.message === null) {
        errors.push('message is required.');
    } else if (typeof body.message !== 'string') {
        errors.push('message must be a string.');
    } else {
        // Sanitize: trim, strip HTML, normalize whitespace
        message = stripHtml(body.message.trim()).replace(/\s+/g, ' ');

        if (message.length === 0) {
            errors.push('message cannot be empty.');
        } else if (message.length > MAX_MESSAGE_LENGTH) {
            errors.push(`message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitized: { sessionId, message }
    };
}

module.exports = {
    validateChatInput,
    stripHtml,
    MAX_MESSAGE_LENGTH
};
