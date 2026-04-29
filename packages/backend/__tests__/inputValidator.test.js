const { validateChatInput, stripHtml, MAX_MESSAGE_LENGTH } = require('../src/utils/inputValidator');

describe('Input Validator', () => {
    describe('validateChatInput', () => {
        test('accepts valid input with message only', () => {
            const result = validateChatInput({ message: 'Hello' });
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.sanitized.message).toBe('Hello');
            expect(result.sanitized.sessionId).toBeNull();
        });

        test('accepts valid input with message and sessionId', () => {
            const result = validateChatInput({
                sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                message: 'Yes'
            });
            expect(result.valid).toBe(true);
            expect(result.sanitized.sessionId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        });

        test('rejects missing message', () => {
            const result = validateChatInput({});
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('message is required.');
        });

        test('rejects empty message', () => {
            const result = validateChatInput({ message: '   ' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('message cannot be empty.');
        });

        test('rejects non-string message', () => {
            const result = validateChatInput({ message: 123 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('message must be a string.');
        });

        test('rejects oversized message', () => {
            const result = validateChatInput({ message: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) });
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('exceeds maximum length');
        });

        test('rejects invalid sessionId format', () => {
            const result = validateChatInput({ sessionId: 'not-a-uuid', message: 'Hi' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('sessionId must be a valid UUID format.');
        });

        test('rejects non-string sessionId', () => {
            const result = validateChatInput({ sessionId: 42, message: 'Hi' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('sessionId must be a string.');
        });

        test('strips HTML tags from message', () => {
            const result = validateChatInput({ message: 'Hello <script>alert(1)</script>' });
            expect(result.valid).toBe(true);
            expect(result.sanitized.message).toBe('Hello alert(1)');
        });

        test('normalizes whitespace', () => {
            const result = validateChatInput({ message: '  hello    world  ' });
            expect(result.valid).toBe(true);
            expect(result.sanitized.message).toBe('hello world');
        });
    });

    describe('stripHtml', () => {
        test('removes HTML tags', () => {
            expect(stripHtml('<b>bold</b>')).toBe('bold');
            expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
            expect(stripHtml('no tags here')).toBe('no tags here');
        });
    });
});
