import './sections.css';

const STEPS = [
  {
    num: '1',
    title: 'Dataset mockeado coherente',
    copy: 'Un presupuesto base del Edificio Panorama, 10 pisos, con cinco partidas clave: cimentación, estructura, instalaciones sanitarias, acabados y carpintería.',
  },
  {
    num: '2',
    title: 'El incidente',
    copy: 'En vivo se sube un PDF de factura de concreto con 20% de sobreprecio, junto a una bitácora del residente anotando una contingencia geológica.',
  },
  {
    num: '3',
    title: 'La revelación en pantalla',
    copy: 'El grafo multi-agente resuelve la anomalía frente al jurado: justifica el motivo y proyecta el impacto en la rentabilidad del proyecto en segundos.',
  },
];

export function Demo() {
  return (
    <section className="section" id="demo">
      <header className="section__head">
        <p className="eyebrow">
          <span className="section__index">06</span> Plan de ejecución
        </p>
        <h2 className="section__title">
          El pitch es una <em>demostración</em>, no una lámina.
        </h2>
        <p className="section__lede">
          Tres movimientos: se prepara el terreno, se rompe algo a propósito y
          se deja que el sistema explique qué pasó delante de todos.
        </p>
      </header>

      <div className="demo">
        {STEPS.map((s) => (
          <article className="step" key={s.num}>
            <span className="step__num">{s.num}</span>
            <h3 className="step__title">{s.title}</h3>
            <p className="step__copy">{s.copy}</p>
          </article>
        ))}
      </div>

      <div className="demo__cta">
        <p>Reto 3 · Financiero. Un CFO que no duerme y audita cada factura.</p>
        <a className="btn btn--solid" href="#consola">
          Ver la consola
        </a>
      </div>
    </section>
  );
}
