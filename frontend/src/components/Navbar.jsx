import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, Upload, Brain, HelpCircle, Zap, MessageSquare } from 'lucide-react'
import styles from './Navbar.module.css'

const navItems = [
  { to: '/', label: 'Library', icon: BookOpen, exact: true },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/notes', label: 'Notes', icon: Brain },
  { to: '/flashcards', label: 'Flashcards', icon: Zap },
  { to: '/quiz', label: 'Quiz', icon: HelpCircle },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L20 19H2L11 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="11" cy="13" r="3" fill="currentColor"/>
            </svg>
          </div>
          <span className={styles.logoText}>Athena</span>
        </NavLink>

        <div className={styles.links}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className={styles.statusDot} title="Backend status">
          <span className={styles.dot} />
          <span className={styles.statusLabel}>live</span>
        </div>
      </div>
    </nav>
  )
}
