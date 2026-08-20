import './sections.css';

const AGENTS = [
  {
    num: '1',
    name: 'Agente Ingesta & OCR',
    role: 'Entrada multimodal',
    fn: 'Recibe facturas, remisiones y actas de obra.',
    items: [
      'Extracción visual con LLM multimodal / OCR',
      'Estructura a esquema JSON: RUC, ítems, precios unitarios, partida contable',
      'Almacena vectores en pgvector e inserta filas en PostgreSQL / DuckDB',
    ],
  },
  {
    num: '2',
    name: 'Agente Cuantitativo',
    role: 'Text-to-SQL',
    fn: 'Consultas exactas sobre bases de datos.',
    items: [
      'Calcula valor ganado: CPI y SPI',
      'Compara presupuesto planeado contra costo real ejecutado',
      'Devuelve tablas exactas, sin riesgo de alucinación matemática',
    ],
  },
  {
    num: '3',
    name: 'Agente Investigador',
    role: 'RAG vectorial',
    fn: 'Auditoría causal en textos y bitácoras.',
    items: [
      'Búsqueda semántica en bitácoras diarias, contratos y anexos',
      'Responde al porqué del sobrecosto: lluvias, falta de acero, roturas',
      'Cita la página y el documento exacto de la bitácora',
    ],
  },
  {
    num: '4',
    name: 'Agente Predictor',
    role: 'Simulación',
    fn: 'Modelado de escenarios y proyecciones.',
    items: [
      'Estima la variación en el margen neto del proyecto, TIR y VAN',
      'Simulación what-if: ¿y si el concreto sube 10% adicional?',
      'Sugiere reasignación de partidas de contingencia',
    ],
  },
];

function SupervisorDiagram() {
  const box = (x: number, y: number, label: string, accent = false) => (
    <g key={label}>
      <rect
        x={x}
        y={y}
        width="150"
        height="34"
        rx="3"
        fill={accent ? 'var(--tech-dim)' : 'rgba(148,163,184,0.04)'}
        stroke={accent ? 'var(--tech)' : 'var(--hairline-strong)'}
      />
      <text
        x={x + 75}
        y={y + 21}
        textAnchor="middle"
        fontFamily="var(--mono)"
        fontSize="9"
        letterSpacing="1.4"
        fill={accent ? 'var(--tech)' : 'var(--bone-dim)'}
      >
        {label}
      </text>
    </g>
  );

  return (
    <svg
      className="supervisor__diagram"
      viewBox="0 0 400 250"
      fill="none"
      role="img"
      aria-label="Flujo: el evento entra al orquestador, que llama en paralelo al agente cuantitativo y al investigador, une los hallazgos y pide el impacto al predictor."
    >
      {/* Trazo base: la topología del grafo, siempre visible */}
      <g stroke="var(--hairline-strong)" strokeWidth="1">
        <path d="M200 22 V44" />
        <path d="M200 78 V96 M95 96 H305 M95 96 V114 M305 96 V114" />
        <path d="M95 148 V166 M305 148 V166 M95 166 H305 M200 166 V184" />
      </g>

      {/* Trazo animado encima: el mismo recorrido, en cian y con pulso */}
      <g
        className="supervisor__flow"
        stroke="var(--tech)"
        strokeWidth="1"
        opacity="0.75"
      >
        <path d="M200 22 V44" />
        <path d="M200 78 V96 M95 96 H305 M95 96 V114 M305 96 V114" />
        <path d="M95 148 V166 M305 148 V166 M95 166 H305 M200 166 V184" />
      </g>

      <text
        x="200"
        y="14"
        textAnchor="middle"
        fontFamily="var(--mono)"
        fontSize="8.5"
        letterSpacing="1.6"
        fill="var(--bone-faint)"
      >
        EVENTO · CONSULTA DEL CFO
      </text>

      {box(125, 44, 'ORQUESTADOR', true)}
      {box(20, 114, 'CUANTITATIVO')}
      {box(230, 114, 'INVESTIGADOR')}
      {box(125, 184, 'PREDICTOR')}

      <text
        x="200"
        y="238"
        textAnchor="middle"
        fontFamily="var(--mono)"
        fontSize="8.5"
        letterSpacing="1.6"
        fill="var(--bone-faint)"
      >
        RECOMENDACIÓN DIRECTIVA
      </text>
    </svg>
  );
}

export function Architecture() {
  return (
    <section className="section" id="arquitectura">
      <header className="section__head" data-reveal>
        <p className="eyebrow">
          <span className="section__index">02</span> Arquitectura
        </p>
        <h2 className="section__title">
          Cuatro agentes y un <em>supervisor</em> que delibera.
        </h2>
        <p className="section__lede">
          Cada agente resuelve una sola clase de pregunta con la herramienta
          correcta. La inteligencia del sistema no está en ninguno de ellos:
          está en cómo el orquestador cruza sus respuestas.
        </p>
      </header>

      <div className="block" data-reveal>
        <div className="agents">
          {AGENTS.map((a) => (
            <article className="agent" key={a.num}>
              <div className="agent__top">
                <span className="agent__num">{a.num}</span>
                <span>
                  <span className="agent__name">{a.name}</span>
                  <span className="agent__role">{a.role}</span>
                </span>
              </div>
              <p className="agent__fn">{a.fn}</p>
              <ul className="agent__list">
                {a.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="supervisor">
          <div>
            <p className="eyebrow">Supervisor graph</p>
            <h3 className="supervisor__title">Orquestador central</h3>
            <p className="supervisor__copy">
              Controla el flujo de deliberación. Recibe el evento de disparo
              —una factura con sobrecosto o una consulta del CFO—, llama en
              paralelo al Cuantitativo y al Investigador, une sus hallazgos,
              solicita el cálculo de impacto al Predictor y entrega una sola
              recomendación directiva consolidada.
            </p>
          </div>
          <SupervisorDiagram />
        </div>
      </div>
    </section>
  );
}
