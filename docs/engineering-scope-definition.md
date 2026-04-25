# Engineering Scope Definition

## 1. In Scope for MVP
- **Frontend App**: Fully responsive, dark-mode preferred, dynamic aesthetic web interface.
- **Backend API**: REST API (Node.js/Express) serving chat interactions.
- **Decision Engine**: Hardcoded rules for evaluating standard path (Eligibility -> Voter ID -> Registration -> Polling).
- **Gemini Integration**: Basic FAQ functionality using the Gemini 1.5 API with static prompt injections.
- **State Management**: Simple in-memory JS maps mapping UUIDs to progress states.
- **Data**: Static `knowledge.json` containing the rules and phases timeline.

## 2. Out of Scope for MVP
- **User Authentication**: No login / signup required (anonymous unique sessions).
- **Persistent Database**: No Postgres, MongoDB, or Firebase (in-memory only).
- **RAG (Retrieval-Augmented Generation)**: We will not perform vector embeddings or dynamic document retrieval. Gemini relies purely on prompt context.
- **Localization**: Only English will be supported. Hindi is postponed to MVP+.
- **Election Data Scraping**: All data is static, no live update of election dates.

## 3. Success Metrics
- Fully traversable state tree (no infinite loops or dead ends).
- UI successfully triggers backend API and parses Markdown/HTML responses.
- Timeline dynamically highlights the correct active phase.
