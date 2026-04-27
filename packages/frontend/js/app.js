const API_URL = "/api/chat";
let currentSessionId = null;
let isRequestPending = false;

const chatHistory = document.getElementById('chat-history');
const optionsContainer = document.getElementById('chat-options-container');
const faqInput = document.getElementById('faq-input');
const sendBtn = document.getElementById('send-btn');
const timelineContainer = document.getElementById('timeline-container');
const stateText = document.getElementById('current-state-text');
const typingIndicator = document.getElementById('typing-indicator');

// Step progress bar mapping: state -> step element ID
const STEP_ORDER = ['start', 'eligibility', 'voter_id', 'voting', 'complete'];
const STEP_ELEMENTS = {
    start: document.getElementById('step-start'),
    eligibility: document.getElementById('step-eligibility'),
    voter_id: document.getElementById('step-voter-id'),
    voting: document.getElementById('step-voting'),
    complete: document.getElementById('step-complete')
};

// Initialize with Enter key hook
faqInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendText();
    }
});

/**
 * Escapes HTML entities to prevent XSS when rendering user-controlled content.
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function appendMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', role);
    msgDiv.textContent = text; // textContent is XSS-safe
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function appendJourneySummary(summary) {
    const card = document.createElement('div');
    card.classList.add('journey-summary');

    // Build HTML using escaped content to prevent XSS
    const safeStatus = escapeHtml(summary.eligibilityStatus);
    const safeSteps = escapeHtml(summary.stepsCompleted.join(' → '));
    const safeActions = escapeHtml(summary.nextActions).replace(/\n/g, '<br>');
    const safeTimeline = escapeHtml(summary.timelineSummary);

    card.innerHTML = `
        <h4>User Journey Summary</h4>
        <div class="summary-block"><strong>Eligibility Status</strong><span>${safeStatus}</span></div>
        <div class="summary-block"><strong>Steps Completed</strong><span>${safeSteps}</span></div>
        <div class="summary-block"><strong>Next Actions</strong><span>${safeActions}</span></div>
        <div class="summary-block"><strong>Timeline Summary</strong><span>${safeTimeline}</span></div>
    `;
    chatHistory.appendChild(card);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function renderOptions(options) {
    optionsContainer.innerHTML = '';
    if (!options || options.length === 0) return;

    options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('chat-option-btn');
        btn.textContent = opt;
        btn.setAttribute('aria-label', `Option: ${opt}`);
        btn.onclick = () => sendOption(opt);
        // Make first option stand out
        if (index === 0 && options.length <= 2) {
            btn.classList.add('primary-pulse');
        }
        optionsContainer.appendChild(btn);
    });
}

/**
 * Updates the step progress bar based on current state.
 */
function updateProgressBar(state) {
    if (!state) return;

    const currentIndex = STEP_ORDER.indexOf(state);
    if (currentIndex === -1) return;

    STEP_ORDER.forEach((step, index) => {
        const el = STEP_ELEMENTS[step];
        if (!el) return;

        el.classList.remove('active', 'completed');
        if (index < currentIndex) {
            el.classList.add('completed');
        } else if (index === currentIndex) {
            el.classList.add('active');
        }
    });

    // Update the progress bar aria
    const progressBar = document.querySelector('.progress-bar-container');
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', currentIndex);
    }
}

function updateTimelineAndState(timeline, state) {
    if (state) {
        stateText.textContent = state.replace('_', ' ');
        updateProgressBar(state);
    }

    if (timeline && timeline.length > 0) {
        timelineContainer.innerHTML = '';
        timeline.forEach(phase => {
            const item = document.createElement('div');
            item.classList.add('timeline-item');
            item.setAttribute('role', 'listitem');
            if (phase.active) item.classList.add('active');

            const dot = document.createElement('div');
            dot.classList.add('timeline-dot');
            dot.setAttribute('aria-hidden', 'true');

            const content = document.createElement('div');
            content.classList.add('timeline-content');

            const h3 = document.createElement('h3');
            h3.textContent = phase.phase;

            const p = document.createElement('p');
            p.textContent = phase.note;

            content.appendChild(h3);
            content.appendChild(p);
            item.appendChild(dot);
            item.appendChild(content);
            timelineContainer.appendChild(item);
        });
    }
}

/**
 * Toggle UI elements during request.
 */
function setLoading(loading) {
    isRequestPending = loading;
    faqInput.disabled = loading;
    sendBtn.disabled = loading;
    typingIndicator.classList.toggle('visible', loading);
    typingIndicator.setAttribute('aria-hidden', !loading);

    // Disable option buttons during loading
    const optBtns = optionsContainer.querySelectorAll('.chat-option-btn');
    optBtns.forEach(btn => btn.disabled = loading);
}

async function sendRequestToServer(message) {
    if (isRequestPending) return; // Prevent double-submit

    setLoading(true);

    try {
        const payload = { message };
        if (currentSessionId) payload.sessionId = currentSessionId;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${response.status})`);
        }

        const data = await response.json();

        currentSessionId = data.sessionId;
        appendMessage(data.reply, 'assistant');

        // Update options if returned
        if (data.options && data.options.length > 0) {
            renderOptions(data.options);
        }

        // Always update timeline and state
        updateTimelineAndState(data.timeline, data.state);

        // Journey summary on completion
        if (data.journeySummary) {
            appendJourneySummary(data.journeySummary);
        }

    } catch (err) {
        appendMessage("Something went wrong. Please make sure the backend server is running.", 'assistant');
        console.error('Chat error:', err);
    } finally {
        setLoading(false);
    }
}

function sendOption(optionText) {
    if (isRequestPending) return;
    appendMessage(optionText, 'user');
    sendRequestToServer(optionText);
}

function sendText() {
    if (isRequestPending) return;
    const text = faqInput.value.trim();
    if (!text) return;

    faqInput.value = '';
    appendMessage(text, 'user');
    sendRequestToServer(text);
}
