import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listDocuments, deleteDocument } from '../utils/api'
import {
  FileText, Upload, Brain, Zap, HelpCircle,
  MessageSquare, Trash2, ArrowRight, BookOpen
} from 'lucide-react'
import styles from './Library.module.css'

const features = [
  { icon: Brain,        label: 'Smart Notes',  desc: 'Structured summaries from your material', to: '/notes',      color: 'purple' },
  { icon: Zap,          label: 'Flashcards',   desc: 'Active recall cards for fast learning',   to: '/flashcards', color: 'gold'   },
  { icon: HelpCircle,   label: 'MCQ Quiz',     desc: 'Multiple choice questions with answers',  to: '/quiz',       color: 'teal'   },
  { icon: MessageSquare,label: 'AI Chat',      desc: 'Ask anything about your documents',       to: '/chat',       color: 'purple' },
]

export default function Library() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    listDocuments()
      .then((res) => setDocs(res.data?.documents || res.data || []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Remove this document?')) return
    setDeleting(id)
    try { await deleteDocument(id); load() }
    catch (e) { alert(e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className="badge badge-gold">AI Study Companion</span>
          </div>
          <h1 className={styles.heroTitle}>
            Transform your<br />study materials
          </h1>
          <p className={styles.heroSub}>
            Upload PDFs, notes, or slides — Athena generates concise notes,
            flashcards, quizzes, and answers your questions.
          </p>
          <Link to="/upload" className="btn btn-primary">
            <Upload size={16} /> Upload Document
          </Link>
        </div>

        {/* Feature grid */}
        <div className={styles.featureGrid}>
          {features.map(({ icon: Icon, label, desc, to, color }) => (
            <Link key={to} to={to} className={`${styles.featureCard} ${styles[color]}`}>
              <div className={styles.featureIcon}><Icon size={18} /></div>
              <div>
                <div className={styles.featureLabel}>{label}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
              <ArrowRight size={14} className={styles.featureArrow} />
            </Link>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className={`container ${styles.librarySection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <BookOpen size={18} />
            <h2>Your Library</h2>
          </div>
          <Link to="/upload" className="btn btn-secondary">
            <Upload size={14} /> Add document
          </Link>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <span>Loading library…</span>
          </div>
        ) : docs.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={40} strokeWidth={1} />
            <p>No documents yet</p>
            <Link to="/upload" className="btn btn-primary" style={{ marginTop: 8 }}>
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className={styles.docGrid}>
            {docs.map((doc) => {
              const id = doc.id || doc.filename
              const name = doc.filename || doc.name || id
              const date = doc.uploaded_at || doc.created_at
              return (
                <div key={id} className={styles.docCard}>
                  <div className={styles.docIcon}><FileText size={20} /></div>
                  <div className={styles.docInfo}>
                    <div className={styles.docName}>{name}</div>
                    {date && (
                      <div className={styles.docDate}>
                        {new Date(date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  <div className={styles.docActions}>
                    <Link to={`/notes?doc=${id}`} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                      <Brain size={14} />
                    </Link>
                    <Link to={`/flashcards?doc=${id}`} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                      <Zap size={14} />
                    </Link>
                    <Link to={`/quiz?doc=${id}`} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                      <HelpCircle size={14} />
                    </Link>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', color: 'var(--danger)' }}
                      onClick={() => handleDelete(id)}
                      disabled={deleting === id}
                    >
                      {deleting === id ? <div className="spinner" style={{width:14,height:14}} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
