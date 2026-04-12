import React from 'react'
import styles from './UI.module.css'

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className={styles.spinnerWrap} role="status" aria-label={label}>
      <div className={styles.ring} />
      <span className={styles.spinLabel}>{label}</span>
    </div>
  )
}

export function GenerateBar({ title, description, btnLabel = 'Generate', onGenerate, loading }) {
  return (
    <div className={styles.genBar} id="generateBar">
      <div className={styles.genInfo}>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button
        className={styles.genBtn}
        onClick={onGenerate}
        disabled={loading}
        id="generateBtn"
        aria-label={btnLabel}
      >
        {loading
          ? <><span className={styles.btnSpin}/> Working…</>
          : btnLabel}
      </button>
    </div>
  )
}

export function NoIngest() {
  return (
    <div className={styles.noIngest}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
      <strong>No documents ingested</strong>
      <p>Upload files in the sidebar and click <em>Ingest Documents</em> first.</p>
    </div>
  )
}

export function ViewHeader({ title, subtitle, children }) {
  return (
    <div className={styles.viewHeader}>
      <div>
        <h1 className={styles.viewTitle}>{title}</h1>
        {subtitle && <p className={styles.viewSub}>{subtitle}</p>}
      </div>
      {children && <div className={styles.viewActions}>{children}</div>}
    </div>
  )
}

export function SmallBtn({ onClick, children, id, variant = 'ghost' }) {
  return (
    <button
      id={id}
      className={`${styles.smallBtn} ${variant === 'primary' ? styles.primary : styles.ghost}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
