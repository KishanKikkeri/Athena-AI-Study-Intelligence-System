import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { chatWithDoc } from '../utils/api'
import DocSelector from '../components/DocSelector'
import { MessageSquare, Send, Bot, User, Trash2 } from 'lucide-react'
import styles from './ChatPage.module.css'

const SUGGESTIONS = [
  'Summarise the key concepts in this document.',
  'What are the main arguments made by the author?',
  'Give me 5 important facts I should remember.',
  'Explain the most difficult concept in simple terms.',
  'What topics should I focus on for an exam?',
]

export default function ChatPage() {
  const [docId, setDocId] = useState('')
  const [messages, setMessages] = useState([]) // { role: 'user'|'assistant', text }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || !docId) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await chatWithDoc(docId, q)
      const answer =
        res.data?.answer ||
        res.data?.response ||
        res.data?.result ||
        res.data?.output ||
        JSON.stringify(res.data)
      setMessages((m) => [...m, { role: 'assistant', text: answer }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: `Error: ${e.message}`, error: true }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const clear = () => setMessages([])

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sideHeader}>
            <span className="badge badge-purple"><MessageSquare size={11} /> Chat</span>
            <h2 className={styles.sideTitle}>Ask Athena</h2>
            <p className={styles.sideSub}>
              Ask questions about any uploaded document. Get accurate, cited answers.
            </p>
          </div>

          <div className={styles.docPicker}>
            <label className={styles.pickerLabel}>Document</label>
            <DocSelector
              value={docId}
              onChange={(id) => { setDocId(id); setMessages([]) }}
              label="Select a document…"
            />
          </div>

          <div className={styles.suggestions}>
            <label className={styles.pickerLabel}>Suggested questions</label>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className={styles.suggestion}
                onClick={() => send(s)}
                disabled={!docId || loading}
              >
                {s}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <span className={styles.chatTitle}>Conversation</span>
            {messages.length > 0 && (
              <button className="btn btn-ghost" onClick={clear} style={{ padding: '5px 10px' }}>
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && !loading && (
              <div className={styles.emptyChat}>
                <Bot size={40} strokeWidth={1} />
                <p>{docId ? 'Ask a question to start the conversation.' : 'Select a document to get started.'}</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`${styles.message} ${styles[m.role]} ${m.error ? styles.errMsg : ''}`}>
                <div className={styles.avatar}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={styles.bubble}>
                  {m.role === 'assistant'
                    ? <div className="md-content"><ReactMarkdown>{m.text}</ReactMarkdown></div>
                    : <p>{m.text}</p>
                  }
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.avatar}><Bot size={14} /></div>
                <div className={styles.bubble}>
                  <div className={styles.thinking}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              rows={1}
              placeholder={docId ? 'Ask a question…' : 'Select a document first…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={!docId || loading}
            />
            <button
              className={`btn btn-primary ${styles.sendBtn}`}
              onClick={() => send()}
              disabled={!input.trim() || !docId || loading}
            >
              {loading ? <div className="spinner" style={{width:16,height:16}} /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
