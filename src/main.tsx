import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/app.tsx'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/700-italic.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
