import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Register service worker with auto-update
registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível! Deseja atualizar?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('App pronto para uso offline!')
  },
})

createRoot(document.getElementById("root")!).render(<App />);
