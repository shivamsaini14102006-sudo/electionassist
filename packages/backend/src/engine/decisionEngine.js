const logger = require('../utils/logger');
const { STATES, transitionState } = require('./stateManager');
const knowledge = require('../../data/knowledge.json'); // Hardcoded JSON DB

/**
 * Normalize "yes" and "no" synonyms to canonical forms.
 * Handles common variations like "y", "yeah", "yep", "sure", "nah", "nope", etc.
 * @param {string} input - Lowercased, trimmed user input
 * @returns {string} The original input, or 'yes'/'no' if a synonym was detected
 */
function normalizeSynonyms(input) {
    const yesPatterns = /^(y|ye|yes|yeah|yep|yup|sure|ok|okay|absolutely|affirmative|of course|definitely|correct|right)$/;
    const noPatterns = /^(n|no|nah|nope|not|negative|never|nay)$/;

    // Also check if input *starts with* yes/no for longer phrases like "yes, I am" or "no, I am not"
    if (yesPatterns.test(input) || input.startsWith('yes') || input.startsWith('yeah')) {
        return 'yes';
    }
    if (noPatterns.test(input) || input.startsWith('no') || input.startsWith('nah')) {
        return 'no';
    }
    return input;
}

/**
 * Parses user input deterministically based on expected answers for current state.
 * Returns { handled: boolean, newState?: string, reply?: string, options?: string[], data?: object }
 */
function evaluateInput(sessionId, currentState, userInput, sessionData) {
    const rawInput = (userInput || "").toLowerCase().trim();
    const input = normalizeSynonyms(rawInput);
    let outcome = null;

    switch (currentState) {
        case STATES.START:
            // Expecting them to just click start basically
            outcome = {
                handled: true,
                newState: STATES.ELIGIBILITY,
                reply: knowledge.content.eligibility_intro.text,
                options: ["Yes, I am a citizen & 18+", "No, I am not"]
            };
            break;

        case STATES.ELIGIBILITY:
            if (input.includes('yes')) {
                outcome = {
                    handled: true,
                    newState: STATES.VOTER_ID,
                    dataUpdates: { isEligible: true, steps: ['Eligibility Check Passed'] },
                    reply: knowledge.content.voter_id_check.text,
                    options: ["Yes, I have one", "No, I need one"]
                };
            } else if (input.includes('no')) {
                outcome = {
                    handled: true,
                    newState: STATES.COMPLETE,
                    dataUpdates: { isEligible: false },
                    reply: knowledge.content.ineligible.text,
                    options: ["Start Over"],
                    journeySummary: {
                        eligibilityStatus: "Ineligible",
                        stepsCompleted: ["Eligibility Check"],
                        nextActions: "Check local election laws if circumstances change.",
                        timelineSummary: "N/A - Cannot participate in current election."
                    }
                };
            }
            break;

        case STATES.VOTER_ID:
            if (input.includes('yes')) {
                outcome = {
                    handled: true,
                    newState: STATES.VOTING,
                    dataUpdates: { hasId: true, steps: [...(sessionData.steps || []), 'Voter ID Confirmed'] },
                    reply: knowledge.content.voting_process.text,
                    options: ["View Timeline", "Finish"]
                };
            } else if (input.includes('no')) {
                outcome = {
                    handled: true,
                    newState: STATES.REGISTRATION,
                    dataUpdates: { hasId: false, steps: [...(sessionData.steps || []), 'Needs Registration'] },
                    reply: knowledge.content.registration.text,
                    options: ["Okay, what's next?"]
                };
            }
            break;

        case STATES.REGISTRATION:
            outcome = {
                handled: true,
                newState: STATES.VOTING,
                dataUpdates: { steps: [...(sessionData.steps || []), 'Registration Steps Reviewed'] },
                reply: knowledge.content.voting_process.text,
                options: ["View Timeline", "Finish"]
            };
            break;

        case STATES.VOTING:
            const finalSteps = [...(sessionData.steps || []), 'Voting Procedure Covered'];
            outcome = {
                handled: true,
                newState: STATES.COMPLETE,
                dataUpdates: { steps: finalSteps },
                reply: "You have completed the election process guide! You are ready to vote.",
                options: ["Start Over"],
                journeySummary: {
                    eligibilityStatus: "Eligible & Ready",
                    stepsCompleted: finalSteps,
                    nextActions: sessionData.hasId === false ? "1. Register Online\n2. Prepare ID\n3. Vote on Election Day" : "1. Keep ID safe\n2. Vote on Election Day",
                    timelineSummary: "Ensure you meet the registration deadline if applicable, and locate your polling booth before Voting Day."
                }
            };
            break;
            
        case STATES.COMPLETE:
            if (rawInput.includes('start over') || rawInput.includes('restart') || rawInput === 'start') {
                outcome = {
                    handled: true,
                    newState: STATES.START,
                    reply: "Welcome to the Interactive Election Assistant. Click start to begin verifying your eligibility.",
                    options: ["Start Guide"]
                };
            }
            break;
    }

    if (outcome) {
        logger.logEngineEvaluation(sessionId, rawInput, outcome.newState);
    } else {
        logger.logEngineEvaluation(sessionId, rawInput, 'UNHANDLED_FAQ_FORWARD');
    }

    return outcome;
}

module.exports = {
    evaluateInput,
    normalizeSynonyms
};
