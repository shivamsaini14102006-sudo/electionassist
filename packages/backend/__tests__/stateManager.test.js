const { getSession, transitionState, STATES } = require('../src/engine/stateManager');

describe('State Manager', () => {
    describe('getSession', () => {
        test('creates a new session when no sessionId is provided', () => {
            const { sessionId, session } = getSession(null);
            expect(sessionId).toBeTruthy();
            expect(session.state).toBe(STATES.START);
            expect(session.data).toEqual({});
            expect(session.lastActive).toBeDefined();
        });

        test('creates a new session when sessionId does not exist', () => {
            const { sessionId, session } = getSession('nonexistent-id');
            expect(sessionId).not.toBe('nonexistent-id');
            expect(session.state).toBe(STATES.START);
        });

        test('retrieves existing session', () => {
            const { sessionId: id1 } = getSession(null);
            const { sessionId: id2, session } = getSession(id1);
            expect(id2).toBe(id1);
            expect(session.state).toBe(STATES.START);
        });

        test('updates lastActive on retrieval', () => {
            const { sessionId } = getSession(null);
            const before = Date.now();
            const { session } = getSession(sessionId);
            expect(session.lastActive).toBeGreaterThanOrEqual(before - 1);
        });
    });

    describe('transitionState', () => {
        test('transitions to a valid state', () => {
            const { sessionId } = getSession(null);
            const result = transitionState(sessionId, STATES.ELIGIBILITY);
            expect(result).toBe(true);

            const { session } = getSession(sessionId);
            expect(session.state).toBe(STATES.ELIGIBILITY);
        });

        test('merges data updates', () => {
            const { sessionId } = getSession(null);
            transitionState(sessionId, STATES.ELIGIBILITY, { isEligible: true });

            const { session } = getSession(sessionId);
            expect(session.data.isEligible).toBe(true);
        });

        test('rejects invalid state transitions', () => {
            const { sessionId } = getSession(null);
            const result = transitionState(sessionId, 'INVALID_STATE');
            expect(result).toBe(false);
        });

        test('returns false for nonexistent session', () => {
            const result = transitionState('fake-session', STATES.ELIGIBILITY);
            expect(result).toBe(false);
        });
    });

    describe('STATES enum', () => {
        test('has all expected states', () => {
            expect(STATES.START).toBe('start');
            expect(STATES.ELIGIBILITY).toBe('eligibility');
            expect(STATES.VOTER_ID).toBe('voter_id');
            expect(STATES.REGISTRATION).toBe('registration');
            expect(STATES.VOTING).toBe('voting');
            expect(STATES.COMPLETE).toBe('complete');
        });
    });
});
