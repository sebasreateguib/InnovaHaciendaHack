import { useState } from 'react';
import { Card, Chip, Empty, SkeletonRows, Stub, ViewHead } from '../primitives';
import type { Severity } from '../data';
import { ALERTAS, SEVERITY_LABEL } from '../data';
import { useMockLoad } from '../../hooks/useMockLoad';

/* 02 · Alertas — la bandeja del trigger event-driven.
   Una alerta sin su causa y sin su impacto es ruido, así que el detalle
   siempre muestra las tres capas: qué pasó, por qué y cuánto cuesta. */

const FILTROS: (Severity | 'todas')[] = [
  'todas',
  'critical',
  'signal',
  'contained',
];

export function Alertas() {
  const loading = useMockLoad(520);
  const [filtro, setFiltro] = useState<Severity | 'todas'>('todas');
  const [selId, setSelId] = useState(ALERTAS[0].id);

  const lista =
    filtro === 'todas' ? ALERTAS : ALERTAS.filter((a) => a.severity === filtro);
  const sel = ALERTAS.find((a) => a.id === selId) ?? lista[0];

  return (
    <>
      <ViewHead
        index="02"
        title="Alertas"
        lede="Disparos automáticos del orquestador. Una partida que supera el 5% de tolerancia abre una alerta y arranca el grafo de agentes."
        actions={
          <button className="btn btn--ghost" type="button" disabled>
            Marcar todas como leídas
          </button>
        }
      />

      <div className="filtros" role="group" aria-label="Filtrar por severidad">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            className={`filtro${filtro === f ? ' filtro--on' : ''}`}
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
          >
            {f === 'todas' ? 'Todas' : SEVERITY_LABEL[f]}
            <span className="filtro__count mono-num">
              {f === 'todas'
                ? ALERTAS.length
                : ALERTAS.filter((a) => a.severity === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="split split--inbox">
        <Card title="Bandeja" meta={`${lista.length} alertas`} flush>
          {loading ? (
            <div className="pad">
              <SkeletonRows rows={5} cols={2} />
            </div>
          ) : lista.length === 0 ? (
            <Empty
              title="Sin alertas en este filtro"
              detail="Ninguna partida cruzó el umbral con esa severidad en el corte actual."
            />
          ) : (
            <ul className="inbox">
              {lista.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className={`inbox__item inbox__item--${a.severity}${
                      a.id === sel?.id ? ' inbox__item--on' : ''
                    }`}
                    onClick={() => setSelId(a.id)}
                  >
                    <span className="inbox__top">
                      <span className="inbox__id mono-num">{a.id}</span>
                      <span className="inbox__hora mono-num">{a.hora}</span>
                    </span>
                    <span className="inbox__titulo">{a.titulo}</span>
                    <span className="inbox__meta">
                      <Chip severity={a.severity} />
                      {a.partida && (
                        <span className="inbox__partida">{a.partida}</span>
                      )}
                      {a.estado === 'nueva' && (
                        <span className="inbox__nueva">nueva</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Detalle"
          meta={sel?.fecha}
          actions={sel && <Chip severity={sel.severity} />}
        >
          {loading || !sel ? (
            <SkeletonRows rows={4} cols={2} />
          ) : (
            <article className="detalle">
              <h3 className="detalle__titulo">{sel.titulo}</h3>
              <p className="detalle__texto">{sel.detalle}</p>

              <dl className="kv">
                <div>
                  <dt>Origen</dt>
                  <dd>{sel.fuente}</dd>
                </div>
                {sel.partida && (
                  <div>
                    <dt>Partida</dt>
                    <dd>{sel.partida}</dd>
                  </div>
                )}
                {sel.impacto && (
                  <div>
                    <dt>Impacto</dt>
                    <dd className="mono-num tone-critical">{sel.impacto}</dd>
                  </div>
                )}
                <div>
                  <dt>Estado</dt>
                  <dd>{sel.estado}</dd>
                </div>
              </dl>

              <div className="detalle__acciones">
                <a className="btn btn--solid" href="#/orquestador">
                  Ver traza del grafo
                </a>
                <a className="btn btn--ghost" href="#/investigador">
                  Abrir evidencia
                </a>
              </div>

              <Stub endpoint="POST /api/v1/alertas/:id/estado">
                Archivar, asignar responsable y notificar por correo dependen
                del backend de alertas.
              </Stub>
            </article>
          )}
        </Card>
      </div>
    </>
  );
}
