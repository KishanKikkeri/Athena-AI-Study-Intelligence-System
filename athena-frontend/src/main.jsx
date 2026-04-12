import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1c1f2b',
          color: '#e8e4d9',
          border: '1px solid #272b3a',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
        },
        success: { iconTheme: { primary: '#8ecfb0', secondary: '#0b0c10' } },
        error:   { iconTheme: { primary: '#e87b7b', secondary: '#0b0c10' } },
      }}
    />
  </React.StrictMode>
)
