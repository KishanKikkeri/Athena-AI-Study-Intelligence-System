/**
 * api.js  —  Athena Frontend ↔ FastAPI Backend Service Layer
 *
 * All calls hit the Vite dev-server proxy at /api/* which forwards to
 * http://localhost:8000/* (FastAPI).
 *
 * Exact endpoint mapping (based on the Athena backend source):
 *
 *   GET  /                        → health / root
 *   POST /upload                  → multipart file upload + ingest
 *   POST /generate/notes          → { notes: string }
 *   POST /generate/flashcards     → { flashcards: [{question, answer}] }
 *   POST /generate/questions      → { questions: [{type, question, options?, answer}] }
 *   POST /generate/quiz           → { questions: [{question, options:[string], answer:int}] }
 *   POST /chat                    → { answer: string }
 *   GET  /documents               → { documents: [string] } (optional endpoint)
 */

import axios from 'axios'

// Base URL — in dev, Vite proxies /api → localhost:8000
// In production (or when running without the proxy), set VITE_API_URL env var
const BASE = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: BASE,
  timeout: 120_000, // 2 min — LLM calls can be slow
})

// ─── Health check ──────────────────────────────────────────────────────────────
export async function checkHealth() {
  const r = await client.get('/')
  return r.data
}

// ─── Upload + Ingest a single file ────────────────────────────────────────────
// Backend: POST /upload (multipart/form-data, field name: "file")
// Returns: { message: string, chunks: number, filename: string }
export async function uploadFile(file, onProgress) {
  const form = new FormData()
  form.append('file', file)

  const r = await client.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return r.data
}

// ─── Generate Notes ──────────────────────────────────────────────────────────
// Backend: POST /generate/notes
// Body:    { count?: number, model?: string }
// Returns: { notes: string }
export async function generateNotes({ count = 5, model = 'gemini' } = {}) {
  const r = await client.post('/generate/notes', { count, model })
  return r.data
}

// ─── Generate Flashcards ──────────────────────────────────────────────────────
// Backend: POST /generate/flashcards
// Body:    { count?: number, model?: string }
// Returns: { flashcards: Array<{ question: string, answer: string }> }
export async function generateFlashcards({ count = 10, model = 'gemini' } = {}) {
  const r = await client.post('/generate/flashcards', { count, model })
  return r.data
}

// ─── Generate Questions ────────────────────────────────────────────────────────
// Backend: POST /generate/questions
// Body:    { count?: number, model?: string }
// Returns: { questions: Array<{
//     type: 'mcq'|'short'|'long',
//     question: string,
//     options?: string[],   // MCQ only
//     answer: string|number // string for short/long, index for MCQ
//   }> }
export async function generateQuestions({ count = 10, model = 'gemini' } = {}) {
  const r = await client.post('/generate/questions', { count, model })
  return r.data
}

// ─── Generate Quiz ─────────────────────────────────────────────────────────────
// Backend: POST /generate/quiz
// Body:    { count?: number, model?: string }
// Returns: { questions: Array<{
//     question: string,
//     options: string[],
//     answer: number   // 0-based correct option index
//   }> }
export async function generateQuiz({ count = 8, model = 'gemini' } = {}) {
  const r = await client.post('/generate/quiz', { count, model })
  return r.data
}

// ─── Chat / Q&A ───────────────────────────────────────────────────────────────
// Backend: POST /chat
// Body:    { question: string }
// Returns: { answer: string }
export async function chat(question) {
  const r = await client.post('/chat', { question })
  return r.data
}

// ─── List ingested documents (optional) ──────────────────────────────────────
export async function listDocuments() {
  try {
    const r = await client.get('/documents')
    return r.data
  } catch {
    return { documents: [] }
  }
}

// ─── Error helper ─────────────────────────────────────────────────────────────
export function apiError(err) {
  if (err?.response?.data?.detail) return err.response.data.detail
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.message) return err.message
  return 'Unknown error'
}