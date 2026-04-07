import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min — LLM calls can be slow
})

// Interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'An error occurred'
    return Promise.reject(new Error(msg))
  }
)

export const uploadDocument = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}

export const listDocuments = () => api.get('/documents')

export const deleteDocument = (docId) => api.delete(`/documents/${docId}`)

export const generateNotes = (docId) => api.post(`/generate/notes`, { document_id: docId })

export const generateFlashcards = (docId) => api.post(`/generate/flashcards`, { document_id: docId })

export const generateMCQ = (docId, count = 5) =>
  api.post(`/generate/mcq`, { document_id: docId, count })

export const generateQuiz = (docId) => api.post(`/generate/quiz`, { document_id: docId })

export const generateExamQuestions = (docId) =>
  api.post(`/generate/exam-questions`, { document_id: docId })

export const chatWithDoc = (docId, query) =>
  api.post(`/chat`, { document_id: docId, query })

export const healthCheck = () => api.get('/health')

export default api
