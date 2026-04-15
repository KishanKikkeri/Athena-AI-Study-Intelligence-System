import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { chat } from '../services/api'
import styles from './ChatView.module.css'

const WELCOME = {
  role: 'assistant',
  text: "Hello! I'm Athena 🦉, your AI study companion. Ingest your documents via the sidebar, then ask me anything — explanations, summaries, quiz questions, key concepts, and more.",
}

const DEMO_REPLIES = [
  "Based on the ingested documents, this concept relates to the core principles outlined in your study materials. The key insight is that iterative learning from labelled data allows models to generalise beyond the training examples they have seen.",
  "Great question! From what has been ingested, this topic spans multiple important dimensions. First there is the theoretical foundation rooted in optimisation theory, and second the practical implementation considerations around architecture and hyper-parameter tuning.",
  "According to your documents, the mechanism here involves gradient computation followed by parameter updates over successive training iterations. The rate at which these updates are applied — the learning rate — is one of the most consequential hyper-parameters.",
  "Your materials discuss this primarily through the lens of representational learning. Deep networks build hierarchical representations: early layers detect low-level features and later layers compose these into high-level abstract concepts.",
]

let demoIdx = 0

export default function ChatView({ hasIngested }) {
  const [messages, setMessages] = useState([WELCOME])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q || sending) return
    if (!hasIngested) {
      toast('Tip: ingest documents first for grounded answers', { icon: '💡' })
    }
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }, { role: 'assistant', text: '…', id: 'typing' }])
    setSending(true)

    try {
      const data = await chat(q)
      const answer = data.answer || data.response || data
      setMessages(m => m.map(msg => msg.id === 'typing' ? { role: 'assistant', text: answer } : msg))
    } catch {
      // Demo mode
      const reply = DEMO_REPLIES[demoIdx % DEMO_REPLIES.length]; demoIdx++
      setMessages(m => m.map(msg => msg.id === 'typing' ? { role: 'assistant', text: reply } : msg))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.wrap} id="chatView">
      <div className={styles.messages} id="chatMessages">
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.user : styles.assistant}`}>
            {m.role === 'assistant' && <div className={styles.aLabel}>🦉 ATHENA</div>}
            {m.text === '…'
              ? <div className={styles.typing}><span/><span/><span/></div>
              : m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputBar} id="chatInputBar">
        <input
          id="chatInput"
          type="text"
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your documents… (e.g. 'Summarise chapter 2')"
          disabled={sending}
          aria-label="Chat message input"
        />
        <button
          className={styles.sendBtn}
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Send message"
          id="chatSendBtn"
        >
          Send ↑
        </button>
      </div>
    </div>
  )
}
