# Athena Frontend

A modern React + Vite frontend for the [Athena AI Study Intelligence System](https://github.com/KishanKikkeri/Athena-AI-Study-Intelligence-System).

## Stack

- **React 18** + **Vite** (Node-based build tool, fast HMR)
- **React Router v6** for client-side navigation
- **Axios** for API calls to the Python backend
- **react-dropzone** for drag-and-drop PDF uploads
- **react-markdown** to render AI-generated markdown output
- **CSS Modules** for scoped, maintainable styles
- **Syne + DM Sans** fonts for a refined, distinctive look

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Library | Lists uploaded documents with quick-action links |
| `/upload` | Upload | Drag-and-drop PDF uploader with progress |
| `/notes` | Notes | Generates structured notes from a document |
| `/flashcards` | Flashcards | 3D flip-card deck with grid overview |
| `/quiz` | Quiz | Interactive MCQ with scoring and results |
| `/chat` | Chat | RAG-powered Q&A with suggested questions |

## Setup

### 1. Start the Python backend

```bash
# From the Athena repo root
call venv\Scripts\activate        # Windows
# or: source venv/bin/activate    # Mac/Linux

uvicorn app.main:app --reload
# Backend runs at http://localhost:8000
```

### 2. Install and run the frontend

```bash
# From this folder (athena-frontend/)
npm install
npm run dev
# Opens at http://localhost:3000
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so no CORS issues.

## Build for production

```bash
npm run build
# Output in dist/ — serve with any static file server
```

## API assumptions

The frontend calls these endpoints on the backend. Adjust `src/utils/api.js` if your routes differ:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload a PDF (`multipart/form-data`) |
| `GET` | `/documents` | List uploaded documents |
| `DELETE` | `/documents/:id` | Delete a document |
| `POST` | `/generate/notes` | Generate notes `{ document_id }` |
| `POST` | `/generate/flashcards` | Generate flashcards `{ document_id }` |
| `POST` | `/generate/mcq` | Generate MCQ `{ document_id, count }` |
| `POST` | `/generate/quiz` | Generate quiz `{ document_id }` |
| `POST` | `/chat` | RAG query `{ document_id, query }` |
| `GET` | `/health` | Health check |

## Customisation

- **Backend URL**: Change the proxy target in `vite.config.js`
- **Fonts/colours**: Edit CSS variables in `src/index.css`
- **API routes**: Edit `src/utils/api.js`
