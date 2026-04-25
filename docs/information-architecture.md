# Information Architecture

## 1. Overview
The application consists primarily of a single interactive interface split between conversational flow and visual indicators. The information is structured temporally and practically to guide the user from beginning to end without overwhelming them.

## 2. Navigational Structure (Single Page App)

- **Landing View**
  - Welcome Message
  - Call to Action ("Am I eligible to vote?", "Show me the timeline")

- **Main Chat Interface (Left/Center Panel)**
  - Interactive Conversation Stream
  - Suggested Action Buttons (e.g., "Yes", "No", "Tell me more")
  - Freeform Input Field (bottom)

- **Timeline & State Visualization (Right Panel)**
  - User Journey Progress (Current Phase indicator)
    - Eligibility
    - Voter ID
    - Registration
    - Polling
  - Fixed Election Dates Card (Registration deadline, Election day)

## 3. Content Strategy (The Knowledge Base Structure)

The static knowledge base (`knowledge.json`) represents the information hierarchy the bot traverses:
- `rules`
  - `eligibility` (Age, Citizenship)
  - `voter_id` (Required documents)
- `phases`
  - `registration_period`
  - `campaigning`
  - `voting_day`
  - `results`
- `polling_process`
  - Step 1: Verification
  - Step 2: Ink & Signature
  - Step 3: EVM voting

## 4. Hierarchy of Focus
1. **Interactive Chat**: Primary focal point for interactions.
2. **Action Buttons**: Quick replies to reduce typing friction.
3. **Timeline Sidebar**: Secondary contextual information (read-only).
