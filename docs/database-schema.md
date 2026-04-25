# Database Schema

## 1. Overview
For the MVP, there is no traditional relational database to reduce complexity. We rely on two primary data structures:
1. **Static Knowledge Base (Read-only Document)**
2. **In-Memory State Store (Key-Value Store)**

---

## 2. Static Knowledge Base (`data/knowledge.json`)

This represents the structured rules for the application.

```json
{
  "eligibility": {
    "min_age": 18,
    "requires_citizenship": true
  },
  "phases": [
    {
      "id": "registration",
      "name": "Voter Registration",
      "description": "Deadline to register."
    },
    {
      "id": "voting",
      "name": "Election Day",
      "description": "Polling booths are open."
    }
  ],
  "faq_guidelines": "Answers should be neutral..."
}
```

---

## 3. In-Memory State Store (Session Tracker)

Maintained in the Node.js backend. Maps a `sessionId` (UUID) to a state object.

### Structure

```typescript
type UserSession = {
  sessionId: string;
  currentStep: "START" | "ELIGIBILITY_AGE" | "ELIGIBILITY_CITIZEN" | "REGISTRATION_GUIDE" | "POLLING_PROCESS" | "COMPLETED";
  data: {
    age?: number;
    isCitizen?: boolean;
    hasVoterId?: boolean;
  };
  lastInteraction: string; // ISO DateTime
}
```

## 4. Future Evolution
If migrating to a database (e.g., Firebase/MongoDB), the `UserSession` object maps directly to a Document in a `Sessions` collection.
