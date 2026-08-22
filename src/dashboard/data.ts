/* ============================================================
   FORMA — datos del panel
   Todo lo de este archivo es MOCK. Es el contrato que el backend
   deberá cumplir: cada bloque lleva el endpoint previsto en el
   comentario, de modo que sustituirlo sea cambiar la fuente y no
   la vista.

   Las cifras son internamente consistentes:
     CPI = EV / AC · SPI = EV / PV · EAC = BAC / CPI
   Si se editan a mano, hay que respetar esas tres identidades o
   el panel empezará a contradecirse entre vistas.
   ============================================================ */

export type Severity = 'critical' | 'signal' | 'contained';

export type AgentId = 'ingesta' | 'cuantitativo' | 'investigador' | 'predictor';

export type AgentState = 'idle' | 'running' | 'blocked' | 'ok';

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Crítico',
  signal: 'Elevado',
  contained: 'Contenido',
};

/* ---- Proyecto en foco ---------------------------------------
   GET /api/v1/proyectos/:id */

export const PROJECT = {
  id: 'PAN-10',
  name: 'Edificio Panorama',
  detail: '10 pisos · Lima, San Isidro',
  /** BAC — Budget At Completion, en dólares */
  bac: 4_820_000,
  /** Corte de datos que se está mostrando */
  cutoff: '19 ago 2026 · 09:45 UTC−5',
  margenPlan: 14.2,
  margenProyectado: 11.6,
};

export const PROJECTS = [
  { id: 'PAN-10', name: 'Edificio Panorama', detail: '10 pisos · en obra' },
  { id: 'MRD-04', name: 'Conjunto Miraflores', detail: '4 torres · en obra' },
  { id: 'SRC-01', name: 'Centro Surco', detail: 'retail · cierre' },
];

/* ---- Valor ganado en el corte -------------------------------
   GET /api/v1/proyectos/:id/evm — Agente Cuantitativo (SQL) */

export const EVM = {
  /** Planned Value: % del BAC que debería estar ejecutado hoy */
  pv: 61.0,
  /** Earned Value: % del BAC realmente ganado (avance físico valorizado) */
  ev: 62.9,
  /** Actual Cost: % del BAC realmente gastado */
  ac: 68.4,
  get cpi() {
    return this.ev / this.ac;
  },
  get spi() {
    return this.ev / this.pv;
  },
  /** Estimate At Completion, en % del BAC */
  get eac() {
    return 100 / this.cpi;
  },
};

/* ---- Curva S ------------------------------------------------
   Valores acumulados en % del BAC. `ac` se corta en el mes de
   corte (índice CUTOFF_INDEX); a partir de ahí manda `forecast`.
   GET /api/v1/proyectos/:id/curva-s */

export const CUTOFF_INDEX = 7; // Ago

export const S_CURVE: {
  mes: string;
  pv: number;
  ev: number | null;
  ac: number | null;
  forecast: number | null;
}[] = [
  { mes: 'Ene', pv: 3.2, ev: 3.0, ac: 3.6, forecast: null },
  { mes: 'Feb', pv: 8.4, ev: 8.0, ac: 9.8, forecast: null },
  { mes: 'Mar', pv: 15.6, ev: 15.9, ac: 18.4, forecast: null },
  { mes: 'Abr', pv: 24.8, ev: 25.6, ac: 29.6, forecast: null },
  { mes: 'May', pv: 34.5, ev: 36.2, ac: 42.1, forecast: null },
  { mes: 'Jun', pv: 45.0, ev: 47.4, ac: 54.9, forecast: null },
  { mes: 'Jul', pv: 53.4, ev: 55.6, ac: 62.7, forecast: null },
  { mes: 'Ago', pv: 61.0, ev: 62.9, ac: 68.4, forecast: 68.4 },
  { mes: 'Sep', pv: 70.2, ev: null, ac: null, forecast: 77.9 },
  { mes: 'Oct', pv: 80.1, ev: null, ac: null, forecast: 87.6 },
  { mes: 'Nov', pv: 90.4, ev: null, ac: null, forecast: 98.2 },
  { mes: 'Dic', pv: 100, ev: null, ac: null, forecast: 108.7 },
];

/* ---- Partidas -----------------------------------------------
   GET /api/v1/proyectos/:id/partidas — Agente Cuantitativo */

