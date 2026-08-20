import { Navbar } from './components/Navbar'
import { Hero } from './components/hero'
import { Thesis } from './components/Thesis'
import { Architecture } from './components/Architecture'
import { Triggers } from './components/Triggers'
import { RiskConsole } from './components/RiskConsole'
import { Stack } from './components/Stack'
import { Demo } from './components/Demo'
import { Logo } from './components/Logo'
import { useReveal } from './hooks/useReveal'
import './app.css'

function App() {
  useReveal()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Thesis />
        <Architecture />
        <Triggers />
        <RiskConsole />
        <Stack />
        <Demo />
      </main>
      <footer className="foot">
        <span className="foot__brand">
          <Logo size={24} />
          <span className="foot__mark">FORMA</span>
        </span>
        <span className="foot__note">
          Financial &amp; Operations Risk Management Assistant
        </span>
        <span className="foot__note">Reto 3 · Datos de demostración · 2026</span>
      </footer>
    </>
  )
}

export default App
