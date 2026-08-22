import { Shell } from './Shell';
import type { ViewId } from './routes';
import { Panel } from './views/Panel';
import { Alertas } from './views/Alertas';
import { Ingesta } from './views/Ingesta';
import { Cuantitativo } from './views/Cuantitativo';
import { Investigador } from './views/Investigador';
import { Predictor } from './views/Predictor';
import { Orquestador } from './views/Orquestador';
import { Reportes } from './views/Reportes';
import { Chat } from './views/Chat';
import './dashboard.css';
import './views.css';

/** Resolutor de vistas. El `switch` es exhaustivo sobre `ViewId`, así que
    añadir una ruta sin su vista es un error de compilación y no una
    pantalla en blanco en producción. */
function View({ route }: { route: ViewId }) {
  switch (route) {
    case 'panel':
      return <Panel />;
    case 'alertas':
      return <Alertas />;
    case 'ingesta':
      return <Ingesta />;
    case 'cuantitativo':
      return <Cuantitativo />;
    case 'investigador':
      return <Investigador />;
    case 'predictor':
      return <Predictor />;
    case 'orquestador':
      return <Orquestador />;
    case 'reportes':
      return <Reportes />;
    case 'chat':
      return <Chat />;
  }
}

export function Dashboard({ route }: { route: ViewId }) {
  return (
    <Shell route={route}>
      <View route={route} />
    </Shell>
  );
}
