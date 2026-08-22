import './sections.css';

/* Las cifras del lado derecho no son promesas de marketing: salen de la
   misma maqueta que alimenta la consola (corrida #4821, corte de agosto,
   bitácora del 14). Si cambia el dataset, cambia esta tabla. */
const FILAS = [
  {
    eje: 'Tiempo hasta la respuesta',
    antes: 'Semanas',
    antesNota:
      'Cruzar el ERP con las bitácoras a mano, factura por factura, hasta que alguien arma el rompecabezas.',
    despues: '8.6 s',
    despuesNota:
      'Lo que tardan los cuatro agentes en la corrida #4821, con cada paso de la deliberación a la vista.',
  },
  {
    eje: 'Cuándo aparece el desvío',
    antes: 'Mes 12',
    antesNota:
      'El sobrecosto se confirma en la liquidación: 108.7% del presupuesto, con el dinero ya gastado.',
    despues: 'Mes 8',
    despuesNota:
      'Salta al corte de agosto, con 68.4% ejecutado y cuatro meses por delante para renegociar.',
  },
  {
    eje: 'Con qué evidencia',
    antes: '«Pregúntale al residente»',
    antesNota:
      'La causa existe, pero vive en un PDF que nadie va a leer a tiempo.',
    despues: 'Napa freática a 2.10 m',
    despuesNota:
      'Bitácora del residente · 14 ago, p. 3. Cada cifra enlaza a la fuente que la sostiene.',
  },
];

export function Outcome() {
  return (
    <section className="section" id="resultado">
      <header className="section__head" data-reveal>
        <p className="eyebrow">
          <span className="section__index">06</span> El resultado
        </p>
        <h2 className="section__title">
          De la sospecha a la <em>evidencia</em>.
        </h2>
        <p className="section__lede">
          La misma obra y las mismas facturas. Lo que cambia es cuándo aparece
          la desviación y con qué se sostiene la explicación.
        </p>
      </header>

      <div className="block" data-reveal>
        <div className="ledger">
          <div className="ledger__head">
            <span className="ledger__axis-head" aria-hidden="true" />
            <span className="ledger__side">Hoy · revisión manual</span>
            <span className="ledger__side ledger__side--after">Con FORMA</span>
          </div>

          {FILAS.map((f) => (
            <article className="ledger__row" key={f.eje}>
              <h3 className="ledger__axis">{f.eje}</h3>
              <div className="ledger__cell">
                <span className="ledger__tag">Hoy</span>
                <p className="ledger__value">{f.antes}</p>
                <p className="ledger__note">{f.antesNota}</p>
              </div>
              <div className="ledger__cell ledger__cell--after">
                <span className="ledger__tag">Con FORMA</span>
                <p className="ledger__value">{f.despues}</p>
                <p className="ledger__note">{f.despuesNota}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
