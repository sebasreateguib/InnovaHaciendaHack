import './sections.css';

const STACK = [
  {
    component: 'Orquestador',
    tech: 'LangGraph · Python StateGraph',
    why: 'Manejo de estado multi-agente, ciclos de validación y tool calling determinista.',
  },
  {
    component: 'Modelos LLM & OCR',
    tech: 'Claude Opus 4.5 · GPT-4o · Gemini 1.5 Pro',
    why: 'Extracción multimodal de facturas en PDF y síntesis ejecutiva de alto nivel.',
  },
  {
    component: 'Almacenamiento híbrido',
    tech: 'PostgreSQL + pgvector · Supabase',
    why: 'Tablas relacionales de costos y partidas junto a la base vectorial de chunks, unificadas.',
  },
  {
    component: 'Backend API',
    tech: 'FastAPI · Python',
    why: 'Servicios REST, webhooks de ingesta y endpoints de streaming de agentes.',
  },
  {
    component: 'Frontend dashboard',
    tech: 'React · Vite · TypeScript',
    why: 'Panel financiero con curva S, visor de alertas y chat con el CFO virtual.',
  },
];

export function Stack() {
  return (
    <section className="section" id="stack">
      <header className="section__head">
        <p className="eyebrow">
          <span className="section__index">05</span> Stack
        </p>
        <h2 className="section__title">
          Piezas conocidas, <em>ensambladas</em> para el MVP.
        </h2>
        <p className="section__lede">
          Nada exótico: todo el stack está elegido para levantarse en las horas
          que dura un hackathon y seguir en pie después.
        </p>
      </header>

      <table className="stack">
        <thead>
          <tr>
            <th scope="col">Componente</th>
            <th scope="col">Tecnología</th>
            <th scope="col">Propósito en el demo</th>
          </tr>
        </thead>
        <tbody>
          {STACK.map((s) => (
            <tr key={s.component}>
              <th scope="row" className="stack__component">
                {s.component}
              </th>
              <td className="stack__tech">{s.tech}</td>
              <td className="stack__why">{s.why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
