# 🧠 Athena — AI Study Intelligence System · Frontend

A production-grade React + Vite frontend for the Athena AI Study Intelligence System, powered by a FastAPI backend.

---

## ✨ Features

| Feature       | What it does                                        | Backend Endpoint          |
| ------------- | --------------------------------------------------- | ------------------------- |
| 📝 Notes      | Generates structured, markdown-rendered study notes | POST /generate/notes      |
| 🃏 Flashcards | Interactive 3D flip-card deck for active recall     | POST /generate/flashcards |
| ❓ Questions   | MCQs (with feedback) + short & long answers         | POST /generate/questions  |
| 🎯 Quiz       | Auto-scored quiz with progress + results screen     | POST /generate/quiz       |
| 💬 Chat       | Conversational Q&A grounded in documents (RAG)      | POST /chat                |

### ➕ Additional Capabilities

* Drag-and-drop file upload (PDF, TXT, MD, DOCX)
* Real-time ingest progress bar → POST /upload
* Live API status indicator (polls GET / every 8s)
* Demo mode fallback when backend is offline
* Model selector (Gemini / Groq / Ollama)
* Fully keyboard-accessible (ARIA + focus management)

---

## 🧱 Tech Stack

Framework: React 18
Build Tool: Vite 5
HTTP Client: Axios
Markdown: react-markdown
Notifications: react-hot-toast
Styling: CSS Modules
Fonts: Playfair Display · DM Mono · DM Sans

---

## 🚀 Quick Start

### 1. Start the Backend

From the Athena backend root:

```
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs at: http://localhost:8000

Make sure your `.env` includes at least one:
GOOGLE_API_KEY
GROQ_API_KEY
or Ollama running locally

---

### 2. Start the Frontend

```
cd athena-frontend
npm install
npm run dev
```

Runs at: http://localhost:3000

Vite automatically proxies:
`/api/* → http://localhost:8000/*`

---

### 3. Use the App

1. Upload a document (drag & drop or click)
2. Click ⚡ Ingest Documents
3. Wait for processing (ChromaDB embedding)
4. Choose a tab (Notes / Flashcards / Questions / Quiz / Chat)
5. Click Generate

🟢 Green dot = backend connected

---

## 🧩 API Service Layer

All API logic lives in:
`src/services/api.js`

### Endpoints

```
GET  / → { message }

POST /upload (multipart/form-data: file)
→ { message, filename, chunks }

POST /generate/notes
→ { notes }

POST /generate/flashcards
→ { flashcards: [{ question, answer }] }

POST /generate/questions
→ { questions: [{ type, question, options?, answer }] }

POST /generate/quiz
→ { questions: [{ question, options, answer }] }

POST /chat
→ { answer }
```

⏱ Timeout: 120 seconds
⚠️ On failure → automatic demo fallback + toast notification

---

## ⚙️ Environment Variables

Create a `.env` file:

```
VITE_API_URL=
```

* Used only in production
* Leave unset in development (Vite proxy handles it)

---

## 📦 Production Build

```
npm run build
npm run preview
```

### Deployment Notes

* Set `VITE_API_URL` to your backend URL
* Enable CORS on backend
* Serve `/dist` via CDN / Vercel / Netlify / Nginx

---

## 🧪 Selenium Test Suite

### Setup

```
pip install selenium pytest webdriver-manager pytest-html
```

Requirements:

* Chrome or Chromium installed
* ChromeDriver auto-managed

---

### Run Tests

```
# Run all tests
pytest tests/test_athena_frontend.py -v

# Run with visible browser
HEADLESS=0 pytest tests/test_athena_frontend.py -v

# Run single test
pytest tests/test_athena_frontend.py::TestTC05_Flashcards -v

# HTML report
pytest tests/test_athena_frontend.py -v --html=report.html --self-contained-html

# Run on staging
ATHENA_URL=http://staging.example.com pytest tests/ -v
```

---

## 🧪 Test Coverage

* TC01 – Page load, UI elements, no JS errors
* TC02 – File upload & validation
* TC03 – Navigation & tab switching
* TC04 – Notes generation
* TC05 – Flashcards interaction
* TC06 – Questions + feedback
* TC07 – Quiz flow
* TC08 – Chat behavior
* TC09 – Settings panel
* TC10 – Document removal

---

## 🔧 Test Environment Variables

ATHENA_URL = http://localhost:3000
HEADLESS = 1
WINDOW_W = 1440
WINDOW_H = 900
PAGE_WAIT = 15

---

## 📜 Scripts

* npm run dev → Start dev server
* npm run build → Production build
* npm run preview → Preview build

---

## 📁 Project Structure

```
athena-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   └── main.jsx
├── public/
├── tests/
├── .env.example
├── vite.config.js
└── package.json
```

---

## 🛡️ Error Handling & UX

* Graceful API fallback (demo mode)
* Toast notifications for all actions
* Disabled states for invalid actions
* Duplicate file protection
* Input validation

---

## 🔮 Future Improvements

* Authentication (JWT / OAuth)
* Persistent history
* Multi-file semantic search
* Export (PDF / Markdown / Anki)
* Dark mode
* Improved mobile responsiveness

---

## 🤝 Contributing

```
git checkout -b feature/your-feature
git commit -m "feat: add feature"
git push origin feature/your-feature
```

---

## 📄 License

MIT License

---

## ❤️ Acknowledgements

* FastAPI backend (Athena Core)
* ChromaDB
* Gemini / Groq / Ollama
