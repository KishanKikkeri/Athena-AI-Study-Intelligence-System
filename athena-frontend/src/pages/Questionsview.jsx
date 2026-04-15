import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { generateQuestions } from '../services/api'
import { Spinner, GenerateBar, NoIngest, ViewHeader, SmallBtn } from '../components/UI'
import styles from './QuestionsView.module.css'

const FILTERS = [
  { id: 'all',   label: 'All' },
  { id: 'mcq',   label: 'MCQ' },
  { id: 'short', label: 'Short Answer' },
  { id: 'long',  label: 'Long Answer' },
]

const MOCK_QS = [
  { type:'mcq',   question:'Which of the following best describes supervised learning?',
    options:['Learning without labeled data','Training on labeled input-output pairs','Rewarding an agent for actions','Clustering similar data points'],
    answer: 1 },
  { type:'mcq',   question:'What does the ReLU activation function compute?',
    options:['1/(1+e^-x)','max(0, x)','tanh(x)','x² / 2'],
    answer: 1 },
  { type:'short', question:'Briefly explain what gradient descent does in neural network training.',
    answer:'Gradient descent minimises the loss function by computing gradients and iteratively updating model parameters in the direction of steepest descent, reducing prediction error over successive training steps.' },
  { type:'short', question:'What is the vanishing gradient problem?',
    answer:'In deep networks, gradients shrink exponentially as they propagate backward through many layers with saturating activations (e.g., sigmoid), making early layers learn very slowly or not at all.' },
  { type:'long',  question:'Discuss the trade-offs between L1 and L2 regularisation. When would you prefer one over the other?',
    answer:'L1 (Lasso) adds a sum-of-absolute-values penalty which promotes sparsity — many weights become exactly zero — making it useful for feature selection in high-dimensional problems. L2 (Ridge) adds a sum-of-squares penalty which distributes weight values more smoothly without zeroing them. L2 generally yields better performance when all features are relevant, while L1 is preferred when you expect only a small subset of features to matter. Elastic Net combines both.' },
]

function MCQCard({ q, idx }) {
  const [selected, setSelected] = useState(null)
  return (
    <div className={`${styles.qCard} ${styles.mcqCard}`} id={`question-${idx}`}>
      <div className={styles.qHeader}>
        <span className={`${styles.qNum} ${styles.numMCQ}`}>{idx+1}</span>
        <span className={`${styles.badge} ${styles.badgeMCQ}`}>MCQ</span>
      </div>
      <div className={styles.qText}>{q.question}</div>
      <div className={styles.options}>
        {(q.options||[]).map((opt, j) => {
          const isCorrect = j === q.answer
          const isWrong   = selected === j && j !== q.answer
          const locked    = selected !== null
          return (
            <div
              key={j}
              className={`${styles.option}
                ${!locked ? styles.optionHover : ''}
                ${locked && isCorrect ? styles.optCorrect : ''}
                ${isWrong ? styles.optWrong : ''}
                ${locked ? styles.locked : ''}`}
              onClick={() => !locked && setSelected(j)}
              role="button"
              tabIndex={locked ? -1 : 0}
              aria-label={`Option ${['A','B','C','D'][j]}: ${opt}`}
              onKeyDown={e => e.key === 'Enter' && !locked && setSelected(j)}
              id={`option-${idx}-${j}`}
            >
              <span className={styles.optLetter}>{['A','B','C','D'][j]}</span>
              <span>{opt}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SACard({ q, idx, long }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className={`${styles.qCard} ${long ? styles.longCard : styles.shortCard}`} id={`question-${idx}`}>
      <div className={styles.qHeader}>
        <span className={`${styles.qNum} ${long ? styles.numLong : styles.numShort}`}>{idx+1}</span>
        <span className={`${styles.badge} ${long ? styles.badgeLong : styles.badgeShort}`}>
          {long ? 'Long Answer' : 'Short Answer'}
        </span>
      </div>
      <div className={styles.qText}>{q.question}</div>
      <div className={styles.answerArea}>
        <textarea
          className={styles.textarea}
          rows={long ? 5 : 3}
          placeholder="Type your answer here…"
          aria-label="Your answer"
          id={`textarea-${idx}`}
        />
        <button
          className={styles.revealBtn}
          onClick={() => setRevealed(r => !r)}
          id={`revealBtn-${idx}`}
        >
          {revealed ? 'Hide Answer' : 'Show Answer'}
        </button>
        {revealed && (
          <div className={styles.answerReveal} id={`answer-${idx}`}>
            <strong>Model Answer:</strong> {q.answer}
          </div>
        )}
      </div>
    </div>
  )
}

export default function QuestionsView({ settings, hasIngested }) {
  const [questions, setQuestions] = useState([])
  const [filter, setFilter]       = useState('all')
  const [loading, setLoading]     = useState(false)

  const generate = async () => {
    if (!hasIngested) { toast.error('Ingest documents first!'); return }
    setLoading(true)
    try {
      const data = await generateQuestions({ count: settings.count, model: settings.model })
      setQuestions(data.questions || data)
      toast.success('Questions generated!')
    } catch {
      setQuestions(MOCK_QS)
      toast('Demo mode: showing sample questions', { icon: '💡' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? questions : questions.filter(q => q.type === filter)

  const copy = () => {
    const txt = filtered.map((q,i) => `${i+1}. [${q.type}] ${q.question}\nAnswer: ${q.answer ?? q.options?.[q.answer]}`).join('\n\n')
    navigator.clipboard.writeText(txt)
    toast.success('Questions copied!')
  }

  return (
    <div className={styles.view} id="questionsView">
      <ViewHeader title="Exam Questions" subtitle="MCQs, short & long answer questions">
        {questions.length > 0 && <SmallBtn onClick={copy} id="copyQBtn">📋 Copy All</SmallBtn>}
      </ViewHeader>

      <GenerateBar
        title="Generate Questions"
        description="Creates exam-ready MCQs, short answers, and essay questions."
        btnLabel="Generate Questions"
        onGenerate={generate}
        loading={loading}
      />

      {/* Filter tabs */}
      <div className={styles.filterRow} role="group" aria-label="Filter questions by type">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`${styles.filterBtn} ${filter === f.id ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.id)}
            data-filter={f.id}
            aria-pressed={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!hasIngested && !questions.length && <NoIngest />}
      {loading && <Spinner label="Formulating exam questions…" />}

      {!loading && questions.length > 0 && (
        <>
          <div className={styles.count} id="questionsCount">
            {filtered.length} question{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className={styles.list} id="questionsList">
            {filtered.map((q, i) =>
              q.type === 'mcq'
                ? <MCQCard key={i} q={q} idx={i} />
                : <SACard  key={i} q={q} idx={i} long={q.type === 'long'} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
