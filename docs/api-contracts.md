# API Contracts

## 1. Overview
The backend exposes a single primary REST API endpoint to handle the conversation flow.

## 2. Endpoints

### 2.1 Send Chat Message
**Endpoint**: `POST /api/chat`
**Description**: Sends user input to the backend, returning the assistant's reply and state updates.

#### Request Headers
- `Content-Type`: `application/json`

#### Request Body
```json
{
  "sessionId": "string (UUID, missing if new session)",
  "message": "string (user input)",
  "type": "text | button"
}
```

#### Response Body (Success - 200 OK)
```json
{
  "sessionId": "string (persisted or newly created UUID)",
  "reply": "string (Markdown or HTML formatted assistant response)",
  "nextStep": "string (the internal state key)",
  "options": ["Yes", "No", "Tell me more"], // optional button array
  "currentPhaseName": "string", // Used to update the visual timeline
  "isError": false
}
```

#### Response Body (Error - 400 or 500)
```json
{
  "error": "Message detailing what went wrong.",
  "isError": true
}
```

## 3. Third-party APIs

### 3.1 Google Gemini API
- **Endpoint**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Authentication**: `x-goog-api-key` header or URL param.
- **Usage**: Backend formats a prompt containing the user question + the allowed FAQ context, and returns the generated text.
