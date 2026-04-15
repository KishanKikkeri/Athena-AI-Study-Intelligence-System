import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { generateFlashcards, apiError } from '../services/api'
import { Spinner, GenerateBar, NoIngest, ViewHeader, SmallBtn } from '../components/UI'
import styles from './FlashcardsView.module.css'

const MOCK_CARDS = [
  { question: 'What is Machine Learning?', answer: 'A subset of AI that enables systems to learn from data and improve without explicit programming.' },
  { question: 'What is Gradient Descent?', answer: 'An optimisation algorithm that minimises a loss function by iteratively adjusting parameters in the direction of steepest descent.' },
  { question: 'What is Overfitting?', answer: 'When a model learns the training data too well, including noise, and fails to generalise to new unseen data.' },
  { question: 'What is Backpropagation?', answer: 'An algorithm for training neural networks by computing gradients of the loss w.r.t. each parameter using the chain rule.' },
  { question: 'What is Regularisation?', answer: 'Techniques (L1, L2, Dropout) that reduce overfitting by penalising model complexity.' },
  { question: 'What is a Transformer?', answer: 'A neural network architecture based on self-attention mechanisms, foundational to modern LLMs like GPT and BERT.' },
]

function FlashCard({ q, a }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      className={`${styles.card} ${flipped ? styles.flipped : ''}`}
      onClick={() => setFlipped(f => !f)}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Answer: click to flip back' : 'Question: click to reveal answer'}
      onKeyDown={e => e.key === 'Enter' && setFlipped(f => !f)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.cardTag}>QUESTION</div>
          <div className={styles.cardText}>{q}</div>
          <div className={styles.cardHint}>Click to reveal ↓</div>
        </div>
        <div className={styles.cardBack}>
          <div className={styles.cardTag}>ANSWER</div>
          <div className={styles.cardText}>{a}</div>
          <div className={styles.cardHint}>Click to flip back ↑</div>
        </div>
      </div>
    </div>
  )
}

export default function FlashcardsView({ settings, hasIngested }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!hasIngested) { toast.error('Ingest documents first!'); return }
    setLoading(true)
    try {
      const data = await generateFlashcards({ count: settings.count, model: settings.model })
      setCards(data.flashcards || data)
      toast.success(`${(data.flashcards || data).length} flashcards generated!`)
    } catch {
      setCards(MOCK_CARDS)
      toast('Demo mode: showing sample flashcards', { icon: '💡' })
    } finally {
      setLoading(false)
    }
  }

  const shuffle = () => {
    setCards(c => [...c].sort(() => Math.random() - 0.5))
    toast('Deck shuffled!', { icon: '🔀' })
  }

  return (
    <div className={styles.view} id="flashcardsView">
      <ViewHeader title="Flashcards" subtitle="Click any card to reveal the answer">
        {cards.length > 0 && <SmallBtn onClick={shuffle} id="shuffleBtn">🔀 Shuffle</SmallBtn>}
      </ViewHeader>

      <GenerateBar
        title="Generate Flashcards"
        description="Creates question-answer pairs for active recall practice."
        btnLabel="Generate Flashcards"
        onGenerate={generate}
        loading={loading}
      />

      {!hasIngested && !cards.length && <NoIngest />}
      {loading && <Spinner label="Building flashcard deck…" />}

      {!loading && cards.length > 0 && (
        <>
          <div className={styles.count} id="cardsCount">
            {cards.length} flashcard{cards.length !== 1 ? 's' : ''}
          </div>
          <div className={styles.grid} id="flashcardGrid">
            {cards.map((c, i) => (
              <FlashCard key={i} q={c.question} a={c.answer} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
