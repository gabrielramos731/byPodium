import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import InitialPage from './pages/initialPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <InitialPage />
  </StrictMode>,
)
