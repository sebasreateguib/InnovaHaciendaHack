/* Mapa de vistas del panel. Es la única fuente: de aquí salen el rail,
   la paleta de comandos y el resolutor de rutas, así que añadir una vista
   es añadir una fila. */

export type ViewId =
  | 'panel'
  | 'alertas'
  | 'ingesta'
  | 'cuantitativo'
  | 'investigador'
  | 'predictor'
  | 'orquestador'
  | 'reportes'
  | 'chat';

export type ViewDef = {
  id: ViewId;
  index: string;
  label: string;
  grupo: 'Mando' | 'Agentes' | 'Sistema';
  hint: string;
  /** Contador que el rail muestra a la derecha, si aplica */
  badge?: string;
};

export const VIEWS: ViewDef[] = [
  {
    id: 'panel',
    index: '01',
    label: 'Panel',
    grupo: 'Mando',
    hint: 'Curva S, valor ganado y partidas',
  },
  {
    id: 'alertas',
    index: '02',
    label: 'Alertas',
    grupo: 'Mando',
    hint: 'Disparos del orquestador',
    badge: '3',
  },
  {
    id: 'ingesta',
    index: '03',
    label: 'Ingesta & OCR',
    grupo: 'Agentes',
    hint: 'Facturas, bitácoras y actas',
    badge: '2',
  },
  {
    id: 'cuantitativo',
    index: '04',
    label: 'Cuantitativo',
    grupo: 'Agentes',
    hint: 'Text-to-SQL sobre el ERP',
  },
  {
    id: 'investigador',
    index: '05',
    label: 'Investigador',
    grupo: 'Agentes',
    hint: 'RAG vectorial y citas',
  },
  {
    id: 'predictor',
    index: '06',
    label: 'Predictor',
    grupo: 'Agentes',
    hint: 'Simulación what-if',
  },
  {
    id: 'orquestador',
    index: '07',
    label: 'Orquestador',
    grupo: 'Sistema',
    hint: 'Grafo supervisor y trazas',
  },
  {
    id: 'reportes',
    index: '08',
    label: 'Reportes',
    grupo: 'Sistema',
    hint: 'Cierres batch y on-demand',
  },
  {
    id: 'chat',
    index: '09',
    label: 'CFO virtual',
    grupo: 'Sistema',
    hint: 'Consulta en lenguaje natural',
  },
];

export const GRUPOS = ['Mando', 'Agentes', 'Sistema'] as const;

const IDS = new Set(VIEWS.map((v) => v.id));

/** Resuelve el hash a una vista.
    Solo las rutas con prefijo `#/` son del panel; así los anclas de la
    landing (`#tesis`, `#stack`) siguen funcionando sin colisionar. */
export function resolveRoute(hash: string): ViewId | null {
  if (!hash.startsWith('#/')) return null;
  const id = hash.slice(2).split('?')[0];
  if (id === '') return 'panel';
  return IDS.has(id as ViewId) ? (id as ViewId) : 'panel';
}
