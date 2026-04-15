import React, { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { generateQuiz } from '../services/api'
import { Spinner, GenerateBar, NoIngest, ViewHeader, SmallBtn } from '../components/UI'
import styles from './QuizView.module.css'

const MOCK_QUIZ = [
  { question: 'What is supervised learning?',
    options: ['Learning without labels','Training on labeled data','Rewarding agents','Compressing data'],
    answer: 1 },
  { question: 'Which optimizer adapts the learning rate for each parameter?',
    options: ['SGD','Batch GD','Adam','Perceptron'],
    answer: 2 },
  { question: 'What does "dropout" do during training?',
    options: ['Increases weights','Randomly zeros neurons','Adds L2 penalty','Reduces batch size'],
    answer: 1 },
  { question: 'What is the purpose of a validation set?',
    options: ['To train the model','To tune hyperparameters','To test final performance','To store embeddings'],
    answer: 1 },
  { question: 'Which layer type is most common in image recognition CNNs?',
    options: ['Recurrent','Dense / Fully Connected','Convolutional','Embedding'],
    answer: 2 },
]

export default function QuizView({ settings, hasIngested }) {
  const [quizData,  setQuizData]  = useState([])
  const [phase,     setPhase]     = useState('idle')   // idle | loading | active | result
  const [idx,       setIdx]       = useState(0)
  const [score,     setScore]     = useState(0)
  const [selected,  setSelected]  = useState(null)     // chosen option index or null

  const generate = async () => {
    if (!hasIngested) { toast.error('Ingest documents first!'); return }
    setPhase('loading')
    try {
      const data = await generateQuiz({ count: settings.count, model: settings.model })
      const qs = data.questions || data.quiz || data
      setQuizData(qs)
      startQuiz(qs)
    } catch {
      setQuizData(MOCK_QUIZ)
      startQuiz(MOCK_QUIZ)
      toast('Demo mode: showing sample quiz', { icon: '💡' })
    }
  }

  const startQuiz = useCallback((qs) => {
    setIdx(0); setScore(0); setSelected(null)
    setPhase('active')
  }, [])

  const retry = () => startQuiz(quizData)

  const choose = (j) => {
    if (selected !== null) return
    setSelected(j)
    if (j === quizData[idx].answer) setScore(s => s + 1)
  }

  const next = () => {
    const nextIdx = idx + 1
    if (nextIdx >= quizData.length) {
      setPhase('result')
    } else {
      setIdx(nextIdx)
      setSelected(null)
    }
  }

  const skip = () => {
    const nextIdx = idx + 1
    if (nextIdx >= quizData.length) { setPhase('result'); return }
    setIdx(nextIdx); setSelected(null)
  }

  if (phase === 'loading') return (
    <div className={styles.view}>
      <ViewHeader title="Auto Quiz" subtitle="Test your understanding" />
      <Spinner label="Generating quiz questions…" />
    </div>
  )

  if (phase === 'result') {
    const total = quizData.length
    const pct   = Math.round((score / total) * 100)
    const grade = pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good Job!' : '📚 Keep Studying!'
    return (
      <div className={styles.view} id="quizView">
        <ViewHeader title="Auto Quiz" subtitle="Quiz complete">
          <SmallBtn onClick={retry}    id="quizRestartBtn" variant="ghost">🔄 Retry</SmallBtn>
          <SmallBtn onClick={generate} id="quizNewBtn"     variant="primary">🎲 New Quiz</SmallBtn>
        </ViewHeader>
        <div className={styles.resultCard} id="quizResultCard">
          <div className={styles.ring}>{pct}%</div>
          <div className={styles.grade}>{grade}</div>
          <div className={styles.sub}>
            You scored <strong>{score}</strong> out of <strong>{total}</strong> questions.
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'active') {
    const q     = quizData[idx]
    const total = quizData.length
    const pct   = ((idx) / total) * 100

    return (
      <div className={styles.view} id="quizView">
        <ViewHeader title="Auto Quiz" subtitle={`Question ${idx+1} of ${total}`}>
          <SmallBtn onClick={retry} id="quizRestartBtn">🔄 Restart</SmallBtn>
        </ViewHeader>

        {/* Progress */}
        <div className={styles.progressBar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.quizMeta}>
          <span id="quizQNum">Question {idx+1} of {total}</span>
          <span id="quizScore">Score: {score}</span>
        </div>

        {/* Question card */}
        <div className={styles.quizCard}>
          <div className={styles.quizQuestion} id="quizQuestion">{q.question}</div>
          <div className={styles.quizOptions} id="quizOptions">
            {(q.options || []).map((opt, j) => {
              const isCorrect = j === q.answer
              const isWrong   = selected === j && !isCorrect
              const locked    = selected !== null
              return (
                <div
                  key={j}
                  id={`quizOption-${j}`}
                  className={`${styles.quizOpt}
                    ${!locked ? styles.quizOptHover : ''}
                    ${locked && isCorrect ? styles.optCorrect : ''}
                    ${isWrong ? styles.optWrong : ''}
                    ${locked ? styles.locked : ''}`}
                  onClick={() => choose(j)}
                  role="button"
                  tabIndex={locked ? -1 : 0}
                  aria-label={`Option ${['A','B','C','D'][j]}: ${opt}`}
                  onKeyDown={e => e.key === 'Enter' && choose(j)}
                >
                  <span className={styles.quizLetter}>{['A','B','C','D'][j]}.</span>
                  <span>{opt}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.quizNav}>
          <button className={styles.skipBtn} onClick={skip}>Skip →</button>
          {selected !== null && (
            <button className={styles.nextBtn} onClick={next} id="quizNextBtn">
              {idx + 1 >= quizData.length ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // idle
  return (
    <div className={styles.view} id="quizView">
      <ViewHeader title="Auto Quiz" subtitle="Test your understanding with scored questions" />
      {!hasIngested && <NoIngest />}
      <GenerateBar
        title="Start Quiz"
        description="Auto-generated scored quiz from your ingested documents."
        btnLabel="Start Quiz"
        onGenerate={generate}
        loading={false}
      />
    </div>
  )
}
