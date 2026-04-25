# Development Phases

## Phase 1: Project Setup & Docs (Current)
- Generate 12 engineering docs.
- Initialize folder structure (backend & frontend).

## Phase 2: Backend Core & Gemini Integration
- `npm init -y` inside `packages/backend`.
- Install `express`, `cors`, `dotenv`, `@google/genai`.
- Create basic Express server.
- Implement Gemini API wrapper with static system prompts.
- Test basic POST `/api/chat` for LLM connectivity.

## Phase 3: Decision Engine & State Management
- Create `data/knowledge.json`.
- Implement `stateManager.js` (uuid to state mapping).
- Implement `decisionEngine.js` evaluating rules against user input.
- Wire engine to `/api/chat`.

## Phase 4: Frontend UI Setup
- Create `packages/frontend/index.html` and `style.css`.
- Implement a chat bubble layout (user vs assistant).
- Implement dynamic quick-reply buttons.
- Implement Timeline UI panel on the side.
- Connect JS fetch logic to `http://localhost:3000/api/chat`.

## Phase 5: Integration, Polish & Testing
- Test end-to-end flow: from first greeting to final completion state.
- Ensure Edge Cases are caught (Gemini handles gibberish).
- Add CSS animations and high-end aesthetic touches.
