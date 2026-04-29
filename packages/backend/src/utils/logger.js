/**
 * Basic Logging utility to ensure we strictly log
 * state transitions, engine evaluations, and system events.
 */

const logPrefix = () => `[${new Date().toISOString()}]`;

const logger = {
    info: (msg) => {
        console.log(`${logPrefix()} [INFO] ${msg}`);
    },
    warn: (msg) => {
        console.warn(`${logPrefix()} [WARN] ${msg}`);
    },
    error: (msg) => {
        console.error(`${logPrefix()} [ERROR] ${msg}`);
    },
    // Specific log hooks requested by requirements
    logStateTransition: (sessionId, oldState, newState) => {
        console.log(`${logPrefix()} [STATE] Session ${sessionId}: ${oldState} -> ${newState}`);
    },
    logEngineEvaluation: (sessionId, input, scoreResult) => {
        console.log(`${logPrefix()} [ENGINE] Session ${sessionId} eval output for '${input}' -> Outcome: ${scoreResult}`);
    }
};

module.exports = logger;
