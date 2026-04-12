import React, { useRef, useState } from 'react'
import styles from './Sidebar.module.css'

const fmtSize = b =>
  b < 1024 ? `${b}B`
  : b < 1048576 ? `${(b/1024).toFixed(1)}KB`
  : `${(b/1048576).toFixed(1)}MB`

export default function Sidebar({ documents, addFiles, removeDoc, ingest, ingesting, settings, setSettings }) {
  const fileRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const onDrop = e => {
    e.preventDefault(); setDrag(false)
    addFiles([...e.dataTransfer.files])
  }

  const hasPending = documents.some(d => !d.ingested)

  return (
    <aside className={styles.sidebar} id="sidebar">

      {/* ── Upload zone ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Upload Documents</div>
        <div
          id="uploadZone"
          className={`${styles.uploadZone} ${drag ? styles.dragOver : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          onKeyDown={e => e.key === 'Enter' && fileRef.current.click()}
        >
          <input
            id="fileInput"
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,.docx"
            multiple
            style={{ display: 'none' }}
            onChange={e => addFiles([...e.target.files])}
          />
          <div className={styles.uploadIcon}>📂</div>
          <div className={styles.uploadLabel}>Drop files or click</div>
          <div className={styles.uploadHint}>PDF · TXT · MD · DOCX</div>
        </div>
      </section>

      {/* ── Ingest button ── */}
      <button
        id="ingestBtn"
        className={styles.ingestBtn}
        onClick={ingest}
        disabled={!hasPending || ingesting}
        aria-label="Ingest documents"
      >
        {ingesting ? <><span className={styles.spin}/> Ingesting…</> : '⚡ Ingest Documents'}
      </button>

      {/* ── Document list ── */}
      <section className={styles.section} style={{ flex: 1, minHeight: 0 }}>
        <div className={styles.sectionLabel}>Documents ({documents.length})</div>
        <div className={styles.docList} id="docList">
          {documents.length === 0
            ? <div className={styles.emptyDocs} id="emptyDocs">No documents yet</div>
            : documents.map(doc => (
              <div key={doc.name} className={`${styles.docItem} ${doc.ingested ? styles.docIngested : ''}`} id={`doc-${doc.name.replace(/\W/g,'_')}`}>
                <span className={styles.docIcon}>{doc.ingested ? '✅' : '📄'}</span>
                <div className={styles.docMeta}>
                  <strong className={styles.docName} title={doc.name}>{doc.name}</strong>
                  <span className={styles.docSize}>
                    {fmtSize(doc.size)} · {doc.ingested
                      ? <span className={styles.ingested}>Ingested</span>
                      : doc.progress > 0
                        ? `${doc.progress}%`
                        : 'Pending'}
                  </span>
                  {!doc.ingested && doc.progress > 0 && doc.progress < 100 && (
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${doc.progress}%` }} />
                    </div>
                  )}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeDoc(doc.name)}
                  aria-label={`Remove ${doc.name}`}
                  title="Remove"
                >✕</button>
              </div>
            ))
          }
        </div>
      </section>

      {/* ── Settings ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Settings</div>
        <div className={styles.field}>
          <label htmlFor="modelSelect">LLM Model</label>
          <select
            id="modelSelect"
            value={settings.model}
            onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
          >
            <option value="gemini">Gemini</option>
            <option value="groq">Groq</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="countInput">Output Count</label>
          <input
            id="countInput"
            type="number"
            min={1}
            max={20}
            value={settings.count}
            onChange={e => setSettings(s => ({ ...s, count: parseInt(e.target.value) || 5 }))}
          />
        </div>
      </section>

    </aside>
  )
}
