import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { checkHealth, uploadFile, apiError } from './services/api'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import NotesView from './pages/NotesView'
import FlashcardsView from './pages/FlashcardsView'
import QuestionsView from './pages/QuestionsView'
import QuizView from './pages/QuizView'
import ChatView from './pages/ChatView'
import HeroView from './pages/HeroView'
import styles from './App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState(null)        // null = hero
  const [apiOnline, setApiOnline] = useState(null)        // null|true|false
  const [documents, setDocuments] = useState([])          // [{name,size,file,ingested}]
  const [settings, setSettings] = useState({ model: 'gemini', count: 5 })
  const [ingesting, setIngesting] = useState(false)

  // ─── Health poll ──────────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      await checkHealth()
      setApiOnline(true)
    } catch {
      setApiOnline(false)
    }
  }, [])

  useEffect(() => {
    poll()
    const t = setInterval(poll, 8000)
    return () => clearInterval(t)
  }, [poll])

  // ─── Add files ────────────────────────────────────────────────────────────
  const addFiles = useCallback((files) => {
    const allowed = /\.(pdf|txt|md|docx)$/i
    const added = []
    files.forEach(f => {
      if (!allowed.test(f.name)) {
        toast.error(`Unsupported: ${f.name}`)
        return
      }
      if (documents.find(d => d.name === f.name)) return
      added.push({ name: f.name, size: f.size, file: f, ingested: false, progress: 0 })
    })
    if (added.length) setDocuments(prev => [...prev, ...added])
  }, [documents])

  const removeDoc = useCallback((name) => {
    setDocuments(prev => prev.filter(d => d.name !== name))
  }, [])

  // ─── Ingest ───────────────────────────────────────────────────────────────
  const ingest = useCallback(async () => {
    const pending = documents.filter(d => !d.ingested)
    if (!pending.length) { toast('All documents already ingested', { icon: 'ℹ️' }); return }

    setIngesting(true)
    let ok = 0
    for (const doc of pending) {
      try {
        toast.loading(`Ingesting ${doc.name}…`, { id: doc.name })
        await uploadFile(doc.file, (pct) => {
          setDocuments(prev => prev.map(d => d.name === doc.name ? { ...d, progress: pct } : d))
        })
        setDocuments(prev => prev.map(d => d.name === doc.name ? { ...d, ingested: true, progress: 100 } : d))
        toast.success(`${doc.name} ingested!`, { id: doc.name })
        ok++
      } catch (err) {
        toast.error(`${doc.name}: ${apiError(err)}`, { id: doc.name })
      }
    }
    setIngesting(false)
    if (ok) toast.success(`${ok} document${ok > 1 ? 's' : ''} ready`)
  }, [documents])

  const hasIngested = documents.some(d => d.ingested)

  // ─── View map ─────────────────────────────────────────────────────────────
  const VIEWS = {
    notes:      <NotesView settings={settings} hasIngested={hasIngested} />,
    flashcards: <FlashcardsView settings={settings} hasIngested={hasIngested} />,
    questions:  <QuestionsView settings={settings} hasIngested={hasIngested} />,
    quiz:       <QuizView settings={settings} hasIngested={hasIngested} />,
    chat:       <ChatView hasIngested={hasIngested} />,
  }

  return (
    <div className={styles.shell}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiOnline={apiOnline}
      />
      <div className={styles.body}>
        <Sidebar
          documents={documents}
          addFiles={addFiles}
          removeDoc={removeDoc}
          ingest={ingest}
          ingesting={ingesting}
          settings={settings}
          setSettings={setSettings}
        />
        <main className={styles.main} id="main-content">
          {activeTab ? VIEWS[activeTab] : <HeroView setActiveTab={setActiveTab} />}
        </main>
      </div>
    </div>
  )
}
