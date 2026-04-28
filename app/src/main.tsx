import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import './styles/responsive.css'
import App from './App.tsx'
import { ThemeProvider } from './hooks/useTheme'

console.log('[main.tsx] Starting React app...')
const rootElement = document.getElementById('root')
console.log('[main.tsx] Root element:', rootElement)

createRoot(rootElement!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
