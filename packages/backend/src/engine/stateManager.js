const { randomUUID } = require('crypto');
const logger = require('../utils/logger');
const admin = require('firebase-admin');

// Initialize Firebase
try {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'challange-2-494409'
    });
} catch (error) {
    logger.warn("Firebase initialization failed or already initialized: " + error.message);
}

const db = admin.apps.length ? admin.firestore() : null;

/**
 * Strict allowed states for our MVP state machine
 */
const STATES = {
    START: 'start',
    ELIGIBILITY: 'eligibility',
    VOTER_ID: 'voter_id',
    REGISTRATION: 'registration',
    VOTING: 'voting',
    COMPLETE: 'complete'
};

// Fallback in-memory store if DB is not available
const store = new Map();

/**
 * Gets or creates a new session.
 */
async function getSession(sessionId) {
    if (!sessionId) {
        return createNewSession();
    }

    if (db) {
        try {
            const doc = await db.collection('sessions').doc(sessionId).get();
            if (doc.exists) {
                const session = doc.data();
                // Update last active
                await db.collection('sessions').doc(sessionId).update({
                    lastActive: Date.now()
                });
                return { sessionId, session };
            }
        } catch (error) {
            logger.error(`Error getting session from Firestore: ${error.message}`);
        }
    }

    // Fallback to in-memory store
    if (store.has(sessionId)) {
        const session = store.get(sessionId);
        session.lastActive = Date.now();
        return { sessionId, session };
    }

    return createNewSession();
}

async function createNewSession() {
    const newId = randomUUID();
    const sessionData = {
        state: STATES.START,
        data: {},
        lastActive: Date.now()
    };

    if (db) {
        try {
            await db.collection('sessions').doc(newId).set(sessionData);
        } catch (error) {
            logger.error(`Error creating session in Firestore: ${error.message}`);
        }
    } else {
        store.set(newId, sessionData);
    }
    
    logger.info(`Created new session: ${newId}`);
    return { sessionId: newId, session: sessionData };
}

/**
 * Updates the state for a given session.
 */
async function transitionState(sessionId, newState, dataUpdates = {}) {
    // Validate target state
    if (!Object.values(STATES).includes(newState)) {
        logger.error(`Attempt to transition to invalid state: ${newState}`);
        return false;
    }

    if (db) {
        try {
            const docRef = db.collection('sessions').doc(sessionId);
            const doc = await docRef.get();
            if (doc.exists) {
                const session = doc.data();
                const oldState = session.state;
                
                await docRef.update({
                    state: newState,
                    data: { ...session.data, ...dataUpdates },
                    lastActive: Date.now()
                });
                logger.logStateTransition(sessionId, oldState, newState);
                return true;
            }
        } catch (error) {
            logger.error(`Error updating session in Firestore: ${error.message}`);
        }
    }

    // Fallback
    if (store.has(sessionId)) {
        const session = store.get(sessionId);
        const oldState = session.state;
        session.state = newState;
        session.data = { ...session.data, ...dataUpdates };
        session.lastActive = Date.now();
        logger.logStateTransition(sessionId, oldState, newState);
        return true;
    }

    return false;
}

module.exports = {
    STATES,
    getSession,
    transitionState
};
