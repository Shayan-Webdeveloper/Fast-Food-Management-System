import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

Sentry.init({
  dsn: 'https://b44bbf9d218edf0b5051b536bf6c9a88@o4511919018344448.ingest.de.sentry.io/4511919029878864',
})

function FallbackUI({ resetError }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fffaf3] px-4 text-center">
      <span className="text-5xl">😕</span>
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-slate-500">
        We hit an unexpected error. Try refreshing the page — if this keeps happening, please contact us.
      </p>
      <button
        onClick={() => { resetError(); window.location.href = '/' }}
        className="mt-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Go back home
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={FallbackUI}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)