export type Partida = {
  id: string;
  nombre: string;
  detalle: string;
  /** Presupuesto de la partida, en dólares */
  presupuesto: number;
  /** Costo real ejecutado, en dólares */
  real: number;
  avance: number;
  severity: Severity;
  revisado: string;
  /** Causa raíz hallada por el Investigador, si la hay */
  causa?: string;
};

export const PARTIDAS: Partida[] = [
  {
    id: 'P-02',
    nombre: 'Estructura',
    detalle: 'Concreto premezclado y acero',
    presupuesto: 1_240_000,
    real: 1_492_960,
    avance: 0.74,
    severity: 'critical',
    revisado: '19 ago 2026',
    causa: 'Sobreprecio de 20.4% en concreto premezclado, factura F001-4821',
  },
  {
    id: 'P-01',
    nombre: 'Cimentación',
    detalle: 'Movimiento de tierras',
    presupuesto: 486_200,
    real: 543_570,
    avance: 1,
    severity: 'critical',
    revisado: '18 ago 2026',
    causa: 'Napa freática a 2.10 m: sobreexcavación no prevista',
  },
  {
    id: 'P-04',
    nombre: 'Acabados',
    detalle: 'Interiores y pintura',
    presupuesto: 612_000,
    real: 651_170,
    avance: 0.31,
    severity: 'signal',
    revisado: '17 ago 2026',
    causa: 'Cambio de especificación de porcelanato, orden de cambio OC-11',
  },
  {
    id: 'P-03',
    nombre: 'Inst. sanitarias',
    detalle: 'Redes y aparatos',
    presupuesto: 398_500,
    real: 393_720,
    avance: 0.58,
    severity: 'contained',
    revisado: '15 ago 2026',
  },
  {
    id: 'P-05',
    nombre: 'Carpintería',
    detalle: 'Madera y aluminio',
    presupuesto: 274_900,
    real: 277_100,
    avance: 0.22,
    severity: 'contained',
    revisado: '12 ago 2026',
  },
];

/* ---- Estado de los agentes ----------------------------------
   GET /api/v1/agentes/health — heartbeat del orquestador */

export const AGENTS: {
  id: AgentId;
  nombre: string;
  rol: string;
  herramienta: string;
  state: AgentState;
  nota: string;
}[] = [
  {
    id: 'ingesta',
    nombre: 'Ingesta & OCR',
    rol: 'Entrada multimodal',
    herramienta: 'LLM multimodal',
    state: 'running',
    nota: '2 documentos en cola',
  },
  {
    id: 'cuantitativo',
    nombre: 'Cuantitativo',
    rol: 'Cómputo exacto',
    herramienta: 'Text-to-SQL',
    state: 'ok',
    nota: 'Último query 09:42',
  },
  {
    id: 'investigador',
    nombre: 'Investigador',
    rol: 'Auditoría causal',
    herramienta: 'RAG vectorial',
    state: 'ok',
    nota: '1 842 chunks indexados',
  },
  {
    id: 'predictor',
    nombre: 'Predictor',
    rol: 'Simulación what-if',
    herramienta: 'Monte Carlo',
    state: 'idle',
    nota: 'Sin corrida pendiente',
  },
];

/* ---- Alertas ------------------------------------------------
   GET /api/v1/alertas · WS /api/v1/alertas/stream */

export type Alerta = {
  id: string;
  hora: string;
  fecha: string;
  titulo: string;
  detalle: string;
  fuente: string;
  agente: AgentId;
  severity: Severity;
  partida?: string;
  impacto?: string;
  estado: 'nueva' | 'en revisión' | 'archivada';
};

