import React, { useState, useEffect } from 'react'
import { listDocuments } from '../utils/api'
import { FileText, ChevronDown, Loader } from 'lucide-react'
import styles from './DocSelector.module.css'

export default function DocSelector({ value, onChange, label = 'Select document' }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    listDocuments()
      .then((res) => setDocs(res.data?.documents || res.data || []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }, [])

  const selected = docs.find((d) => d.id === value || d.filename === value)

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        disabled={loading}
      >
        {loading ? (
          <><div className="spinner" style={{ width: 16, height: 16 }} /> Loading…</>
        ) : (
          <>
            <FileText size={15} />
            <span>{selected ? (selected.filename || selected.name || selected.id) : label}</span>
            <ChevronDown size={14} className={open ? styles.chevronOpen : ''} />
          </>
        )}
      </button>

      {open && docs.length > 0 && (
        <div className={styles.dropdown}>
          {docs.map((doc) => {
            const id = doc.id || doc.filename
            const name = doc.filename || doc.name || doc.id
            return (
              <button
                key={id}
                className={`${styles.option} ${value === id ? styles.selected : ''}`}
                onClick={() => { onChange(id); setOpen(false) }}
              >
                <FileText size={13} />
                <span className={styles.docName}>{name}</span>
              </button>
            )
          })}
        </div>
      )}

      {open && docs.length === 0 && (
        <div className={styles.dropdown}>
          <p className={styles.empty}>No documents found. Upload one first.</p>
        </div>
      )}
    </div>
  )
}
