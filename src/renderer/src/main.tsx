import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/index.css'
import App from './App'

// @ts-ignore - Excalidraw is not typed
window.EXCALIDRAW_ASSET_PATH = '/src/assets/'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
