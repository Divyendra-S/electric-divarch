import './assets/main.css'
import { Toaster } from './components/ui/sonner'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './components/theme-provider'
import { Provider } from 'jotai'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider >
        <Toaster />
        <App />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
)
