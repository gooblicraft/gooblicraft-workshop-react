import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TextureProvider } from './hooks/TextureContext.jsx' // I-import natin ang TextureProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TextureProvider>
      <App />
    </TextureProvider>
  </StrictMode>,
)