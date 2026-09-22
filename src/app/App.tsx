import { HomePage } from '../pages/home'
import { AppHeader } from './ui/AppHeader/AppHeader'

export function App() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed top-2 left-4 z-50 -translate-y-24 rounded-lg bg-white px-4 py-2 text-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <AppHeader connectionStatus="disconnected" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-8 outline-none sm:px-6 sm:py-10">
        <HomePage />
      </main>
    </>
  )
}
