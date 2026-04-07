import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { generateFlashcards } from '../utils/api'
import DocSelector from '../components/DocSelector'
import { Zap, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Eye } from 'lucide-react'
import styles from './FlashcardsPage.module.css'

function parseCards(data) {
  // Handle various backend response shapes
  if (Array.isArray(data)) return data
  if (data.flashcards && Array.isArray(data.flashcards)) return data.flashcards
  if (data.cards && Array.isArray(data.cards)) return data.cards
  if (typeof data === 'string') {
    // Try to parse markdown Q/A pairs
    const lines = data.split('\n').filter(Boolean)
    const cards = []
    let current = null
    for (const line of lines) {
      if (line.match(/^[Qq][:.]?\s*(.+)/)) {
        current = { question: line.replace(/^[Qq][:.]?\s*/, ''), answer: '' }
      } else if (line.match(/^[Aa][:.]?\s*(.+)/) && current) {
        current.answer = line.replace(/^[Aa][:.]?\s*/, '')
        cards.push(current)
        current = null
      }
    }
    if (cards.length) return cards
  }
  return [{ question: 'Raw output', answer: JSON.stringify(data, null, 2) }]
}

function FlipCard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className={styles.cardScene} onClick={() => setFlipped(!flipped)}>
      <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
        {/* Front */}
        <div className={styles.cardFace}>
          <div className={styles.cardMeta}>
            <span className="badge badge-purple">Question</span>
            <span className={styles.cardNum}>{index + 1} / {total}</span>
          </div>
          <p className={styles.cardText}>{card.question}</p>
          <div className={styles.tapHint}><Eye size={13} /> Tap to reveal answer</div>
        </div>
        {/* Back */}
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          <div className={styles.cardMeta}>
            <span className="badge badge-teal">Answer</span>
            <span className={styles.cardNum}>{index + 1} / {total}</span>
          </div>
          <p className={styles.cardText}>{card.answer}</p>
          <div className={styles.tapHint}><RotateCcw size={13} /> Tap to flip back</div>
        </div>
      </div>
    </div>
  )
}

export default function FlashcardsPage() {
  const [params] = useSearchParams()
  const [docId, setDocId] = useState(params.get('doc') || '')
  const [cards, setCards] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!docId) return
    setLoading(true)
    setError('')
    setCards([])
    setIndex(0)
    try {
      const res = await generateFlashcards(docId)
      const parsed = parseCards(res.data)
      setCards(parsed)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => setIndex((i) => Math.min(cards.length - 1, i + 1))

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        <div className={styles.header}>
          <span className="badge badge-gold"><Zap size={11} /> Flashcards</span>
          <h1 className={styles.title}>Flashcard Deck</h1>
          <p className={styles.sub}>Active recall cards generated from your document.</p>
        </div>

        <div className={styles.controls}>
          <DocSelector value={docId} onChange={setDocId} label="Choose a document…" />
          <button className="btn btn-primary" onClick={generate} disabled={!docId || loading}>
            {loading
              ? <><div className="spinner" /> Generating…</>
              : <><Sparkles size={15} /> Generate Flashcards</>
            }
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {cards.length > 0 && (
          <>
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((index + 1) / cards.length) * 100}%` }}
                />
              </div>
              <span className={styles.progressText}>{index + 1} of {cards.length}</span>
            </div>

            <FlipCard card={cards[index]} index={index} total={cards.length} />

            <div className={styles.nav}>
              <button className="btn btn-secondary" onClick={prev} disabled={index === 0}>
                <ChevronLeft size={16} /> Prev
              </button>
              <div className={styles.dots}>
                {cards.slice(0, Math.min(cards.length, 10)).map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
                {cards.length > 10 && <span className={styles.moreDots}>…</span>}
              </div>
              <button className="btn btn-secondary" onClick={next} disabled={index === cards.length - 1}>
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* Grid overview */}
            <div className={styles.gridSection}>
              <h3 className={styles.gridTitle}>All cards</h3>
              <div className={styles.grid}>
                {cards.map((c, i) => (
                  <button
                    key={i}
                    className={`${styles.gridCard} ${i === index ? styles.gridActive : ''}`}
                    onClick={() => setIndex(i)}
                  >
                    <span className={styles.gridNum}>{i + 1}</span>
                    <p className={styles.gridQ}>{c.question}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {!cards.length && !loading && !error && (
          <div className={styles.placeholder}>
            <Zap size={48} strokeWidth={1} />
            <p>Select a document and generate flashcards.</p>
          </div>
        )}

        {loading && (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>Creating your flashcard deck…</p>
            <span>Usually takes 20–40 seconds</span>
          </div>
        )}
      </div>
    </div>
  )
}