export const ALERTAS: Alerta[] = [
  {
    id: 'A-118',
    hora: '09:42',
    fecha: '19 ago 2026',
    titulo: 'Sobreprecio en concreto premezclado',
    detalle:
      'La factura F001-4821 excede en 20.4% el precio unitario contratado para la partida de estructura. El contrato marco fija $148.00/m³ y la factura liquida $178.20/m³ sobre 1 240 m³.',
    fuente: 'Agente Cuantitativo · SQL',
    agente: 'cuantitativo',
    severity: 'critical',
    partida: 'Estructura',
    impacto: '−$37 448 sobre el margen',
    estado: 'nueva',
  },
  {
    id: 'A-117',
    hora: '09:42',
    fecha: '19 ago 2026',
    titulo: 'Causa raíz: contingencia geológica',
    detalle:
      'La bitácora del residente del 14 de agosto registra napa freática a 2.10 m, lo que obliga a sobreexcavación y a mayor volumen de concreto en cimentación.',
    fuente: 'Bitácora del residente · 14 ago, p. 3',
    agente: 'investigador',
    severity: 'signal',
    partida: 'Cimentación',
    estado: 'nueva',
  },
  {
    id: 'A-116',
    hora: '09:43',
    fecha: '19 ago 2026',
    titulo: 'Impacto proyectado en el margen',
    detalle:
      'El margen neto cae de 14.2% a 11.6% si no se reasigna la partida de contingencia. La reasignación sugerida recupera 1.8 puntos.',
    fuente: 'Agente Predictor · what-if',
    agente: 'predictor',
    severity: 'signal',
    impacto: '−2.6 pp de margen',
    estado: 'en revisión',
  },
  {
    id: 'A-115',
    hora: '08:20',
    fecha: '19 ago 2026',
    titulo: 'Orden de cambio OC-11 sin respaldo firmado',
    detalle:
      'El cambio de especificación de porcelanato aparece en costos pero no hay adenda firmada indexada en el repositorio documental.',
    fuente: 'Agente Investigador · RAG',
    agente: 'investigador',
    severity: 'signal',
    partida: 'Acabados',
    estado: 'nueva',
  },
  {
    id: 'A-114',
    hora: '07:55',
    fecha: '19 ago 2026',
    titulo: 'Valorización 07 conciliada',
    detalle:
      'Carpintería cuadra con el avance físico reportado en campo. Sin desviación material respecto del presupuesto vigente.',
    fuente: 'Agente Cuantitativo · SQL',
    agente: 'cuantitativo',
    severity: 'contained',
    partida: 'Carpintería',
    estado: 'archivada',
  },
];

/* ---- Cola de ingesta ----------------------------------------
   GET /api/v1/ingesta/cola · POST /api/v1/ingesta (multipart) */

export type DocEstado = 'en cola' | 'ocr' | 'extrayendo' | 'indexado' | 'error';

export type DocIngesta = {
  id: string;
  archivo: string;
  tipo: 'Factura' | 'Bitácora' | 'Contrato' | 'Valorización' | 'Orden de cambio';
  peso: string;
  estado: DocEstado;
  progreso: number;
  confianza: number | null;
  recibido: string;
};

export const COLA: DocIngesta[] = [
  {
    id: 'D-4821',
    archivo: 'F001-4821_concretos-lima.pdf',
    tipo: 'Factura',
    peso: '412 KB',
    estado: 'indexado',
    progreso: 1,
    confianza: 0.97,
    recibido: '09:41',
  },
  {
    id: 'D-4822',
    archivo: 'bitacora_14-ago_residente.pdf',
    tipo: 'Bitácora',
    peso: '1.8 MB',
    estado: 'indexado',
    progreso: 1,
    confianza: 0.91,
    recibido: '09:38',
  },
  {
    id: 'D-4823',
    archivo: 'valorizacion-07_panorama.xlsx',
    tipo: 'Valorización',
    peso: '284 KB',
    estado: 'extrayendo',
    progreso: 0.62,
    confianza: null,
    recibido: '09:44',
  },
  {
    id: 'D-4824',
    archivo: 'OC-11_porcelanato.pdf',
    tipo: 'Orden de cambio',
    peso: '96 KB',
    estado: 'ocr',
    progreso: 0.24,
    confianza: null,
    recibido: '09:45',
  },
  {
    id: 'D-4819',
    archivo: 'contrato-marco_acero-sur.pdf',
    tipo: 'Contrato',
    peso: '3.2 MB',
    estado: 'error',
    progreso: 0.4,
    confianza: null,
    recibido: '08:12',
  },
];

/** Extracción del documento seleccionado — el esquema JSON al que el
    Agente de Ingesta normaliza cualquier entrada. */
export const EXTRACCION = {
  doc: 'D-4821',
  campos: [
    { campo: 'ruc_emisor', valor: '20481235567', confianza: 0.99 },
    { campo: 'razon_social', valor: 'Concretos Lima S.A.C.', confianza: 0.98 },
    { campo: 'serie_numero', valor: 'F001-4821', confianza: 0.99 },
    { campo: 'fecha_emision', valor: '2026-08-18', confianza: 0.97 },
    { campo: 'partida_contable', valor: 'P-02 · Estructura', confianza: 0.88 },
    { campo: 'item', valor: 'Concreto premezclado f’c=280', confianza: 0.95 },
    { campo: 'cantidad', valor: '1 240.00 m³', confianza: 0.96 },
    { campo: 'precio_unitario', valor: '178.20 USD/m³', confianza: 0.99 },
    { campo: 'total', valor: '220 968.00 USD', confianza: 0.99 },
  ],
};

