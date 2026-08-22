import { Landing } from './Landing'
import { Dashboard } from './dashboard/Dashboard'
import { useHashRoute } from './hooks/useHashRoute'

/**
 * Raíz de la aplicación.
 *
 * Dos superficies en un mismo bundle: la landing, que explica el plan, y el
 * panel, que lo opera. La frontera es el prefijo `#/` — cualquier otro hash
 * (`#tesis`, `#stack`) sigue siendo un ancla de la landing, así que ninguna
 * de las dos rompe a la otra.
 */
function App() {
  const route = useHashRoute()

  return route ? <Dashboard route={route} /> : <Landing />
}

export default App
