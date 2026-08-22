import { useState } from 'react';
import { Card, Chip, Stat, Stub, ViewHead } from '../primitives';
import { ESCENARIOS } from '../data';
import { money, moneyShort, pct, pctSigned } from '../format';

/* 06 · Predictor — simulación what-if.
   Los deslizadores mueven cifras de verdad: el modelo de abajo es
   lineal y simplificado, pero es determinista y auditable, así que la
   vista no miente sobre lo que sabe. El Monte Carlo del agente lo
   sustituye sin cambiar la interfaz. */

/** Supuestos del modelo. Explícitos para que se puedan discutir. */
const VENTAS = 5_620_000;
/** Costo proyectado hoy, ya con las desviaciones registradas (margen 11.6%) */
const COSTO_CORTE = VENTAS * (1 - 0.116);
/** Parte de la partida de estructura que es material sensible al precio */
const MATERIAL_CONCRETO = 1_240_000 * 0.55;
/** Costo indirecto por día de retraso: cuadrilla, alquileres y gastos generales */
const COSTO_DIA = 3_200;
/** Compras atadas a moneda extranjera */
const COMPRAS_FX = 1_680_000;
/** Contingencia P-06 disponible para reasignar */
const CONTINGENCIA = 86_000;

export function Predictor() {
  const [concreto, setConcreto] = useState(0);
  const [dias, setDias] = useState(0);
  const [fx, setFx] = useState(0);
  const [mitigar, setMitigar] = useState(false);

  const dConcreto = MATERIAL_CONCRETO * (concreto / 100);
  const dRetraso = dias * COSTO_DIA;
  const dFx = COMPRAS_FX * (fx / 100);
  const mitigacion = mitigar ? CONTINGENCIA : 0;

  const costo = COSTO_CORTE + dConcreto + dRetraso + dFx - mitigacion;
  const margen = ((VENTAS - costo) / VENTAS) * 100;
  // Sensibilidades linealizadas alrededor del punto de corte. El agente real
  // las devuelve del flujo de caja completo, no de esta recta.
  const tir = 15.1 + (margen - 11.6) * 1.28;
  const van = 498_000 + (margen - 11.6) * 42_000;

  const delta = margen - 11.6;
  const tone = margen >= 13 ? 'contained' : margen >= 11 ? 'signal' : 'critical';

  const drivers = [
    { label: 'Precio del concreto', valor: dConcreto },
    { label: 'Retraso de obra', valor: dRetraso },
    { label: 'Tipo de cambio', valor: dFx },
    { label: 'Contingencia aplicada', valor: -mitigacion },
  ].filter((d) => d.valor !== 0);

  return (
    <>
      <ViewHead
        index="06"
        title="Agente Predictor"
        lede="Mueve un supuesto y mira qué le pasa al margen, a la TIR y al VAN antes de firmar la orden de compra."
        actions={
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              setConcreto(0);
              setDias(0);
              setFx(0);
              setMitigar(false);
            }}
          >
            Reiniciar supuestos
          </button>
        }
      />

      <div className="grid">
        <Card title="Supuestos" span="span 5">
          <div className="slider">
            <label className="slider__top" htmlFor="s-concreto">
              <span>Precio del concreto</span>
              <span className="mono-num">{pctSigned(concreto, 0)}</span>
            </label>
            <input
              id="s-concreto"
              type="range"
              min={0}
              max={25}
              step={1}
              value={concreto}
              onChange={(e) => setConcreto(Number(e.target.value))}
            />
            <p className="slider__nota mono-num">
              {moneyShort(dConcreto)} sobre {moneyShort(MATERIAL_CONCRETO)} de
              material
            </p>
          </div>

          <div className="slider">
            <label className="slider__top" htmlFor="s-dias">
              <span>Retraso acumulado</span>
              <span className="mono-num">{dias} días</span>
            </label>
            <input
              id="s-dias"
              type="range"
              min={0}
              max={60}
              step={1}
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
            />
            <p className="slider__nota mono-num">
              {money(COSTO_DIA)} por día de gasto general
            </p>
          </div>

          <div className="slider">
            <label className="slider__top" htmlFor="s-fx">
              <span>Tipo de cambio</span>
              <span className="mono-num">{pctSigned(fx, 0)}</span>
            </label>
            <input
              id="s-fx"
              type="range"
              min={-5}
              max={10}
              step={1}
              value={fx}
              onChange={(e) => setFx(Number(e.target.value))}
            />
            <p className="slider__nota mono-num">
              {moneyShort(COMPRAS_FX)} en compras importadas
            </p>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={mitigar}
              onChange={(e) => setMitigar(e.target.checked)}
            />
            <span className="toggle__box" aria-hidden="true" />
            <span>
              Reasignar contingencia P-06
              <em>{money(CONTINGENCIA)} disponibles</em>
            </span>
          </label>
        </Card>

        <Card
          title="Resultado de la simulación"
          meta="modelo lineal · determinista"
          span="span 7"
          actions={<Chip severity={tone} />}
        >
          <div className="statbar statbar--inline">
            <Stat
              label="Margen neto"
              value={pct(margen)}
              unit={`${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)} pp`}
              note="Contra el corte del 19 ago"
              tone={tone}
            />
            <Stat
              label="TIR"
              value={pct(tir)}
              unit="anual"
              note="Sensibilidad linealizada"
              tone={tone}
            />
            <Stat
              label="VAN"
              value={moneyShort(van)}
              unit="tasa 12%"
              note="Valor actual neto del proyecto"
              tone={tone}
            />
          </div>

          <h3 className="sub">Descomposición del impacto</h3>
          {drivers.length === 0 ? (
            <p className="card__foot">
              Sin supuestos activos: se muestra el escenario del corte, con las
              desviaciones ya registradas y sin mitigación.
            </p>
          ) : (
            <ul className="waterfall">
              {drivers.map((d) => {
                const max = Math.max(...drivers.map((x) => Math.abs(x.valor)));
                return (
                  <li className="wf" key={d.label}>
                    <span className="wf__label">{d.label}</span>
                    <span className="wf__track" aria-hidden="true">
                      <span
                        className={`wf__bar wf__bar--${d.valor > 0 ? 'up' : 'down'}`}
                        style={{ width: `${(Math.abs(d.valor) / max) * 100}%` }}
                      />
                    </span>
                    <span
                      className={`wf__val mono-num ${d.valor > 0 ? 'tone-critical' : 'tone-contained'}`}
                    >
                      {d.valor > 0 ? '+' : '−'}
                      {moneyShort(Math.abs(d.valor)).replace('$', '$')}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="card__foot">
            Costo proyectado {money(costo)} sobre ventas de {money(VENTAS)}.
          </p>
        </Card>

        <Card title="Escenarios guardados" span="span 12" flush>
          <table className="dtable">
            <thead>
              <tr>
                <th scope="col">Escenario</th>
                <th scope="col">Margen neto</th>
                <th scope="col">TIR</th>
                <th scope="col">VAN</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {ESCENARIOS.map((e) => (
                <tr key={e.id}>
                  <th scope="row">
                    <span className="dtable__entity">{e.nombre}</span>
                    <span className="dtable__sub">{e.detalle}</span>
                  </th>
                  <td className="mono-num">{pct(e.margen)}</td>
                  <td className="mono-num">{pct(e.tir)}</td>
                  <td className="mono-num">{moneyShort(e.van)}</td>
                  <td className="dtable__right">
                    <button className="btn btn--ghost btn--xs" type="button" disabled>
                      Comparar
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="dtable__draft">
                <th scope="row">
                  <span className="dtable__entity">Simulación actual</span>
                  <span className="dtable__sub">sin guardar</span>
                </th>
                <td className="mono-num">{pct(margen)}</td>
                <td className="mono-num">{pct(tir)}</td>
                <td className="mono-num">{moneyShort(van)}</td>
                <td className="dtable__right">
                  <button className="btn btn--ghost btn--xs" type="button" disabled>
                    Guardar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Sobre este modelo" span="span 12" className="card--muted">
          <p className="card__foot">
            El cálculo de esta vista es una recta: cada supuesto multiplica una
            base fija y el margen se recompone sobre ventas de {money(VENTAS)}.
            Sirve para ordenar magnitudes, no para cerrar un directorio. El
            agente real corre Monte Carlo sobre el flujo de caja con la
            distribución histórica de cada driver y devuelve intervalos de
            confianza, no un punto.
          </p>
          <Stub endpoint="POST /api/v1/agentes/predictor/simular">
            Guardar escenarios, comparar dos corridas y exportar el resultado al
            reporte de cierre requieren backend.
          </Stub>
        </Card>
      </div>
    </>
  );
}
