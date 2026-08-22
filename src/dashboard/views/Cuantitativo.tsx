import { useState } from 'react';
import { Card, Empty, Skeleton, SkeletonRows, Stub, ViewHead } from '../primitives';
import { CONSULTAS_SUGERIDAS, PARTIDAS, SQL_EJEMPLO } from '../data';
import { moneyShort, pctSigned } from '../format';

/* 04 · Cuantitativo — text-to-SQL.
   Aquí el valor está en mostrar el SQL: si el CFO no puede auditar la
   consulta, la cifra vale tanto como una alucinación bien redactada.
   Por eso la consulta generada es parte de la respuesta, no un detalle
   escondido tras un desplegable. */

type Fase = 'idle' | 'planeando' | 'ejecutando' | 'listo';

export function Cuantitativo() {
  const [pregunta, setPregunta] = useState(CONSULTAS_SUGERIDAS[0]);
  const [fase, setFase] = useState<Fase>('idle');

  const correr = () => {
    if (!pregunta.trim()) return;
    setFase('planeando');
    // Dos tiempos porque el usuario debe ver que primero se redacta el SQL y
    // solo después se toca la base: es lo que hace auditable al agente
    window.setTimeout(() => setFase('ejecutando'), 620);
    window.setTimeout(() => setFase('listo'), 1_240);
  };

  const filas = PARTIDAS.filter(
    (p) => (p.real - p.presupuesto) / p.presupuesto > 0.05,
  );

  return (
    <>
      <ViewHead
        index="04"
        title="Agente Cuantitativo"
        lede="Pregunta en lenguaje natural, respuesta en SQL ejecutado contra el ERP. Sin aritmética del modelo: el cómputo lo hace la base."
      />

      <div className="grid">
        <Card title="Consulta" span="span 12">
          <div className="ask">
            <textarea
              className="ask__input"
              rows={2}
              value={pregunta}
              placeholder="¿Qué partidas superan el 5% de desviación al corte de agosto?"
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) correr();
              }}
            />
            <button
              className="btn btn--solid ask__go"
              type="button"
              onClick={correr}
              disabled={fase === 'planeando' || fase === 'ejecutando'}
            >
              {fase === 'planeando' || fase === 'ejecutando'
                ? 'Ejecutando…'
                : 'Ejecutar'}
              <kbd>⌘↵</kbd>
            </button>
          </div>
          <ul className="chips-row">
            {CONSULTAS_SUGERIDAS.map((c) => (
              <li key={c}>
                <button
                  className="chip-btn"
                  type="button"
                  onClick={() => {
                    setPregunta(c);
                    setFase('idle');
                  }}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="SQL generado"
          meta="PostgreSQL"
          span="span 6"
          actions={
            <span className="card__pill">
              {fase === 'listo' ? 'validado' : 'en espera'}
            </span>
          }
        >
          {fase === 'idle' ? (
            <Empty
              title="Sin consulta ejecutada"
              detail="El SQL aparece antes de tocar la base, para que puedas auditarlo."
            />
          ) : fase === 'planeando' ? (
            <div className="skel-stack">
              <Skeleton w="88%" h="0.75rem" />
              <Skeleton w="72%" h="0.75rem" delay={80} />
              <Skeleton w="90%" h="0.75rem" delay={160} />
              <Skeleton w="54%" h="0.75rem" delay={240} />
            </div>
          ) : (
            <>
              <pre className="sql">
                <code>{SQL_EJEMPLO}</code>
              </pre>
              <p className="card__foot">
                Solo lectura, con <code>LIMIT</code> implícito y el
                <code> proyecto_id</code> forzado por la sesión: el agente no
                puede consultar obras fuera del alcance del usuario.
              </p>
            </>
          )}
        </Card>

        <Card
          title="Resultado"
          meta={fase === 'listo' ? `${filas.length} filas · 84 ms` : undefined}
          span="span 6"
          flush
        >
          {fase === 'listo' ? (
            <table className="dtable">
              <thead>
                <tr>
                  <th scope="col">partida</th>
                  <th scope="col">presupuesto</th>
                  <th scope="col">costo_real</th>
                  <th scope="col">desviacion_pct</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">
                      <span className="dtable__entity">{p.nombre}</span>
                    </th>
                    <td className="mono-num">{moneyShort(p.presupuesto)}</td>
                    <td className="mono-num">{moneyShort(p.real)}</td>
                    <td className="mono-num tone-critical">
                      {pctSigned(
                        ((p.real - p.presupuesto) / p.presupuesto) * 100,
                        2,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : fase === 'idle' ? (
            <div className="pad">
              <Empty
                title="Sin resultados"
                detail="Ejecuta una consulta para ver la tabla exacta que devuelve la base."
              />
            </div>
          ) : (
            <div className="pad">
              <SkeletonRows rows={3} cols={4} />
            </div>
          )}
        </Card>

        <Card title="Cómo se resuelve" span="span 12">
          <ol className="pasos">
            <li>
              <span className="pasos__n mono-num">1</span>
              <div>
                <p className="pasos__t">Esquema en contexto</p>
                <p className="pasos__d">
                  El agente recibe solo las tablas del proyecto activo con sus
                  claves y tipos, no la base entera.
                </p>
              </div>
            </li>
            <li>
              <span className="pasos__n mono-num">2</span>
              <div>
                <p className="pasos__t">Redacción y validación</p>
                <p className="pasos__d">
                  Se genera el SQL y se valida contra el parser antes de tocar la
                  base. Si no compila, se reintenta con el error como contexto.
                </p>
              </div>
            </li>
            <li>
              <span className="pasos__n mono-num">3</span>
              <div>
                <p className="pasos__t">Ejecución en réplica de lectura</p>
                <p className="pasos__d">
                  Rol sin permisos de escritura y tiempo máximo de consulta, para
                  que ninguna pregunta pueda bloquear el ERP.
                </p>
              </div>
            </li>
            <li>
              <span className="pasos__n mono-num">4</span>
              <div>
                <p className="pasos__t">Redacción de la respuesta</p>
                <p className="pasos__d">
                  El modelo narra la tabla, pero nunca recalcula sus números.
                </p>
              </div>
            </li>
          </ol>
          <Stub endpoint="POST /api/v1/agentes/cuantitativo/query">
            La consulta mostrada es fija: el text-to-SQL real necesita el
            esquema y la conexión a PostgreSQL.
          </Stub>
        </Card>
      </div>
    </>
  );
}
