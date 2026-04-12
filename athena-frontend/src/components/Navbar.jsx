import React from 'react'
import styles from './Navbar.module.css'

const TABS = [
  { id: 'notes',      label: '📝 Notes' },
  { id: 'flashcards', label: '🃏 Flashcards' },
  { id: 'questions',  label: '❓ Questions' },
  { id: 'quiz',       label: '🎯 Quiz' },
  { id: 'chat',       label: '💬 Chat' },
]

export default function Navbar({ activeTab, setActiveTab, apiOnline }) {
  return (
    <nav className={styles.nav} id="navbar">
      <a className={styles.logo} href="#" onClick={() => setActiveTab(null)} aria-label="Home">
        <div className={styles.logoIcon} aria-hidden>Α</div>
        <span className={styles.logoText}>Athe<span>na</span></span>
      </a>

      <div className={styles.tabs} role="tablist" aria-label="Main navigation">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            data-view={t.id}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.status} aria-live="polite" aria-label="API connection status">
        <div
          className={`${styles.dot} ${
            apiOnline === true  ? styles.dotOnline :
            apiOnline === false ? styles.dotOffline : ''
          }`}
          id="statusDot"
        />
        <span id="statusText" className="mono">
          {apiOnline === null    ? 'connecting…'
          : apiOnline === true   ? 'API online'
          : 'API offline (demo mode)'}
        </span>
      </div>
    </nav>
  )
}
