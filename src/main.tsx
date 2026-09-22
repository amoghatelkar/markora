import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ensureMacDocumentAttributes } from '@/lib/platform'
import './styles/globals.css'

ensureMacDocumentAttributes()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
