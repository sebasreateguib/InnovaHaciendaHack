import './risk-console.css';

type Severity = 'critical' | 'signal' | 'contained';

const METRICS: {
  label: string;
  value: string;
  unit?: string;
  note: string;
  fill: number;
  tone: Severity;
}[] = [
  {
    label: 'Presupuesto ejecutado',
    value: '68.4',
    unit: '% de $4.82M',
    note: 'Edificio Panorama · 10 pisos',
    fill: 0.684,
    tone: 'signal',
  },
  {
    label: 'CPI · valor ganado',
    value: '0.92',
    unit: 'índice',
    note: 'Bajo 1.00: se gasta más de lo ganado',
    fill: 0.92,
    tone: 'critical',
  },
  {
    label: 'SPI · curva S',
    value: '1.03',
    unit: 'índice',
    note: 'Avance físico sobre lo planeado',
    fill: 1,
    tone: 'contained',
  },
  {
    label: 'Partidas en riesgo',
    value: '03',
    unit: 'de 05',
    note: '2 sobre el margen de tolerancia (5%)',
    fill: 0.6,
    tone: 'critical',
  },
];

const PARTIDAS: {
  partida: string;
  detail: string;
  budget: string;
  deviation: string;
  trend: string;
  severity: Severity;
  reviewed: string;
}[] = [
  {
    partida: 'Estructura',
    detail: 'Concreto premezclado y acero',
    budget: '$1.24M',
    deviation: '+20.4%',
    trend: '↑',
    severity: 'critical',
    reviewed: '19 ago 2026',
  },
  {
    partida: 'Cimentación',
    detail: 'Movimiento de tierras',
    budget: '$486.2K',
    deviation: '+11.8%',
    trend: '↑',
    severity: 'critical',
    reviewed: '18 ago 2026',
  },
  {
    partida: 'Acabados',
    detail: 'Interiores y pintura',
    budget: '$612.0K',
    deviation: '+6.4%',
    trend: '↑',
    severity: 'signal',
    reviewed: '17 ago 2026',
  },
  {
    partida: 'Inst. sanitarias',
    detail: 'Redes y aparatos',
    budget: '$398.5K',
    deviation: '−1.2%',
    trend: '↓',
    severity: 'contained',
    reviewed: '15 ago 2026',
  },
  {
    partida: 'Carpintería',
    detail: 'Madera y aluminio',
    budget: '$274.9K',
    deviation: '+0.8%',
    trend: '→',
    severity: 'contained',
    reviewed: '12 ago 2026',
  },
];

const ALERTS: {
  time: string;
  title: string;
  detail: string;
  source: string;
  severity: Severity;
}[] = [
  {
    time: '09:42',
    title: 'Sobreprecio en concreto premezclado',
    detail:
      'La factura F001-4821 excede en 20.4% el precio unitario contratado para la partida de estructura.',
    source: 'Agente Cuantitativo · SQL',
    severity: 'critical',
  },
  {
    time: '09:42',
    title: 'Causa raíz: contingencia geológica',
    detail:
      'Napa freática a 2.10 m obliga a sobreexcavación y mayor volumen de concreto en cimentación.',
    source: 'Bitácora del residente · 14 ago, p. 3',
    severity: 'signal',
  },
  {
    time: '09:43',
    title: 'Impacto proyectado en el margen',
    detail:
      'El margen neto cae de 14.2% a 11.6% si no se reasigna la partida de contingencia.',
    source: 'Agente Predictor · what-if',
    severity: 'signal',
  },
  {
    time: '07:55',
    title: 'Valorización 07 conciliada',
    detail:
      'Carpintería cuadra con el avance físico reportado en campo. Sin desviación material.',
    source: 'Agente Cuantitativo · SQL',
    severity: 'contained',
  },
];

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Crítico',
  signal: 'Elevado',
  contained: 'Contenido',
};

export function RiskConsole() {
  return (
    <section className="console" id="consola">
      <header className="console__head" data-reveal>
        <p className="eyebrow">
          <span className="console__index">04</span> La consola
        </p>
        <h2 className="console__title">
          Una sola lectura de la <em>obra</em> y sus fallas.
        </h2>
        <p className="console__stamp mono-num">
          Edificio Panorama · corte 19 ago 2026 · 09:45 UTC−5 · datos simulados
        </p>
      </header>

      <div className="metrics" data-reveal>
        {METRICS.map((m) => (
          <article className={`metric metric--${m.tone}`} key={m.label}>
            <p className="metric__label">{m.label}</p>
            <p className="metric__value mono-num">
              {m.value}
              <span className="metric__unit">{m.unit}</span>
            </p>
            <div className="metric__meter" aria-hidden="true">
              <span style={{ transform: `scaleX(${m.fill})` }} />
            </div>
            <p className="metric__note">{m.note}</p>
          </article>
        ))}
      </div>

      <div className="console__split" data-reveal>
        <div className="panel">
          <div className="panel__head">
            <h3 className="panel__title">Partidas bajo vigilancia</h3>
            <span className="panel__count mono-num">05 / 05</span>
          </div>

          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Partida</th>
                <th scope="col">Presupuesto</th>
                <th scope="col">Desviación</th>
                <th scope="col">Estado</th>
                <th scope="col">Revisión</th>
              </tr>
            </thead>
            <tbody>
              {PARTIDAS.map((p) => (
                <tr key={p.partida}>
                  <th scope="row">
                    <span className="ledger__entity">{p.partida}</span>
                    <span className="ledger__sector">{p.detail}</span>
                  </th>
                  <td className="mono-num">{p.budget}</td>
                  <td>
                    <span className="ledger__score mono-num">{p.deviation}</span>
                    <span className={`ledger__trend ledger__trend--${p.severity}`}>
                      {p.trend}
                    </span>
                  </td>
                  <td>
                    <span className={`chip chip--${p.severity}`}>
                      {SEVERITY_LABEL[p.severity]}
                    </span>
                  </td>
                  <td className="mono-num ledger__date">{p.reviewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="panel panel--feed">
          <div className="panel__head">
            <h3 className="panel__title">Deliberación de agentes</h3>
            <span className="panel__live">
              <span className="pulse" aria-hidden="true" />
              En vivo
            </span>
          </div>

          <ol className="feed">
            {ALERTS.map((a) => (
              <li className={`feed__item feed__item--${a.severity}`} key={a.title}>
                <span className="feed__time mono-num">{a.time}</span>
                <p className="feed__title">{a.title}</p>
                <p className="feed__detail">{a.detail}</p>
                <p className="feed__source">{a.source}</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
