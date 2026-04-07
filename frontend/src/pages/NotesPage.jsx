import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { generateNotes } from '../utils/api'
import DocSelector from '../components/DocSelector'
import { Brain, Sparkles, Copy, Check } from 'lucide-react'
import styles from './NotesPage.module.css'

export default function NotesPage() {
  const [params] = useSearchParams()
  const [docId, setDocId] = useState(params.get('doc') || '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!docId) return
    setLoading(true)
    setError('')
    setNotes('')
    try {
      const res = await generateNotes(docId)
      setNotes(res.data?.notes || res.data?.content || JSON.stringify(res.data, null, 2))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className="badge badge-purple"><Brain size={11} /> Smart Notes</span>
            <h1 className={styles.title}>Generate Notes</h1>
            <p className={styles.sub}>
              Athena reads your document and produces concise, structured study notes.
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          <DocSelector value={docId} onChange={setDocId} label="Choose a document…" />
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={!docId || loading}
          >
            {loading
              ? <><div className="spinner" /> Generating…</>
              : <><Sparkles size={15} /> Generate Notes</>
            }
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {notes && (
          <div className={styles.output}>
            <div className={styles.outputHeader}>
              <span className={styles.outputLabel}>Study Notes</span>
              <button className="btn btn-ghost" onClick={copy} style={{ padding: '5px 10px' }}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <div className={`${styles.content} md-content`}>
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        )}

        {!notes && !loading && !error && (
          <div className={styles.placeholder}>
            <Brain size={48} strokeWidth={1} />
            <p>Select a document and generate notes to get started.</p>
          </div>
        )}

        {loading && (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>Athena is reading your document…</p>
            <span>This may take 20–40 seconds</span>
          </div>
        )}
      </div>
    </div>
  )
}
