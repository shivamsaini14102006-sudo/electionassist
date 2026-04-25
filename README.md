# 🗳️ Interactive Election Navigation Assistant

## 🚩 Problem

Understanding the election process is often confusing for first-time voters and the general public. Information is fragmented, static, and difficult to follow, leading to low awareness and engagement.

---

## 💡 Solution

This project introduces an **Interactive Election Navigation Assistant** — a guided, decision-based system that helps users understand the election process step-by-step.

Instead of acting like a generic chatbot, the system:

* Guides users through a structured flow
* Adapts responses based on user input
* Explains each step clearly and interactively

---

## 🧠 Key Features

### ✅ Eligibility Checker

* Determines if a user is eligible to vote
* Provides clear next steps if not eligible

### 🔄 Guided Voting Flow

* Step-by-step journey:

  * Eligibility → Registration → Voting → Completion
* Interactive UI with buttons and structured responses

### 📊 Timeline Visualization

* Displays key election phases:

  * Registration deadlines
  * Voting day
  * Results

### 🧩 Decision Engine (Core Innovation)

* Rule-based system controlling user flow
* Ensures logical and consistent responses
* Reduces dependency on AI for critical decisions

### 🤖 AI-Powered FAQ

* Uses Gemini API
* Handles open-ended user queries dynamically

### 📌 User Journey Summary

* Displays final status:

  * Eligibility
  * Completed steps
  * Next actions

---

## ⚙️ Tech Stack

* **Frontend:** Antigravity UI (HTML, JS)
* **Backend:** Node.js (Express)
* **AI Integration:** Gemini API
* **Cloud Deployment (Optional):** Google Cloud

---

## 🏗️ System Architecture

```text
Frontend (Antigravity UI)
        ↓
Backend (Node.js API)
        ↓
Decision Engine + State Manager
        ↓
Gemini API
        ↓
JSON Knowledge Base
```

---

## 🚀 How It Works

1. User opens the application
2. Assistant starts with eligibility check
3. Based on responses:

   * Guides user through registration
   * Explains voting process
4. Displays timeline and progress
5. Handles additional queries using AI

---

## 🧪 Testing Strategy

The system is tested for:

* Decision engine correctness
* Complete user journey flow
* Error handling and invalid inputs
* AI response validation

### Example Test Cases:

* Underage user → blocked with explanation
* No voter ID → redirected to registration
* Full journey → successful completion
* Invalid input → recovery prompt

---

## 📦 Local Setup

### 1. Clone Repository

```bash
git clone <your-repo-link>
cd <repo-name>
```

---

### 2. Backend Setup

```bash
cd packages/backend
npm install
```

Create `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Run backend:

```bash
npm start
```

---

### 3. Frontend Setup

Go to:

```bash
cd ../frontend
```

Open:

```text
index.html
```

(Use browser or Antigravity preview)

---

## 🌐 Usage

* Start the app
* Follow guided steps
* Use buttons or chat
* Ask questions anytime

---

## 🔐 Security

* API keys stored in environment variables
* No sensitive user data stored

---

## ⚠️ Assumptions

* Election data is static (MVP scope)
* No real-time updates
* No authentication system

---

## 🚀 Future Improvements

* Real-time election data integration
* Multi-language support (Hindi + more)
* Voice-based interaction
* User authentication

---

## 🏁 Conclusion

This project transforms complex election processes into an **interactive, user-friendly experience** by combining:

* Rule-based decision logic
* AI-powered assistance

It demonstrates strong **product design, system architecture, and real-world usability**.
