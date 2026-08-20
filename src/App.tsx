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

const SECTIONS = [
  { label: 'La tesis', href: '#tesis' },
  { label: 'Arquitectura', href: '#arquitectura' },
  { label: 'Triggers', href: '#triggers' },
  { label: 'La consola', href: '#consola' },
  { label: 'Stack', href: '#stack' },
  { label: 'Plan de ejecución', href: '#demo' },
]

const SPECS = [
  { key: 'Caso', value: 'Edificio Panorama · 10 pisos' },
  { key: 'Corte', value: '19 ago 2026 · 09:45 UTC−5' },
  { key: 'Stack', value: 'LangGraph · FastAPI · pgvector' },
]

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
        <div className="foot__top">
          <div className="foot__brand">
            {/* align-items: center dentro de la fila, y la fila entera se
                alinea por caja y no por línea base: la base de un SVG es su
                borde inferior, así que mezclarlo con texto descuadraba todo */}
            <span className="foot__mark-row">
              <Logo size={26} />
              <span className="foot__mark">FORMA</span>
            </span>
            <p className="foot__expansion">
              Financial &amp; Operations Risk Management Assistant
            </p>
            <p className="foot__tagline">
              CFO virtual y auditor autónomo de obras: cruza el ERP con las
              bitácoras de campo para explicar cada desviación de presupuesto.
            </p>
          </div>

          <nav className="foot__col" aria-label="Secciones">
            <h2 className="foot__col-title">Secciones</h2>
            <ul className="foot__links">
              {SECTIONS.map((section) => (
                <li key={section.href}>
                  <a className="foot__link" href={section.href}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="foot__col">
            <h2 className="foot__col-title">Sistema</h2>
            <dl className="foot__specs">
              {SPECS.map((spec) => (
                <div className="foot__spec" key={spec.key}>
                  <dt>{spec.key}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="foot__base">
          <p className="foot__disclaimer">
            Prototipo · todas las cifras son simuladas
          </p>
          <a className="foot__top-link" href="#top">
            Volver arriba
          </a>
        </div>
      </footer>
    </>
  )
}

export default App
