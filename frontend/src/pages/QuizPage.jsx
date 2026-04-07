import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { generateMCQ } from '../utils/api'
import DocSelector from '../components/DocSelector'
import { HelpCircle, Sparkles, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react'
import styles from './QuizPage.module.css'

function parseMCQ(data) {
  if (Array.isArray(data)) return data
  if (data.questions && Array.isArray(data.questions)) return data.questions
  if (data.mcqs && Array.isArray(data.mcqs)) return data.mcqs
  return []
}

function QuizComplete({ score, total, onRestart }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className={styles.complete}>
      <Trophy size={52} className={styles.trophy} />
      <h2 className={styles.completeTitle}>Quiz Complete!</h2>
      <div className={styles.scoreCircle}>
        <span className={styles.scoreNum}>{pct}%</span>
        <span className={styles.scoreSub}>{score} / {total} correct</span>
      </div>
      <p className={styles.completeMsg}>
        {pct >= 80 ? 'Excellent work! You know this material well.' :
         pct >= 60 ? 'Good effort! Review the missed questions and try again.' :
         'Keep studying — you\'ll get there with practice.'}
      </p>
      <button className="btn btn-primary" onClick={onRestart}>
        <RotateCcw size={14} /> Try Again
      </button>
    </div>
  )
}

export default function QuizPage() {
  const [params] = useSearchParams()
  const [docId, setDocId] = useState(params.get('doc') || '')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({}) // { qIdx: choiceIdx }
  const [submitted, setSubmitted] = useState(false)
  const [count, setCount] = useState(5)

  const generate = async () => {
    if (!docId) return
    setLoading(true)
    setError('')
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    try {
      const res = await generateMCQ(docId, count)
      const qs = parseMCQ(res.data)
      setQuestions(qs)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const select = (qIdx, cIdx) => {
    if (submitted) return
    setAnswers((a) => ({ ...a, [qIdx]: cIdx }))
  }

  const submit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }
    setSubmitted(true)
  }

  const score = submitted
    ? questions.reduce((acc, q, i) => {
        const correct = q.correct_answer ?? q.answer ?? q.correct
        const chosen = q.options?.[answers[i]]
        return acc + (chosen === correct || answers[i] === correct ? 1 : 0)
      }, 0)
    : 0

  const restart = () => { setAnswers({}); setSubmitted(false) }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        <div className={styles.header}>
          <span className="badge badge-teal"><HelpCircle size={11} /> Quiz</span>
          <h1 className={styles.title}>MCQ Quiz</h1>
          <p className={styles.sub}>Test your knowledge with AI-generated multiple choice questions.</p>
        </div>

        <div className={styles.controls}>
          <DocSelector value={docId} onChange={setDocId} label="Choose a document…" />
          <div className={styles.countSelector}>
            <label>Questions:</label>
            {[5, 10, 15].map((n) => (
              <button
                key={n}
                className={`${styles.countBtn} ${count === n ? styles.countActive : ''}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={!docId || loading}>
            {loading
              ? <><div className="spinner" /> Generating…</>
              : <><Sparkles size={15} /> Generate Quiz</>
            }
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {submitted && questions.length > 0 && (
          <QuizComplete score={score} total={questions.length} onRestart={restart} />
        )}

        {!submitted && questions.length > 0 && (
          <div className={styles.quiz}>
            {questions.map((q, qi) => {
              const options = q.options || q.choices || []
              const chosen = answers[qi]
              return (
                <div key={qi} className={styles.question}>
                  <div className={styles.qHeader}>
                    <span className={styles.qNum}>Q{qi + 1}</span>
                    <p className={styles.qText}>{q.question || q.text}</p>
                  </div>
                  <div className={styles.options}>
                    {options.map((opt, oi) => (
                      <button
                        key={oi}
                        className={`${styles.option} ${chosen === oi ? styles.optionSelected : ''}`}
                        onClick={() => select(qi, oi)}
                      >
                        <span className={styles.optionLetter}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className={styles.submitRow}>
              <span className={styles.answered}>
                {Object.keys(answers).length} / {questions.length} answered
              </span>
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={Object.keys(answers).length < questions.length}
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}

        {!questions.length && !loading && !error && (
          <div className={styles.placeholder}>
            <HelpCircle size={48} strokeWidth={1} />
            <p>Select a document and generate a quiz.</p>
          </div>
        )}

        {loading && (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>Building your quiz…</p>
            <span>Usually takes 20–40 seconds</span>
          </div>
        )}
      </div>
    </div>
  )
}
