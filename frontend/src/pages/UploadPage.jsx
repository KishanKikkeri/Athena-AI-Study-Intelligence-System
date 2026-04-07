import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { uploadDocument } from '../utils/api'
import { Upload, FileText, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import styles from './UploadPage.module.css'

export default function UploadPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState([]) // { name, status, error }

  const onDrop = useCallback((accepted) => {
    const newFiles = accepted.map((f) => ({ file: f, id: Math.random().toString(36).slice(2) }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  })

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const handleUpload = async () => {
    if (!files.length) return
    setUploading(true)
    setResults([])
    const res = []
    for (const { file } of files) {
      try {
        await uploadDocument(file)
        res.push({ name: file.name, status: 'ok' })
      } catch (e) {
        res.push({ name: file.name, status: 'error', error: e.message })
      }
    }
    setResults(res)
    setUploading(false)
    setFiles([])
  }

  const allOk = results.length > 0 && results.every((r) => r.status === 'ok')

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        <div className={styles.header}>
          <span className="badge badge-gold">Upload</span>
          <h1 className={styles.title}>Add study materials</h1>
          <p className={styles.sub}>
            Drag in your PDFs — lecture slides, textbook chapters, notes.
            Athena will ingest and index them for you.
          </p>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        >
          <input {...getInputProps()} />
          <div className={styles.dropIcon}>
            <Upload size={28} />
          </div>
          {isDragActive ? (
            <p className={styles.dropText}>Drop them here…</p>
          ) : (
            <>
              <p className={styles.dropText}>Drag & drop PDFs here</p>
              <p className={styles.dropHint}>or click to browse your files</p>
            </>
          )}
          <span className="badge badge-purple" style={{ marginTop: 12 }}>PDF only</span>
        </div>

        {/* File queue */}
        {files.length > 0 && (
          <div className={styles.queue}>
            <div className={styles.queueHeader}>
              <span>{files.length} file{files.length > 1 ? 's' : ''} queued</span>
              <button className="btn btn-ghost" onClick={() => setFiles([])}>Clear all</button>
            </div>
            {files.map(({ file, id }) => (
              <div key={id} className={styles.queueItem}>
                <FileText size={16} className={styles.fileIcon} />
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</span>
                <button className={styles.removeBtn} onClick={() => removeFile(id)}>
                  <XCircle size={15} />
                </button>
              </div>
            ))}
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
              style={{ marginTop: 8 }}
            >
              {uploading ? (
                <><div className="spinner" /> Uploading…</>
              ) : (
                <><Upload size={15} /> Upload {files.length} file{files.length > 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className={styles.results}>
            {results.map((r, i) => (
              <div key={i} className={`${styles.resultItem} ${r.status === 'ok' ? styles.ok : styles.err}`}>
                {r.status === 'ok'
                  ? <CheckCircle size={16} />
                  : <XCircle size={16} />
                }
                <span className={styles.resultName}>{r.name}</span>
                {r.error && <span className={styles.resultError}>{r.error}</span>}
              </div>
            ))}
            {allOk && (
              <div className={styles.successActions}>
                <p className={styles.successMsg}>All files uploaded successfully!</p>
                <div style={{ display:'flex', gap: 10, flexWrap:'wrap' }}>
                  <button className="btn btn-primary" onClick={() => navigate('/notes')}>
                    Generate Notes <ArrowRight size={14} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    View Library
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={styles.tips}>
          <h3 className={styles.tipsTitle}>Tips for best results</h3>
          <ul className={styles.tipsList}>
            <li>Use text-based PDFs rather than scanned images for accurate extraction.</li>
            <li>Chapter-level documents work better than full books at once.</li>
            <li>Lecture slides and notes with headings produce cleaner structured output.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
