import { useState } from 'react';
import { Card, Skeleton, Stub, Tag, ViewHead } from '../primitives';
import { REPORTES } from '../data';

/* 08 · Reportes — el trigger batch.
   Un cron corre el análisis completo y deja un informe de cierre. La
   vista deja tocar la programación porque es la parte que el usuario
   necesita entender antes de confiar en un correo automático. */

const FRECUENCIAS = ['Semanal', 'Mensual', 'Trimestral'] as const;

export function Reportes() {
  const [frecuencia, setFrecuencia] = useState<(typeof FRECUENCIAS)[number]>(
    'Mensual',
  );
  const [hora, setHora] = useState('23:00');
  const [sel, setSel] = useState(REPORTES[1].id);

  const doc = REPORTES.find((r) => r.id === sel) ?? REPORTES[0];
  const cron = frecuencia === 'Semanal' ? '0 23 * * 5' : frecuencia === 'Mensual' ? '0 23 L * *' : '0 23 L */3 *';

  return (
    <>
      <ViewHead
        index="08"
        title="Reportes"
        lede="Cierres automáticos y auditorías bajo demanda. El mismo grafo de agentes, disparado por reloj en vez de por archivo."
        actions={
          <button className="btn btn--solid" type="button" disabled>
            Generar ahora
          </button>
        }
      />

      <div className="grid">
        <Card title="Programación" span="span 5">
          <fieldset className="campo-set">
            <legend className="campo-set__leg">Frecuencia</legend>
            <div className="radios">
              {FRECUENCIAS.map((f) => (
                <label
                  key={f}
                  className={`radio${frecuencia === f ? ' radio--on' : ''}`}
                >
                  <input
                    type="radio"
                    name="frecuencia"
                    value={f}
                    checked={frecuencia === f}
                    onChange={() => setFrecuencia(f)}
                  />
                  {f}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span className="field__label">Hora de ejecución</span>
            <input
              className="field__input mono-num"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </label>

          <div className="cron">
            <span className="cron__label">Expresión resultante</span>
            <code className="cron__val">{cron.replace('23', hora.slice(0, 2))}</code>
          </div>

          <ul className="checks">
            <li>
              <label className="toggle toggle--sm">
                <input type="checkbox" defaultChecked />
                <span className="toggle__box" aria-hidden="true" />
                <span>Curva S y métricas de valor ganado</span>
              </label>
            </li>
            <li>
              <label className="toggle toggle--sm">
                <input type="checkbox" defaultChecked />
                <span className="toggle__box" aria-hidden="true" />
                <span>Desviaciones por partida con causa citada</span>
              </label>
            </li>
            <li>
              <label className="toggle toggle--sm">
                <input type="checkbox" defaultChecked />
                <span className="toggle__box" aria-hidden="true" />
                <span>Proyección de rentabilidad final</span>
              </label>
            </li>
            <li>
              <label className="toggle toggle--sm">
                <input type="checkbox" />
                <span className="toggle__box" aria-hidden="true" />
                <span>Anexo con las facturas observadas</span>
              </label>
            </li>
          </ul>

          <Stub endpoint="PUT /api/v1/reportes/programacion">
            La programación no se guarda: vive en el estado de este componente.
          </Stub>
        </Card>

        <Card title="Historial" meta={`${REPORTES.length} reportes`} span="span 7" flush>
          <table className="dtable dtable--click">
            <thead>
              <tr>
                <th scope="col">Reporte</th>
                <th scope="col">Tipo</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {REPORTES.map((r) => (
                <tr
                  key={r.id}
                  className={r.id === sel ? 'is-on' : undefined}
                  onClick={() => setSel(r.id)}
                >
                  <th scope="row">
                    <span className="dtable__entity">{r.titulo}</span>
                    <span className="dtable__sub">
                      {r.id}
                      {r.paginas ? ` · ${r.paginas} páginas` : ''}
                    </span>
                  </th>
                  <td>{r.tipo}</td>
                  <td className="mono-num">{r.fecha}</td>
                  <td>
                    <Tag tone={r.estado === 'Generando' ? 'live' : 'neutral'}>
                      {r.estado}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title="Vista previa"
          meta={doc.id}
          span="span 12"
          actions={
            <button className="btn btn--ghost btn--xs" type="button" disabled>
              Descargar PDF
            </button>
          }
        >
          {doc.estado === 'Generando' ? (
            <div className="preview preview--busy">
              <p className="preview__estado">
                <span className="pulse" aria-hidden="true" />
                Generando · el grafo está corriendo sobre las 5 partidas
              </p>
              <div className="preview__hoja">
                <Skeleton w="42%" h="1.4rem" />
                <Skeleton w="70%" h="0.75rem" delay={80} />
                <Skeleton h="9rem" radius="6px" delay={160} />
                <Skeleton w="88%" h="0.75rem" delay={240} />
                <Skeleton w="64%" h="0.75rem" delay={300} />
              </div>
            </div>
          ) : (
            <div className="preview">
              <div className="preview__hoja preview__hoja--listo">
                <p className="preview__eyebrow mono-num">
                  FORMA · informe de cierre
                </p>
                <h3 className="preview__titulo">{doc.titulo}</h3>
                <p className="preview__lede">
                  Edificio Panorama · 10 pisos · corte {doc.fecha}
                </p>
                <ol className="preview__toc">
                  <li>Resumen ejecutivo y decisión recomendada</li>
                  <li>Valor ganado: CPI, SPI y curva S</li>
                  <li>Desviaciones por partida con causa citada</li>
                  <li>Documentos observados y trazabilidad</li>
                  <li>Proyección de rentabilidad y escenarios</li>
                </ol>
              </div>
              <Stub endpoint="GET /api/v1/reportes/:id.pdf">
                El render del PDF lo produce el backend a partir de la misma
                traza del orquestador que alimenta esta pantalla.
              </Stub>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
