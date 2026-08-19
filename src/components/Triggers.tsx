import './sections.css';

const TRIGGERS = [
  {
    num: '01',
    name: 'Ingesta',
    mode: 'Event-driven',
    flow: 'Se sube una factura o valorización en PDF → el OCR parsea los datos → SQL detecta que la partida supera el margen de tolerancia (>5%).',
    outLabel: 'Alerta inmediata',
    out: 'Notificación push o correo con el desglose del sobrecosto y la causa raíz sugerida.',
  },
  {
    num: '02',
    name: 'Cierre de mes',
    mode: 'Batch · programado',
    flow: 'Un cron job semanal o mensual ejecuta el análisis general de todas las partidas y calcula las métricas de avance de obra (curva S).',
    outLabel: 'Reporte ejecutivo',
    out: 'Informe integral de cierre de mes con proyección de rentabilidad final.',
  },
  {
    num: '03',
    name: 'Consulta directa',
    mode: 'On-demand · chat',
    flow: '«¿Qué partidas de acabados están en riesgo de sobrecosto este mes y por qué?», pregunta el gerente de finanzas.',
    outLabel: 'Respuesta híbrida',
    out: 'Tabla SQL de partidas en riesgo más la justificación contextual citando las bitácoras.',
  },
];

export function Triggers() {
  return (
    <section className="section" id="triggers">
      <header className="section__head">
        <p className="eyebrow">
          <span className="section__index">03</span> Triggers
        </p>
        <h2 className="section__title">
          Tres formas de <em>despertar</em> al sistema.
        </h2>
        <p className="section__lede">
          El mismo grafo de agentes responde a un archivo que llega, a un reloj
          que marca fin de mes y a una pregunta escrita en lenguaje natural.
        </p>
      </header>

      <div className="triggers">
        {TRIGGERS.map((t) => (
          <article className="trigger" key={t.num}>
            <div className="trigger__kind">
              <span className="trigger__num">{t.num}</span>
              <span>
                <span className="trigger__name">{t.name}</span>
                <span className="trigger__mode">{t.mode}</span>
              </span>
            </div>
            <p className="trigger__flow">
              <span className="trigger__label">Flujo de ejecución</span>
              {t.flow}
            </p>
            <p className="trigger__out">
              <span className="trigger__label">{t.outLabel}</span>
              {t.out}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