/* ---- Consultas del Cuantitativo -----------------------------
   POST /api/v1/agentes/cuantitativo/query { pregunta } */

export const SQL_EJEMPLO = `SELECT p.nombre                       AS partida,
       p.presupuesto,
       SUM(f.total)                  AS costo_real,
       ROUND(100.0 * (SUM(f.total) - p.presupuesto)
             / p.presupuesto, 2)     AS desviacion_pct
FROM   partidas p
JOIN   facturas f ON f.partida_id = p.id
WHERE  p.proyecto_id = 'PAN-10'
  AND  f.fecha BETWEEN '2026-01-01' AND '2026-08-19'
GROUP  BY p.id, p.nombre, p.presupuesto
HAVING ROUND(100.0 * (SUM(f.total) - p.presupuesto)
             / p.presupuesto, 2) > 5.0
ORDER  BY desviacion_pct DESC;`;

export const CONSULTAS_SUGERIDAS = [
  '¿Qué partidas de acabados están en riesgo de sobrecosto este mes y por qué?',
  'Compara costo real contra presupuesto por partida al corte de agosto',
  '¿Cuál es el CPI por piso en la partida de estructura?',
  'Lista las facturas con precio unitario por encima del contrato marco',
];

/* ---- Recuperación del Investigador --------------------------
   POST /api/v1/agentes/investigador/search { consulta, k } */

export type Chunk = {
  id: string;
  documento: string;
  pagina: number;
  fecha: string;
  score: number;
  texto: string;
  resaltado: string;
};

export const CHUNKS: Chunk[] = [
  {
    id: 'C-9014',
    documento: 'bitacora_14-ago_residente.pdf',
    pagina: 3,
    fecha: '14 ago 2026',
    score: 0.914,
    texto:
      'Se detecta napa freática a 2.10 m de profundidad en el eje C-4. Se ordena sobreexcavación y solado de 15 cm adicionales antes de vaciar. El vaciado de la zapata Z-12 se reprograma para el 16.',
    resaltado: 'napa freática a 2.10 m',
  },
  {
    id: 'C-8871',
    documento: 'contrato-marco_acero-sur.pdf',
    pagina: 12,
    fecha: '02 feb 2026',
    score: 0.878,
    texto:
      'El precio unitario del concreto premezclado f’c=280 kg/cm² queda fijado en USD 148.00 por metro cúbico, con reajuste máximo del 4% anual indexado al índice de materiales de construcción.',
    resaltado: 'USD 148.00 por metro cúbico',
  },
  {
    id: 'C-9102',
    documento: 'OC-11_porcelanato.pdf',
    pagina: 1,
    fecha: '11 ago 2026',
    score: 0.802,
    texto:
      'Se solicita el cambio de especificación de porcelanato nacional a importado en los departamentos del piso 7 al 10. Pendiente de firma por la gerencia de proyecto.',
    resaltado: 'Pendiente de firma',
  },
  {
    id: 'C-8990',
    documento: 'bitacora_09-ago_residente.pdf',
    pagina: 2,
    fecha: '09 ago 2026',
    score: 0.744,
    texto:
      'Lluvia intensa entre las 13:00 y las 17:40 detiene el izaje de encofrados. Se pierde media jornada en el frente de estructura del piso 6.',
    resaltado: 'Lluvia intensa',
  },
];

/* ---- Escenarios del Predictor -------------------------------
   POST /api/v1/agentes/predictor/simular { drivers } */

export const ESCENARIOS = [
  {
    id: 'base',
    nombre: 'Línea base',
    detalle: 'Presupuesto aprobado, sin desviaciones',
    margen: 14.2,
    tir: 18.4,
    van: 612_000,
  },
  {
    id: 'actual',
    nombre: 'Corte 19 ago',
    detalle: 'Con las desviaciones ya registradas',
    margen: 11.6,
    tir: 15.1,
    van: 498_000,
  },
  {
    id: 'mitigado',
    nombre: 'Con reasignación',
    detalle: 'Contingencia P-06 aplicada a estructura',
    margen: 13.4,
    tir: 17.2,
    van: 574_000,
  },
];

/* ---- Traza del orquestador ----------------------------------
   GET /api/v1/runs/:id/trace — LangGraph StateGraph */

