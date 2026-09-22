import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ensureMacElectronDocumentClass } from '@/lib/platform'
import './styles/globals.css'

ensureMacElectronDocumentClass()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
