import { useState } from 'react';
import { Card, Stub, Tag, ViewHead } from '../primitives';
import type { TraceStep } from '../data';
import { TRACE } from '../data';

/* 07 · Orquestador — el grafo supervisor.
   La inteligencia del sistema no está en ningún agente sino en cómo se
   cruzan sus respuestas, así que esta vista muestra el grafo y la traza
   como objeto de primera clase: qué nodo corrió, cuánto tardó y qué
   devolvió. Sin eso, el sistema es una caja negra que da cifras. */

const NODOS = [
  { id: 'T-1', x: 380, y: 40, w: 190, label: 'trigger.ingesta', sub: 'OCR' },
  { id: 'T-2', x: 380, y: 118, w: 190, label: 'supervisor.plan', sub: 'orquestador' },
  { id: 'T-3', x: 180, y: 210, w: 200, label: 'agente.cuantitativo', sub: 'SQL' },
  { id: 'T-4', x: 570, y: 210, w: 200, label: 'agente.investigador', sub: 'RAG' },
  { id: 'T-5', x: 380, y: 300, w: 190, label: 'agente.predictor', sub: 'what-if' },
  { id: 'T-6', x: 380, y: 382, w: 190, label: 'supervisor.sintesis', sub: 'salida' },
];

const ARISTAS: [string, string][] = [
  ['T-1', 'T-2'],
  ['T-2', 'T-3'],
  ['T-2', 'T-4'],
  ['T-3', 'T-5'],
  ['T-4', 'T-5'],
  ['T-5', 'T-6'],
];

const nodo = (id: string) => NODOS.find((n) => n.id === id)!;
const estado = (id: string) =>
  TRACE.find((t) => t.id === id)?.estado ?? 'pending';

export function Orquestador() {
  const [sel, setSel] = useState<TraceStep>(TRACE[2]);

  const totalMs = TRACE.reduce((a, t) => a + t.ms, 0);
  const totalTk = TRACE.reduce((a, t) => a + t.tokens, 0);
  const maxMs = Math.max(...TRACE.map((t) => t.ms), 1);

  return (
    <>
      <ViewHead
        index="07"
        title="Orquestador"
        lede="Grafo de estado del supervisor. Cuantitativo e Investigador corren en paralelo; el Predictor espera a ambos y la síntesis espera al Predictor."
        actions={
          <>
            <span className="card__pill mono-num">run #4821 · 19 ago 09:42</span>
            <button className="btn btn--ghost" type="button" disabled>
              Reproducir traza
            </button>
          </>
        }
      />

      <div className="grid">
        <Card
          title="Grafo de ejecución"
          meta="LangGraph StateGraph"
          span="span 7"
        >
          <svg
            viewBox="0 0 950 440"
            className="graph"
            role="img"
            aria-label="Grafo del orquestador: trigger, plan, agentes en paralelo, predictor y síntesis"
          >
            {ARISTAS.map(([a, b]) => {
              const na = nodo(a);
              const nb = nodo(b);
              const x1 = na.x;
              const y1 = na.y + 26;
              const x2 = nb.x;
              const y2 = nb.y - 26;
              const my = (y1 + y2) / 2;
              const activa = estado(a) === 'ok';
              return (
                <path
                  key={`${a}-${b}`}
                  d={`M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
                  className={`graph__edge${activa ? ' graph__edge--on' : ''}`}
                />
              );
            })}

            {NODOS.map((n) => {
              const st = estado(n.id);
              return (
                <g
                  key={n.id}
                  className={`graph__node graph__node--${st}${n.id === sel.id ? ' graph__node--sel' : ''}`}
                  onClick={() => {
                    const step = TRACE.find((t) => t.id === n.id);
                    if (step) setSel(step);
                  }}
                >
                  <rect
                    x={n.x - n.w / 2}
                    y={n.y - 26}
                    width={n.w}
                    height={52}
                    rx="8"
                  />
                  <text x={n.x} y={n.y - 3} className="graph__label">
                    {n.label}
                  </text>
                  <text x={n.x} y={n.y + 14} className="graph__sub">
                    {n.sub}
                  </text>
                </g>
              );
            })}

            <text x={475} y={168} className="graph__par">
              en paralelo
            </text>
          </svg>

          <p className="card__foot">
            Haz clic en un nodo para ver su salida. El nodo del Predictor sigue
            corriendo: la síntesis no arranca hasta que devuelva el impacto.
          </p>
        </Card>

        <Card
          title="Traza"
          meta={`${(totalMs / 1000).toFixed(1)} s · ${totalTk.toLocaleString('es-PE')} tokens`}
          span="span 5"
        >
          <ol className="traza">
            {TRACE.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`traza__item traza__item--${t.estado}${
                    t.id === sel.id ? ' traza__item--on' : ''
                  }`}
                  onClick={() => setSel(t)}
                >
                  <span className="traza__nodo mono-num">{t.nodo}</span>
                  <span className="traza__bar" aria-hidden="true">
                    <span style={{ width: `${(t.ms / maxMs) * 100}%` }} />
                  </span>
                  <span className="traza__ms mono-num">
                    {t.estado === 'ok'
                      ? `${(t.ms / 1000).toFixed(2)} s`
                      : t.estado === 'running'
                        ? '···'
                        : '—'}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </Card>

        <Card
          title="Salida del nodo"
          meta={sel.nodo}
          span="span 12"
          actions={
            <Tag tone={sel.estado === 'running' ? 'live' : 'tech'}>
              {sel.estado === 'ok'
                ? 'completado'
                : sel.estado === 'running'
                  ? 'ejecutando'
                  : 'en espera'}
            </Tag>
          }
        >
          <pre className="sql sql--json">
            <code>{JSON.stringify(
              {
                run_id: '4821',
                node: sel.nodo,
                agent: sel.agente,
                status: sel.estado,
                latency_ms: sel.ms,
                tokens: sel.tokens,
                output: sel.salida,
              },
              null,
              2,
            )}</code>
          </pre>
          <Stub endpoint="GET /api/v1/runs/:id/trace (SSE)">
            La traza en vivo llega por streaming: cada nodo emite su estado al
            entrar y al salir, y el grafo se colorea con ese evento.
          </Stub>
        </Card>
      </div>
    </>
  );
}
