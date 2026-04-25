# User Stories and Acceptance Criteria

## Epic 1: Eligibility & Guided Flow

### User Story 1.1: Eligibility Check
**As a** prospective voter,  
**I want to** know if I am eligible to vote,  
**So that** I don't waste time trying to register if I cannot.

**Acceptance Criteria:**
- The assistant asks for the user's age and citizenship.
- If the user is < 18 or not a citizen, the assistant politely informs them they are ineligible.
- If eligible, it proceeds to ask about Voter ID status.

### User Story 1.2: Registration Guidance
**As an** eligible voter without an ID,  
**I want to** receive step-by-step instructions on how to register,  
**So that** I can apply for a Voter ID card successfully.

**Acceptance Criteria:**
- Assistant provides links or exact steps to apply for a new voter ID.
- Assistant checks with the user once they understand the steps.

### User Story 1.3: Polling Process Instruction
**As a** registered voter,  
**I want to** know what happens at the polling booth,  
**So that** I am prepared on election day.

**Acceptance Criteria:**
- Assistant details the 3-step polling process (ID check, signing register, EVM machine usage).

## Epic 2: Election Timeline

### User Story 2.1: View Important Dates
**As a** user,  
**I want to** see an ongoing timeline of election phases,  
**So that** I know when the deadlines for registration and voting are.

**Acceptance Criteria:**
- A visual component (e.g., timeline or progress bar) displays the registration deadline, campaign period, and voting day.

## Epic 3: FAQ Assistant

### User Story 3.1: Ask Freeform Questions
**As a** confused voter,  
**I want to** ask random questions about the election,  
**So that** I feel fully informed.

**Acceptance Criteria:**
- The chat interface allows typing freeform text.
- The Gemini API returns a relevant, neutral, concise answer based on system prompts.
- Latency remains under 2 seconds.
