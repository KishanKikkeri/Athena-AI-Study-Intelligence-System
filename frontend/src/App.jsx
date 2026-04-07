import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Library from './pages/Library'
import UploadPage from './pages/UploadPage'
import NotesPage from './pages/NotesPage'
import FlashcardsPage from './pages/FlashcardsPage'
import QuizPage from './pages/QuizPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <div className="noise">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"           element={<Library />} />
          <Route path="/upload"     element={<UploadPage />} />
          <Route path="/notes"      element={<NotesPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/quiz"       element={<QuizPage />} />
          <Route path="/chat"       element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  )
}
