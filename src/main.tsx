import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ReloadPrompt } from './components/ReloadPrompt'

// Track real visible viewport height and scroll focused inputs into view.
// iOS Safari shrinks visualViewport when the keyboard appears; 100dvh/100vh don't track this.
function updateVh() {
  const h = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--vh', `${h * 0.01}px`)
  // After keyboard resize, scroll the focused input into view inside our custom scroll container
  const el = document.activeElement as HTMLElement | null
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
    el.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }
}
updateVh()
window.visualViewport?.addEventListener('resize', updateVh)
window.visualViewport?.addEventListener('scroll', updateVh)
window.addEventListener('resize', updateVh)
document.addEventListener('focusout', updateVh)

// Also handle initial tap-to-focus: keyboard takes ~300ms to animate in,
// so wait for it before scrolling. Covers every input in every screen.
document.addEventListener('focusin', (e) => {
  const el = e.target as HTMLElement
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    setTimeout(() => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), 300)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ReloadPrompt />
    </BrowserRouter>
  </React.StrictMode>
)
