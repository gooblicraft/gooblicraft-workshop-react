import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TextureProvider } from './hooks/TextureContext.jsx'
import { ModelProvider } from './hooks/ModelContext.jsx' // I-import mo ito

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TextureProvider>
      <ModelProvider>
        <App />
      </ModelProvider>
    </TextureProvider>
  </StrictMode>,
)