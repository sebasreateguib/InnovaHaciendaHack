import { useEffect, useRef, useState } from 'react';
import { Card, Stub, ViewHead } from '../primitives';
import type { AgentId, Mensaje } from '../data';
import { CONVERSACION, PREGUNTAS_RAPIDAS } from '../data';

/* 09 · CFO virtual — el trigger on-demand.
   La respuesta híbrida es el punto: tabla exacta del Cuantitativo más
   la justificación citada del Investigador. Mientras no haya backend,
   el compositor enruta la pregunta y lo dice con todas sus letras en
   lugar de inventar una respuesta plausible. */

const AGENT_LABEL: Record<AgentId, string> = {
  ingesta: 'Ingesta',
  cuantitativo: 'Cuantitativo',
  investigador: 'Investigador',
  predictor: 'Predictor',
};

/** Enrutado por palabras clave: lo mismo que hará el supervisor, pero con
    un modelo en vez de esta lista. Sirve para enseñar el mecanismo. */
function enrutar(texto: string): AgentId[] {
  const t = texto.toLowerCase();
  const rutas: AgentId[] = [];
  if (/cuánto|costo|presupuesto|desviaci|partida|factura|cpi|spi|margen/.test(t))
    rutas.push('cuantitativo');
  if (/por qué|porque|causa|bitácora|contrato|motivo|explica/.test(t))
    rutas.push('investigador');
  if (/si |simula|proyect|escenario|qué pasa|impacto|tir|van/.test(t))
    rutas.push('predictor');
  return rutas.length ? rutas : ['cuantitativo', 'investigador'];
}

export function Chat() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(CONVERSACION);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState<AgentId[] | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const cajaRef = useRef<HTMLTextAreaElement>(null);

  /* El compositor arranca en una línea y crece con el texto hasta el tope
     de .ask__input--grow; a partir de ahí hace scroll interno. Un textarea
     fijo de dos filas ocupaba el doble de alto del que casi siempre usa. */
  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;
    caja.style.height = 'auto';
    caja.style.height = `${caja.scrollHeight}px`;
  }, [texto]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [mensajes, pensando]);

  const enviar = () => {
    const q = texto.trim();
    if (!q || pensando) return;
    const id = `M-${Date.now()}`;
    const rutas = enrutar(q);
    setMensajes((m) => [...m, { id, rol: 'cfo', texto: q }]);
    setTexto('');
    setPensando(rutas);

    window.setTimeout(() => {
      setPensando(null);
      setMensajes((m) => [
        ...m,
        {
          id: `${id}-r`,
          rol: 'forma',
          texto:
            `El supervisor enrutó la consulta a ${rutas
              .map((r) => AGENT_LABEL[r])
              .join(' y ')}. La respuesta se compone en el backend: este ` +
            'prototipo no ejecuta SQL ni recupera vectores, así que aquí no ' +
            'habrá una cifra inventada.',
          agentes: rutas,
        },
      ]);
    }, 1_500);
  };

  return (
    <>
      <ViewHead
        index="09"
        title="CFO virtual"
        lede="Pregunta en lenguaje natural. La respuesta cruza la tabla exacta del Cuantitativo con la causa citada del Investigador."
      />

      <div className="chat">
        <Card title="Conversación" meta="Edificio Panorama" className="chat__card" flush>
          <div className="hilo">
            {mensajes.map((m) => (
              <article
                key={m.id}
                className={`msg msg--${m.rol}`}
              >
                <p className="msg__quien">
                  {m.rol === 'cfo' ? 'Gerencia de finanzas' : 'FORMA'}
                </p>
                <div className="msg__burbuja">
                  <p className="msg__texto">{m.texto}</p>

                  {m.tabla && (
                    <table className="minitabla">
                      <thead>
                        <tr>
                          <th scope="col">Partida</th>
                          <th scope="col">Desviación</th>
                          <th scope="col">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.tabla.map((f) => (
                          <tr key={f.partida}>
                            <th scope="row">{f.partida}</th>
                            <td className="mono-num tone-critical">
                              {f.desviacion}
                            </td>
                            <td className="mono-num">{f.monto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {m.citas && (
                    <ul className="citas">
                      {m.citas.map((c) => (
                        <li key={c.doc}>
                          <a className="cita" href="#/investigador">
                            <span className="cita__doc">{c.doc}</span>
                            <span className="cita__pag mono-num">
                              p. {c.pagina}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {m.agentes && (
                    <p className="msg__agentes">
                      {m.agentes.map((a) => (
                        <span className="msg__agente" key={a}>
                          {AGENT_LABEL[a]}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </article>
            ))}

            {pensando && (
              <article className="msg msg--forma">
                <p className="msg__quien">FORMA</p>
                <div className="msg__burbuja msg__burbuja--pensando">
                  <p className="pensando">
                    <span className="pensando__dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    Deliberando —{' '}
                    {pensando.map((a) => AGENT_LABEL[a]).join(' ∥ ')}
                  </p>
                  <span className="skel-stack">
                    <span className="skel" style={{ width: '86%', height: '0.6875rem' }} />
                    <span className="skel" style={{ width: '64%', height: '0.6875rem', animationDelay: '110ms' }} />
                  </span>
                </div>
              </article>
            )}

            <div ref={finRef} />
          </div>

          <div className="compositor">
            <ul className="chips-row">
              {PREGUNTAS_RAPIDAS.map((p) => (
                <li key={p}>
                  <button
                    className="chip-btn"
                    type="button"
                    onClick={() => setTexto(p)}
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
            <div className="ask">
              <textarea
                ref={cajaRef}
                className="ask__input ask__input--grow"
                rows={1}
                value={texto}
                placeholder="¿Qué partidas de acabados están en riesgo este mes y por qué?"
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
              />
              <button
                className="btn btn--solid ask__go"
                type="button"
                onClick={enviar}
                disabled={!texto.trim() || pensando !== null}
              >
                Enviar
                <kbd>↵</kbd>
              </button>
            </div>
            <Stub endpoint="POST /api/v1/chat (SSE)">
              El enrutado por palabras clave es una maqueta del supervisor; la
              respuesta real llega token a token desde LangGraph.
            </Stub>
          </div>
        </Card>
      </div>
    </>
  );
}
