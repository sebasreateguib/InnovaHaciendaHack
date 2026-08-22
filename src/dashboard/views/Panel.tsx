import { PartidaBars, SCurve, IndexRing } from '../charts';
import {
  Card,
  Chip,
  Meter,
  Skeleton,
  SkeletonRows,
  Stat,
  Stub,
  ViewHead,
} from '../primitives';
import { ALERTAS, EVM, PARTIDAS, PROJECT } from '../data';
import { money, moneyShort, pct, pctSigned } from '../format';
import { useMockLoad } from '../../hooks/useMockLoad';

/* 01 · Panel — la lectura de la obra en una pantalla.
   Orden deliberado: primero cuánto (KPIs), luego cómo va en el tiempo
   (curva S), después dónde duele (partidas) y por último por qué
   (deliberación). El CFO no debería tener que desplazarse para saber
   si hay que actuar hoy. */

export function Panel() {
  const loading = useMockLoad();

  const totalPresupuesto = PARTIDAS.reduce((acc, p) => acc + p.presupuesto, 0);
  const totalReal = PARTIDAS.reduce((acc, p) => acc + p.real, 0);
  const desviacionTotal = totalReal - totalPresupuesto;

  return (
    <>
      <ViewHead
        index="01"
        title="Panel"
        lede={`${PROJECT.name} · ${PROJECT.detail} · presupuesto ${money(PROJECT.bac)}`}
        actions={
          <>
            <a className="btn btn--ghost" href="#/reportes">
              Generar cierre
            </a>
            <a className="btn btn--solid" href="#/chat">
              Preguntar al CFO
            </a>
          </>
        }
      />

      <div className="grid">
        <div className="statbar" data-span="full">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => (
              <div className="stat" key={i}>
                <Skeleton w="60%" h="0.625rem" delay={i * 60} />
                <Skeleton w="45%" h="2rem" delay={i * 60 + 40} />
                <Skeleton w="80%" h="0.75rem" delay={i * 60 + 90} />
              </div>
            ))
          ) : (
            <>
              <Stat
                label="Costo real · AC"
                value={pct(EVM.ac)}
                unit={`de ${moneyShort(PROJECT.bac)}`}
                note="Ejecutado al corte"
                tone="signal"
              />
              <Stat
                label="Valor ganado · EV"
                value={pct(EVM.ev)}
                unit="del BAC"
                note="Avance físico valorizado"
                tone="contained"
              />
              <Stat
                label="Proyección · EAC"
                value={pct(EVM.eac)}
                unit="del BAC"
                note={`Sobrecosto de ${moneyShort((EVM.eac / 100 - 1) * PROJECT.bac)}`}
                tone="critical"
              />
              <Stat
                label="Margen proyectado"
                value={pct(PROJECT.margenProyectado)}
                unit={`plan ${pct(PROJECT.margenPlan)}`}
                note="−2.6 pp sin mitigación"
                tone="critical"
              />
              <Stat
                label="Partidas en riesgo"
                value="03"
                unit="de 05"
                note={`${moneyShort(desviacionTotal)} sobre presupuesto`}
                tone="critical"
              />
            </>
          )}
        </div>

        <Card
          title="Curva S · valor ganado"
          meta="% acumulado del BAC"
          span="span 8"
          actions={
            <span className="card__pill">
              Agente Cuantitativo
            </span>
          }
        >
          {loading ? (
            <Skeleton h="18rem" radius="6px" />
          ) : (
            <>
              <SCurve />
              <p className="card__foot">
                El costo real cruzó por encima del valor ganado en mayo y no ha
                vuelto a converger: cada punto de separación es dinero gastado
                que no compró avance.
              </p>
            </>
          )}
        </Card>

        <Card title="Índices" meta="EV/AC · EV/PV" span="span 4">
          {loading ? (
            <Skeleton h="18rem" radius="6px" />
          ) : (
            <>
              <div className="rings">
                <IndexRing value={EVM.cpi} label="CPI · costo" />
                <IndexRing value={EVM.spi} label="SPI · plazo" />
              </div>
              <dl className="kv">
                <div>
                  <dt>Valor planeado</dt>
                  <dd className="mono-num">{pct(EVM.pv)}</dd>
                </div>
                <div>
                  <dt>Valor ganado</dt>
                  <dd className="mono-num">{pct(EVM.ev)}</dd>
                </div>
                <div>
                  <dt>Costo real</dt>
                  <dd className="mono-num">{pct(EVM.ac)}</dd>
                </div>
                <div>
                  <dt>Variación de costo</dt>
                  <dd className="mono-num tone-critical">
                    {moneyShort(((EVM.ev - EVM.ac) / 100) * PROJECT.bac)}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </Card>

        <Card
          title="Partidas bajo vigilancia"
          meta={`${PARTIDAS.length} / ${PARTIDAS.length}`}
          span="span 12"
          flush
        >
          {loading ? (
            <div className="pad">
              <SkeletonRows rows={5} cols={4} />
            </div>
          ) : (
            <table className="dtable">
              <thead>
                <tr>
                  <th scope="col">Partida</th>
                  <th scope="col">Presupuesto</th>
                  <th scope="col">Real</th>
                  <th scope="col">Desviación</th>
                  <th scope="col">Avance</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {PARTIDAS.map((p) => {
                  const dev = ((p.real - p.presupuesto) / p.presupuesto) * 100;
                  return (
                    <tr key={p.id}>
                      <th scope="row">
                        <span className="dtable__entity">{p.nombre}</span>
                        <span className="dtable__sub">{p.detalle}</span>
                      </th>
                      <td className="mono-num">{moneyShort(p.presupuesto)}</td>
                      <td className="mono-num">{moneyShort(p.real)}</td>
                      <td
                        className={`mono-num ${dev > 5 ? 'tone-critical' : dev > 0 ? 'tone-signal' : 'tone-contained'}`}
                      >
                        {pctSigned(dev)}
                      </td>
                      <td className="dtable__meter">
                        <Meter real={p.avance} tone={p.severity} />
                        <span className="mono-num dtable__pctlabel">
                          {Math.round(p.avance * 100)}%
                        </span>
                      </td>
                      <td>
                        <Chip severity={p.severity} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Presupuesto contra real" meta="por partida" span="span 5">
          {loading ? (
            <SkeletonRows rows={5} cols={3} />
          ) : (
            <>
              <PartidaBars partidas={PARTIDAS} />
              {/* El total de las cinco partidas no aparece en ninguna otra
                  vista: la tabla las desglosa, pero nadie las suma */}
              <dl className="kv">
                <div>
                  <dt>Presupuestado</dt>
                  <dd className="mono-num">{moneyShort(totalPresupuesto)}</dd>
                </div>
                <div>
                  <dt>Ejecutado</dt>
                  <dd className="mono-num">{moneyShort(totalReal)}</dd>
                </div>
                <div>
                  <dt>Desviación acumulada</dt>
                  <dd className="mono-num tone-critical">
                    {moneyShort(desviacionTotal)} ·{' '}
                    {pctSigned((desviacionTotal / totalPresupuesto) * 100)}
                  </dd>
                </div>
              </dl>
              <p className="card__foot">
                El contorno es el presupuesto aprobado; la barra sólida, lo
                gastado. Cuando el sólido rebasa el contorno hay sobrecosto.
              </p>
            </>
          )}
        </Card>

        <Card
          title="Deliberación de agentes"
          span="span 7"
          actions={
            <span className="tag tag--live">
              <span className="pulse" aria-hidden="true" />
              En vivo
            </span>
          }
        >
          {loading ? (
            <SkeletonRows rows={4} cols={2} />
          ) : (
            <ol className="dfeed">
              {ALERTAS.slice(0, 4).map((a) => (
                <li className={`dfeed__item dfeed__item--${a.severity}`} key={a.id}>
                  <span className="dfeed__time mono-num">{a.hora}</span>
                  <p className="dfeed__title">{a.titulo}</p>
                  <p className="dfeed__detail">{a.detalle}</p>
                  <p className="dfeed__source">{a.fuente}</p>
                </li>
              ))}
            </ol>
          )}
          <a className="card__link" href="#/alertas">
            Ver las {ALERTAS.length} alertas →
          </a>
        </Card>

        {/* Cierre de la lectura, a lo ancho: los números explican el
            problema y esta banda dice qué hacer con él */}
        <Card title="Acción recomendada" span="span 12" className="card--accent">
          <div className="reco">
            <div className="reco__main">
              <p className="reco__lede">
                Reasignar <strong>{money(86_000)}</strong> de la partida de
                contingencia P-06 a Estructura, y renegociar el precio unitario
                del concreto contra el contrato marco.
              </p>
              <div className="reco__actions">
                <a className="btn btn--solid" href="#/predictor">
                  Simular reasignación
                </a>
                <a className="btn btn--ghost" href="#/investigador">
                  Ver evidencia
                </a>
              </div>
            </div>
            <dl className="kv reco__kv">
              <div>
                <dt>Margen si no se actúa</dt>
                <dd className="mono-num tone-critical">
                  {pct(PROJECT.margenProyectado)}
                </dd>
              </div>
              <div>
                <dt>Margen con reasignación</dt>
                <dd className="mono-num tone-contained">13.4%</dd>
              </div>
              <div>
                <dt>Ventana de decisión</dt>
                <dd className="mono-num">hasta el 26 ago</dd>
              </div>
            </dl>
          </div>
          <Stub endpoint="POST /api/v1/recomendaciones/:id/aplicar">
            Aplicar la reasignación escribe en el ERP; queda deshabilitado
            hasta que exista el backend.
          </Stub>
        </Card>
      </div>
    </>
  );
}
