import React from 'react'
import styles from './HeroView.module.css'

const STEPS = [
  { n:'1', icon:'📂', title:'Upload Files', desc:'Drop any PDF, TXT, MD or DOCX into the sidebar.' },
  { n:'2', icon:'⚡', title:'Ingest',       desc:'Click "Ingest Documents" to index into ChromaDB.' },
  { n:'3', icon:'🧠', title:'Generate',     desc:'Choose a mode and let the AI build your content.' },
  { n:'4', icon:'🎯', title:'Test Yourself', desc:'Take auto-generated quizzes and track your score.' },
]

export default function HeroView({ setActiveTab }) {
  return (
    <div className={styles.hero} id="heroView">
      <div className={styles.owl}>🦉</div>
      <h1 className={styles.heading}>Study Smarter with AI</h1>
      <p className={styles.sub}>
        Upload your study materials — PDFs, notes, slides — and Athena transforms them
        into structured notes, flashcards, exam questions and scored quizzes.
      </p>

      <div className={styles.steps}>
        {STEPS.map(s => (
          <div key={s.n} className={styles.step}>
            <span className={styles.stepNum}>{s.n}</span>
            <div className={styles.stepIcon}>{s.icon}</div>
            <div className={styles.stepTitle}>{s.title}</div>
            <div className={styles.stepDesc}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.quickLinks}>
        {['notes','flashcards','questions','quiz','chat'].map(v => (
          <button key={v} className={styles.quickBtn} onClick={() => setActiveTab(v)}>
            {v.charAt(0).toUpperCase() + v.slice(1)} →
          </button>
        ))}
      </div>
    </div>
  )
}
