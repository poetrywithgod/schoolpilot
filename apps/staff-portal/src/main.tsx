import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from './store/themeStore'

const ThemeWrapper = () => {
  const { theme } = useThemeStore()

  return (
    <div className={theme === 'dark' ? 'dark' : ''} style={{ minHeight: '100vh' }}>
      <App />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeWrapper />
  </StrictMode>,
)