const request = require('supertest');
const app = require('../index');

describe('API Endpoints', () => {
    describe('GET /health', () => {
        test('returns 200 with status OK', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body.message).toBe('Backend is running');
            expect(res.body.timestamp).toBeDefined();
        });
    });

    describe('POST /api/chat', () => {
        test('starts a new session when no sessionId provided', async () => {
            const res = await request(app)
                .post('/api/chat')
                .send({ message: 'start' });

            expect(res.status).toBe(200);
            expect(res.body.sessionId).toBeDefined();
            expect(res.body.reply).toBeTruthy();
            expect(res.body.state).toBeDefined();
        });

        test('returns 400 when message is missing', async () => {
            const res = await request(app)
                .post('/api/chat')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid input');
            expect(res.body.details).toContain('message is required.');
        });

        test('returns 400 when message is empty', async () => {
            const res = await request(app)
                .post('/api/chat')
                .send({ message: '' });

            expect(res.status).toBe(400);
            expect(res.body.details).toContain('message cannot be empty.');
        });

        test('returns 400 when sessionId is invalid UUID', async () => {
            const res = await request(app)
                .post('/api/chat')
                .send({ sessionId: 'bad-id', message: 'hello' });

            expect(res.status).toBe(400);
            expect(res.body.details).toContain('sessionId must be a valid UUID format.');
        });

        test('strips HTML from message input', async () => {
            const res = await request(app)
                .post('/api/chat')
                .send({ message: '<script>alert(1)</script>start' });

            expect(res.status).toBe(200);
            // Should have processed sanitized input
            expect(res.body.reply).toBeTruthy();
        });

        test('full conversation flow through API', async () => {
            // Step 1: Start
            const r1 = await request(app)
                .post('/api/chat')
                .send({ message: 'start' });
            expect(r1.status).toBe(200);
            const sid = r1.body.sessionId;
            expect(r1.body.state).toBe('eligibility');

            // Step 2: Eligible
            const r2 = await request(app)
                .post('/api/chat')
                .send({ sessionId: sid, message: 'yes' });
            expect(r2.body.state).toBe('voter_id');

            // Step 3: Has Voter ID
            const r3 = await request(app)
                .post('/api/chat')
                .send({ sessionId: sid, message: 'yes' });
            expect(r3.body.state).toBe('voting');

            // Step 4: Complete
            const r4 = await request(app)
                .post('/api/chat')
                .send({ sessionId: sid, message: 'finish' });
            expect(r4.body.state).toBe('complete');
            expect(r4.body.journeySummary).toBeTruthy();
        });

        test('includes security headers (Helmet)', async () => {
            const res = await request(app).get('/health');
            // Helmet sets various headers
            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-frame-options']).toBeDefined();
        });

        test('does not expose X-Powered-By', async () => {
            const res = await request(app).get('/health');
            expect(res.headers['x-powered-by']).toBeUndefined();
        });
    });
});
