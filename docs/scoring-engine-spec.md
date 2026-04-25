# Scoring Engine (Decision Engine) Specification

## 1. Overview
The "Scoring Engine" in the context of the Election Assistant is the **Decision Engine**. It parses user responses, validates eligibility rules, and updates the user's progress state.

## 2. Rules Definition

### 2.1 Eligibility Score
- **Inputs:** Age (Number), Citizen (Boolean)
- **Logic:**
  ```javascript
  if (Age >= 18 && Citizen === true) {
      return "ELIGIBLE";
  } else {
      return "INELIGIBLE";
  }
  ```

### 2.2 Voter ID Status
- **Inputs:** HasVoterId (Boolean)
- **Logic:**
  ```javascript
  if (HasVoterId === true) {
      return "POLLING_PROCESS";
  } else {
      return "REGISTRATION_GUIDELINES";
  }
  ```

## 3. Node Evaluation Tree
The engine works as a sequential state machine evaluator:

1. **Node 1: Start** -> Prompts for Age/Citizenship. Transition to Node 2.
2. **Node 2: Evaluate Eligibility** -> Calls Eligibility Logic. If Eligible, Transition to Node 3. If Ineligible, Transition to Node End-Failure.
3. **Node 3: Check Voter ID** -> Prompts for Voter ID status. Transition to Node 4.
4. **Node 4: Evaluate Voter ID** -> Calls ID Logic. 
5. **Node 5: Polling Guidelines** -> Show steps, end.

## 4. Fallback (Gemini LLM)
If the user's input does not match expected node inputs (e.g., they ask a question instead of answering "Yes/No"), the engine flags the input as `UNRECOGNIZED` and forwards the message to the Gemini API for FAQ handling, without advancing the state machine sequence.
