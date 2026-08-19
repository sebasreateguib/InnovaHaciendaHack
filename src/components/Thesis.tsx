import './sections.css';

const WORLDS = [
  {
    kind: 'Mundo A · Estructurado',
    name: 'Lo que el ERP ya sabe',
    tool: 'Text-to-SQL',
    items: [
      'Números de factura y montos de presupuesto',
      'Cubicajes y partidas contables en ERP',
      'Costo real ejecutado contra costo planeado',
    ],
  },
  {
    kind: 'Mundo B · No estructurado',
    name: 'Lo que solo está en papel',
    tool: 'RAG vectorial',
    items: [
      'PDFs de contratos y anexos',
      'Bitácoras de campo del residente',
      'Órdenes de cambio y correos',
    ],
  },
];

export function Thesis() {
  return (
    <section className="section" id="tesis">
      <header className="section__head">
        <p className="eyebrow">
          <span className="section__index">01</span> La tesis
        </p>
        <h2 className="section__title">
          En finanzas inmobiliarias coexisten <em>dos realidades</em>.
        </h2>
        <p className="section__lede">
          Una vive en tablas y otra en documentos. Ningún sistema que atienda
          solo a una de las dos puede auditar una obra: le faltará el número
          exacto o le faltará el motivo.
        </p>
      </header>

      <div className="thesis__split">
        {WORLDS.map((w) => (
          <article className="thesis__col" key={w.kind}>
            <p className="thesis__kind">{w.kind}</p>
            <h3 className="thesis__name">{w.name}</h3>
            <ul className="thesis__list">
              {w.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <span className="thesis__tool">Herramienta · {w.tool}</span>
          </article>
        ))}
      </div>

      <div className="thesis__verdict">
        <p>
          Un RAG vectorial puro comete errores matemáticos graves. Por eso el
          cómputo va por SQL y la causa por vectores.
        </p>
        <span>Sistema híbrido · SQL + RAG documental</span>
      </div>
    </section>
  );
}