export type TraceStep = {
  id: string;
  nodo: string;
  agente: AgentId | 'orquestador';
  estado: 'ok' | 'running' | 'pending';
  ms: number;
  tokens: number;
  salida: string;
};

export const TRACE: TraceStep[] = [
  {
    id: 'T-1',
    nodo: 'trigger.ingesta',
    agente: 'ingesta',
    estado: 'ok',
    ms: 4_120,
    tokens: 3_480,
    salida: 'Factura F001-4821 normalizada a esquema JSON · confianza 0.97',
  },
  {
    id: 'T-2',
    nodo: 'supervisor.plan',
    agente: 'orquestador',
    estado: 'ok',
    ms: 810,
    tokens: 1_240,
    salida: 'Plan: cuantitativo ∥ investigador → predictor → síntesis',
  },
  {
    id: 'T-3',
    nodo: 'agente.cuantitativo',
    agente: 'cuantitativo',
    estado: 'ok',
    ms: 1_640,
    tokens: 2_910,
    salida: 'Desviación +20.4% en P-02 · Estructura, sobre contrato marco',
  },
  {
    id: 'T-4',
    nodo: 'agente.investigador',
    agente: 'investigador',
    estado: 'ok',
    ms: 2_030,
    tokens: 4_180,
    salida: 'Causa: napa freática · bitácora 14 ago p.3 · score 0.914',
  },
  {
    id: 'T-5',
    nodo: 'agente.predictor',
    agente: 'predictor',
    estado: 'running',
    ms: 0,
    tokens: 0,
    salida: 'Simulando impacto sobre margen, TIR y VAN…',
  },
  {
    id: 'T-6',
    nodo: 'supervisor.sintesis',
    agente: 'orquestador',
    estado: 'pending',
    ms: 0,
    tokens: 0,
    salida: 'A la espera del Predictor',
  },
];

/* ---- Reportes -----------------------------------------------
   GET /api/v1/reportes · POST /api/v1/reportes/generar */

export const REPORTES = [
  {
    id: 'R-08',
    titulo: 'Cierre de agosto 2026',
    tipo: 'Batch mensual',
    estado: 'Generando',
    fecha: '31 ago 2026 · 23:00',
    paginas: null as number | null,
  },
  {
    id: 'R-07',
    titulo: 'Cierre de julio 2026',
    tipo: 'Batch mensual',
    estado: 'Listo',
    fecha: '31 jul 2026 · 23:00',
    paginas: 24,
  },
  {
    id: 'R-06b',
    titulo: 'Auditoría de partida · Estructura',
    tipo: 'On-demand',
    estado: 'Listo',
    fecha: '18 ago 2026 · 11:20',
    paginas: 9,
  },
  {
    id: 'R-06',
    titulo: 'Cierre de junio 2026',
    tipo: 'Batch mensual',
    estado: 'Listo',
    fecha: '30 jun 2026 · 23:00',
    paginas: 22,
  },
];

/* ---- Conversación con el CFO virtual ------------------------
   POST /api/v1/chat (stream SSE) */

export type Mensaje = {
  id: string;
  rol: 'cfo' | 'forma';
  texto: string;
  tabla?: { partida: string; desviacion: string; monto: string }[];
  citas?: { doc: string; pagina: number }[];
  agentes?: AgentId[];
};

export const CONVERSACION: Mensaje[] = [
  {
    id: 'M-1',
    rol: 'cfo',
    texto:
      '¿Qué partidas están en riesgo de sobrecosto este mes y por qué?',
  },
  {
    id: 'M-2',
    rol: 'forma',
    texto:
      'Tres partidas superan el margen de tolerancia del 5% al corte del 19 de agosto. Estructura concentra el 78% de la desviación total.',
    tabla: [
      { partida: 'Estructura', desviacion: '+20.4%', monto: '+$252 960' },
      { partida: 'Cimentación', desviacion: '+11.8%', monto: '+$57 370' },
      { partida: 'Acabados', desviacion: '+6.4%', monto: '+$39 170' },
    ],
    citas: [
      { doc: 'bitacora_14-ago_residente.pdf', pagina: 3 },
      { doc: 'contrato-marco_acero-sur.pdf', pagina: 12 },
    ],
    agentes: ['cuantitativo', 'investigador'],
  },
];

export const PREGUNTAS_RAPIDAS = [
  '¿Cuánto cae el margen si el concreto sube 10% más?',
  'Resume la desviación de estructura con sus causas',
  '¿Qué partidas puedo reasignar sin tocar el cronograma?',
];
