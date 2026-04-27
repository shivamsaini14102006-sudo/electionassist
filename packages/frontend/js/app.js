const API_URL = "http://localhost:3000/chat";
let currentSessionId = null;

const chatHistory = document.getElementById('chat-history');
const optionsContainer = document.getElementById('chat-options-container');
const faqInput = document.getElementById('faq-input');
const timelineContainer = document.getElementById('timeline-container');
const stateText = document.getElementById('current-state-text');

// Initialize with Enter key hook
faqInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendText();
    }
});

function appendMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', role);
    msgDiv.innerText = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function appendJourneySummary(summary) {
    const card = document.createElement('div');
    card.classList.add('journey-summary');
    
    let html = `<h4>User Journey Summary</h4>`;
    html += `<div class="summary-block"><strong>Eligibility Status</strong><span>${summary.eligibilityStatus}</span></div>`;
    html += `<div class="summary-block"><strong>Steps Completed</strong><span>${summary.stepsCompleted.join(' → ')}</span></div>`;
    
    // Convert newlines in next Actions to <br>
    const actions = summary.nextActions.replace(/\n/g, '<br>');
    html += `<div class="summary-block"><strong>Next Actions</strong><span>${actions}</span></div>`;
    html += `<div class="summary-block"><strong>Timeline Summary</strong><span>${summary.timelineSummary}</span></div>`;
    
    card.innerHTML = html;
    chatHistory.appendChild(card);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function renderOptions(options) {
    optionsContainer.innerHTML = '';
    
    // If no options, that means we sent a FAQ or hit an edge case, we preserve layout stability
    if (!options || options.length === 0) {
        return; 
    }

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('chat-option-btn');
        btn.innerText = opt;
        btn.onclick = () => sendOption(opt);
        optionsContainer.appendChild(btn);
    });
}

function updateTimelineAndState(timeline, state) {
    if (state) {
        stateText.innerText = state.replace('_', ' ');
    }

    if (timeline && timeline.length > 0) {
        timelineContainer.innerHTML = '';
        timeline.forEach(phase => {
            const item = document.createElement('div');
            item.classList.add('timeline-item');
            if (phase.active) item.classList.add('active');

            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h3>${phase.phase}</h3>
                    <p>${phase.note}</p>
                </div>
            `;
            timelineContainer.appendChild(item);
        });
    }
}

async function sendRequestToServer(message) {
    try {
        const payload = { message };
        if (currentSessionId) payload.sessionId = currentSessionId;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Server response error");

        const data = await response.json();
        
        currentSessionId = data.sessionId;
        appendMessage(data.reply, 'assistant');
        
        // Only update options if it returned some (i.e. not a FAQ response)
        if (data.options && data.options.length > 0) {
             renderOptions(data.options);
             updateTimelineAndState(data.timeline, data.state);
        }
        
        // If we hit complete, a journey summary is returned
        if (data.journeySummary) {
             appendJourneySummary(data.journeySummary);
        }

    } catch (err) {
        appendMessage("An error occurred trying to parse that. Make sure the backend server (Node.js) is running on port 3000.", 'assistant');
        console.error(err);
    }
}

function sendOption(optionText) {
    appendMessage(optionText, 'user');
    sendRequestToServer(optionText);
}

function sendText() {
    const text = faqInput.value.trim();
    if (!text) return;

    faqInput.value = '';
    appendMessage(text, 'user');
    sendRequestToServer(text);
}
