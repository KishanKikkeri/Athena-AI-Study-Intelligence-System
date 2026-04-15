import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { generateNotes, apiError } from '../services/api'
import { Spinner, GenerateBar, NoIngest, ViewHeader, SmallBtn } from '../components/UI'
import styles from './NotesView.module.css'

// --- Mock fallback (shown when API is offline) ---
const MOCK_NOTES = `# Study Notes

## Introduction to Machine Learning

Machine learning is a subset of **artificial intelligence** that enables systems to learn and improve from experience without being explicitly programmed.

### Core Paradigms

- **Supervised Learning** — Training with labeled input-output pairs. The model learns a mapping function.
- **Unsupervised Learning** — Discovering hidden patterns in unlabeled data (clustering, dimensionality reduction).
- **Reinforcement Learning** — An agent learns by interacting with an environment, maximising cumulative reward.

## Neural Networks

A neural network is a computational graph inspired by biological neurons, composed of layers of interconnected nodes.

### Key Components

1. **Input Layer** — Receives raw features; no computation.
2. **Hidden Layers** — Extract increasingly abstract representations via weighted sums + activations.
3. **Output Layer** — Produces final predictions (class probabilities, regression values, etc.).

### Activation Functions

| Function | Formula | Use Case |
|---|---|---|
| ReLU | \`max(0, x)\` | Default hidden layers |
| Sigmoid | \`1/(1+e^-x)\` | Binary output |
| Softmax | normalised exp | Multi-class output |

## Gradient Descent & Optimisation

Gradient descent minimises a loss function \`L(θ)\` by iteratively updating parameters in the direction of steepest descent.

**Update rule:** \`θ ← θ − α ∇L(θ)\`

> Choosing the right learning rate α is critical — too large causes divergence; too small causes slow convergence.

### Variants

- **Batch GD** — Uses the full dataset per update. Stable but slow.
- **Stochastic GD (SGD)** — Uses one sample. Fast but noisy.
- **Mini-batch GD** — Uses a small batch. Best trade-off.

## Regularisation

Techniques to reduce overfitting:

- **L2 (Ridge)** — Adds \`λ||w||²\` penalty; shrinks weights smoothly.
- **L1 (Lasso)** — Adds \`λ||w||\` penalty; promotes sparsity.
- **Dropout** — Randomly zeroes neurons during training.
- **Early Stopping** — Halt training when validation loss increases.
`

export default function NotesView({ settings, hasIngested }) {
  const [notes, setNotes] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!hasIngested) { toast.error('Ingest documents first!'); return }
    setLoading(true)
    try {
      const data = await generateNotes({ count: settings.count, model: settings.model })
      setNotes(data.notes || data.content || data)
      toast.success('Notes generated!')
    } catch (err) {
      // Demo mode: backend offline → show mock
      setNotes(MOCK_NOTES)
      toast('Demo mode: showing sample notes', { icon: '💡' })
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!notes) return
    navigator.clipboard.writeText(typeof notes === 'string' ? notes : JSON.stringify(notes))
    toast.success('Copied to clipboard!')
  }

  const download = () => {
    if (!notes) return
    const blob = new Blob([notes], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `athena-notes-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className={styles.view} id="notesView">
      <ViewHeader title="Structured Notes" subtitle="AI-generated study notes from your documents">
        <SmallBtn onClick={copy}   id="copyNotesBtn">📋 Copy</SmallBtn>
        <SmallBtn onClick={download} id="downloadNotesBtn">💾 Download</SmallBtn>
      </ViewHeader>

      <GenerateBar
        title="Generate Study Notes"
        description="Creates concise, structured notes with key concepts and summaries."
        btnLabel="Generate Notes"
        onGenerate={generate}
        loading={loading}
      />

      {!hasIngested && !notes && <NoIngest />}

      {loading && <Spinner label="Generating notes from your documents…" />}

      {!loading && notes && (
        <div className={styles.notesBody} id="notesContent">
          <ReactMarkdown
            components={{
              h1: ({children}) => <h1 className={styles.h1}>{children}</h1>,
              h2: ({children}) => <h2 className={styles.h2}>{children}</h2>,
              h3: ({children}) => <h3 className={styles.h3}>{children}</h3>,
              p:  ({children}) => <p  className={styles.p}>{children}</p>,
              ul: ({children}) => <ul className={styles.ul}>{children}</ul>,
              ol: ({children}) => <ol className={styles.ol}>{children}</ol>,
              li: ({children}) => <li className={styles.li}>{children}</li>,
              code: ({children}) => <code className={styles.code}>{children}</code>,
              blockquote: ({children}) => <blockquote className={styles.blockquote}>{children}</blockquote>,
              strong: ({children}) => <strong className={styles.strong}>{children}</strong>,
              table: ({children}) => <table className={styles.table}>{children}</table>,
              th: ({children}) => <th className={styles.th}>{children}</th>,
              td: ({children}) => <td className={styles.td}>{children}</td>,
            }}
          >
            {typeof notes === 'string' ? notes : JSON.stringify(notes, null, 2)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
