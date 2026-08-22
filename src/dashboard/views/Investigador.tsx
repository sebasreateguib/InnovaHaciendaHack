import { useState } from 'react';
import { Card, Empty, Meter, Stub, Tag, ViewHead } from '../primitives';
import type { Chunk } from '../data';
import { CHUNKS } from '../data';
import { useMockLoad } from '../../hooks/useMockLoad';

/* 05 · Investigador — RAG vectorial.
   El agente responde al «por qué», y una respuesta causal sin cita es
   una opinión: cada fragmento llega con documento, página, fecha y
   score, y el visor deja ver el pasaje en su contexto. */

/** Resalta el pasaje que motivó la recuperación, sin usar innerHTML. */
function Resaltado({ texto, marca }: { texto: string; marca: string }) {
  const i = texto.indexOf(marca);
  if (i === -1) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark>{marca}</mark>
      {texto.slice(i + marca.length)}
    </>
  );
}

export function Investigador() {
  const loading = useMockLoad(500);
  const [consulta, setConsulta] = useState('¿por qué subió el costo de cimentación?');
  const [sel, setSel] = useState<Chunk>(CHUNKS[0]);

  const term = consulta.trim().toLowerCase();
  // Filtrado local sobre el mock. La búsqueda real es por similitud de
  // vectores, no por substring: esto solo mantiene la vista viva.
  const resultados =
    term.length < 3
      ? CHUNKS
      : CHUNKS.filter(
          (c) =>
            c.texto.toLowerCase().includes(term) ||
            c.documento.toLowerCase().includes(term) ||
            term
              .split(/\s+/)
              .some((w) => w.length > 4 && c.texto.toLowerCase().includes(w)),
        );

  return (
    <>
      <ViewHead
        index="05"
        title="Agente Investigador"
        lede="Búsqueda semántica sobre bitácoras, contratos, anexos y correos. Responde al porqué del sobrecosto y cita la página exacta."
        actions={
          <span className="card__pill mono-num">1 842 chunks · pgvector</span>
        }
      />

      <div className="grid">
        <Card title="Consulta semántica" span="span 12">
          <div className="ask">
            <input
              className="ask__input ask__input--single"
              value={consulta}
              placeholder="¿Qué explica el sobrecosto de estructura en agosto?"
              onChange={(e) => setConsulta(e.target.value)}
            />
            <button className="btn btn--solid ask__go" type="button">
              Buscar
            </button>
          </div>
          <div className="facets">
            <Tag tone="tech">top-k 4</Tag>
            <Tag>umbral 0.72</Tag>
            <Tag>reranker activo</Tag>
            <Tag>ventana ene–ago 2026</Tag>
          </div>
        </Card>

        <Card
          title="Fragmentos recuperados"
          meta={`${resultados.length} de 1 842`}
          span="span 7"
        >
          {loading ? (
            <ul className="chunks">
              {CHUNKS.map((c, i) => (
                <li className="chunk" key={c.id}>
                  <div className="skel-stack">
                    <span className="skel" style={{ width: '40%', height: '0.625rem', animationDelay: `${i * 70}ms` }} />
                    <span className="skel" style={{ width: '92%', height: '0.6875rem', animationDelay: `${i * 70 + 60}ms` }} />
                    <span className="skel" style={{ width: '76%', height: '0.6875rem', animationDelay: `${i * 70 + 120}ms` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : resultados.length === 0 ? (
            <Empty
              title="Nada por encima del umbral"
              detail="Ningún fragmento supera 0.72 de similitud. Baja el umbral o reformula con los términos del expediente."
            />
          ) : (
            <ul className="chunks">
              {resultados.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`chunk${c.id === sel.id ? ' chunk--on' : ''}`}
                    onClick={() => setSel(c)}
                  >
                    <span className="chunk__head">
                      <span className="chunk__doc">{c.documento}</span>
                      <span className="chunk__score mono-num">
                        {c.score.toFixed(3)}
                      </span>
                    </span>
                    <span className="chunk__meter">
                      <Meter real={c.score} tone="signal" />
                    </span>
                    <span className="chunk__texto">
                      <Resaltado texto={c.texto} marca={c.resaltado} />
                    </span>
                    <span className="chunk__pie mono-num">
                      p. {c.pagina} · {c.fecha} · {c.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Visor del documento"
          meta={`p. ${sel.pagina}`}
          span="span 5"
          actions={<Tag tone="tech">{sel.id}</Tag>}
        >
          {/* Hoja simulada: sitúa la cita en la página en lugar de mostrarla
              suelta, que es como se pierde el contexto de una bitácora */}
          <div className="hoja">
            <div className="hoja__cabecera">
              <span className="mono-num">{sel.documento}</span>
              <span className="mono-num">{sel.fecha}</span>
            </div>
            <div className="hoja__cuerpo">
              <p className="hoja__linea hoja__linea--ghost" />
              <p className="hoja__linea hoja__linea--ghost hoja__linea--corta" />
              <p className="hoja__cita">
                <Resaltado texto={sel.texto} marca={sel.resaltado} />
              </p>
              <p className="hoja__linea hoja__linea--ghost" />
              <p className="hoja__linea hoja__linea--ghost hoja__linea--corta" />
              <p className="hoja__linea hoja__linea--ghost" />
            </div>
            <div className="hoja__pie mono-num">página {sel.pagina}</div>
          </div>

          <div className="detalle__acciones">
            <button className="btn btn--ghost" type="button" disabled>
              Abrir PDF original
            </button>
            <a className="btn btn--ghost" href="#/chat">
              Usar como evidencia
            </a>
          </div>

          <Stub endpoint="GET /api/v1/documentos/:id?page=n">
            El visor real renderiza el PDF y ancla el resaltado a las
            coordenadas devueltas por el OCR.
          </Stub>
        </Card>
      </div>
    </>
  );
}
