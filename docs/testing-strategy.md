# Testing Strategy

## 1. Unit Testing (Backend)
- **Framework**: Jest (or simple Node `assert` for MVP to minimize dependencies).
- **Targets**:
  - `decisionEngine.js`: Verify correct outputs for input scenarios (e.g. Age <18 throws Ineligible).
  - `stateManager.js`: Verify UUID generation and state update validity.

## 2. Integration Testing (API)
- **Tool**: Postman or simple `curl` scripts.
- **Targets**:
  - `POST /api/chat`: Send valid inputs to ensure state transitions correctly.
  - Test Gemini fallback: Send unrelated gibberish, expect a safe FAQ response and no state change.

## 3. End-to-End Testing (Manual UI)
- Open UI in browser.
- Run complete "Happy Path": Am I eligible -> Yes, 18, Citizen -> No Voter ID -> Show Registration.
- Run "Sad Path": Say you are 16. App should gracefully stop you.

## 4. Performance & UX Review
- Ensure chat response is visually immediate (typing indicator shows immediately, reply <2s).
- Verify dark-mode aesthetics are correctly applying.
