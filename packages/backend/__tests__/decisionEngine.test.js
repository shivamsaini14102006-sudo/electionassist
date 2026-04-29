const { evaluateInput, normalizeSynonyms } = require('../src/engine/decisionEngine');
const { STATES } = require('../src/engine/stateManager');

describe('normalizeSynonyms', () => {
    test.each([
        ['yes', 'yes'], ['y', 'yes'], ['yeah', 'yes'], ['yep', 'yes'],
        ['yup', 'yes'], ['sure', 'yes'], ['ok', 'yes'], ['okay', 'yes'],
        ['absolutely', 'yes'], ['yes, I am a citizen', 'yes'],
    ])('normalizes "%s" to "%s"', (input, expected) => {
        expect(normalizeSynonyms(input)).toBe(expected);
    });

    test.each([
        ['no', 'no'], ['n', 'no'], ['nah', 'no'], ['nope', 'no'],
        ['negative', 'no'], ['no, I am not', 'no'],
    ])('normalizes "%s" to "%s"', (input, expected) => {
        expect(normalizeSynonyms(input)).toBe(expected);
    });

    test('leaves unrecognized input unchanged', () => {
        expect(normalizeSynonyms('what is an evm')).toBe('what is an evm');
    });
});

describe('evaluateInput', () => {
    describe('START state', () => {
        test('transitions to ELIGIBILITY on any input', () => {
            const result = evaluateInput('s1', STATES.START, 'start', {});
            expect(result.handled).toBe(true);
            expect(result.newState).toBe(STATES.ELIGIBILITY);
            expect(result.reply).toBeTruthy();
            expect(result.options).toEqual(expect.any(Array));
        });
    });

    describe('ELIGIBILITY state', () => {
        test('transitions to VOTER_ID on "yes"', () => {
            const result = evaluateInput('s1', STATES.ELIGIBILITY, 'yes', {});
            expect(result.newState).toBe(STATES.VOTER_ID);
            expect(result.dataUpdates.isEligible).toBe(true);
        });

        test('transitions to VOTER_ID on "Yeah" (synonym)', () => {
            const result = evaluateInput('s1', STATES.ELIGIBILITY, 'Yeah', {});
            expect(result.newState).toBe(STATES.VOTER_ID);
        });

        test('transitions to COMPLETE on "no" (ineligible)', () => {
            const result = evaluateInput('s1', STATES.ELIGIBILITY, 'No, I am not', {});
            expect(result.newState).toBe(STATES.COMPLETE);
            expect(result.dataUpdates.isEligible).toBe(false);
            expect(result.journeySummary).toBeTruthy();
        });

        test('returns null on unrecognized input (FAQ fallback)', () => {
            const result = evaluateInput('s1', STATES.ELIGIBILITY, 'What is the capital of France?', {});
            expect(result).toBeNull();
        });
    });

    describe('VOTER_ID state', () => {
        test('transitions to VOTING on "yes" (has ID)', () => {
            const result = evaluateInput('s1', STATES.VOTER_ID, 'yes', { steps: ['Eligibility Check Passed'] });
            expect(result.newState).toBe(STATES.VOTING);
            expect(result.dataUpdates.hasId).toBe(true);
        });

        test('transitions to REGISTRATION on "no" (needs ID)', () => {
            const result = evaluateInput('s1', STATES.VOTER_ID, 'no', { steps: ['Eligibility Check Passed'] });
            expect(result.newState).toBe(STATES.REGISTRATION);
            expect(result.dataUpdates.hasId).toBe(false);
        });

        test('handles "nope" synonym', () => {
            const result = evaluateInput('s1', STATES.VOTER_ID, 'nope', { steps: [] });
            expect(result.newState).toBe(STATES.REGISTRATION);
        });
    });

    describe('REGISTRATION state', () => {
        test('transitions to VOTING on any input', () => {
            const result = evaluateInput('s1', STATES.REGISTRATION, 'Okay, what is next', { steps: ['Needs Registration'] });
            expect(result.newState).toBe(STATES.VOTING);
        });
    });

    describe('VOTING state', () => {
        test('transitions to COMPLETE with journey summary', () => {
            const result = evaluateInput('s1', STATES.VOTING, 'finish', { steps: ['Step1'], hasId: true });
            expect(result.newState).toBe(STATES.COMPLETE);
            expect(result.journeySummary).toBeTruthy();
            expect(result.journeySummary.eligibilityStatus).toBe('Eligible & Ready');
        });

        test('journey summary shows different next actions when hasId is false', () => {
            const result = evaluateInput('s1', STATES.VOTING, 'done', { steps: ['Step1'], hasId: false });
            expect(result.journeySummary.nextActions).toContain('Register Online');
        });
    });

    describe('COMPLETE state', () => {
        test('"start over" restarts the flow', () => {
            const result = evaluateInput('s1', STATES.COMPLETE, 'Start Over', {});
            expect(result.newState).toBe(STATES.START);
        });

        test('"restart" also restarts the flow', () => {
            const result = evaluateInput('s1', STATES.COMPLETE, 'restart', {});
            expect(result.newState).toBe(STATES.START);
        });

        test('returns null on unrecognized input in COMPLETE', () => {
            const result = evaluateInput('s1', STATES.COMPLETE, 'hello', {});
            expect(result).toBeNull();
        });
    });

    describe('End-to-end happy path', () => {
        test('full flow: start → eligible → has ID → complete', () => {
            const r1 = evaluateInput('e2e', STATES.START, 'start', {});
            expect(r1.newState).toBe(STATES.ELIGIBILITY);

            const r2 = evaluateInput('e2e', STATES.ELIGIBILITY, 'yes', {});
            expect(r2.newState).toBe(STATES.VOTER_ID);

            const r3 = evaluateInput('e2e', STATES.VOTER_ID, 'yes', { steps: r2.dataUpdates.steps });
            expect(r3.newState).toBe(STATES.VOTING);

            const r4 = evaluateInput('e2e', STATES.VOTING, 'finish', { ...r3.dataUpdates });
            expect(r4.newState).toBe(STATES.COMPLETE);
            expect(r4.journeySummary).toBeTruthy();
        });
    });
});
