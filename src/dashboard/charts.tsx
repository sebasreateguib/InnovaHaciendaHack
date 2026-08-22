import type { Partida } from './data';
import { CUTOFF_INDEX, S_CURVE } from './data';

/* ============================================================
   Gráficos
   Todo es SVG en línea: sin librería, sin canvas y sin capa de
   temas. Un solo lenguaje visual heredado del wordmark —
   contorno punteado para lo planeado, sólido para lo ejecutado.
   ============================================================ */

const W = 760;
const H = 300;
const PAD = { t: 18, r: 18, b: 30, l: 46 };
/** Techo del eje Y en % del presupuesto. Deja aire sobre el EAC (108.7%). */
const Y_MAX = 118;

const px = (i: number, n: number) =>
  PAD.l + (i * (W - PAD.l - PAD.r)) / (n - 1);

const py = (v: number) =>
  PAD.t + (1 - v / Y_MAX) * (H - PAD.t - PAD.b);

/** Convierte una serie con huecos en un path. Los `null` cortan la línea
    en vez de interpolarla: el forecast no debe parecer dato medido. */
function line(values: (number | null)[]) {
  let d = '';
  let open = false;
  values.forEach((v, i) => {
    if (v === null) {
      open = false;
      return;
    }
    d += `${open ? 'L' : 'M'}${px(i, values.length).toFixed(1)} ${py(v).toFixed(1)} `;
    open = true;
  });
  return d.trim();
}

export function SCurve() {
  const n = S_CURVE.length;
  const pv = S_CURVE.map((p) => p.pv);
  const ev = S_CURVE.map((p) => p.ev);
  const ac = S_CURVE.map((p) => p.ac);
  const fc = S_CURVE.map((p) => p.forecast);

  const areaAc =
    `M${px(0, n)} ${py(0)} ` +
    S_CURVE.slice(0, CUTOFF_INDEX + 1)
      .map((p, i) => `L${px(i, n).toFixed(1)} ${py(p.ac ?? 0).toFixed(1)}`)
      .join(' ') +
    ` L${px(CUTOFF_INDEX, n)} ${py(0)} Z`;

  const cutX = px(CUTOFF_INDEX, n);

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart__svg"
        role="img"
        aria-label="Curva S: valor planeado, valor ganado y costo real acumulado, con proyección a diciembre"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="acFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Retícula horizontal cada 25% */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={py(v)}
              y2={py(v)}
              stroke="var(--hairline)"
              strokeDasharray={v === 100 ? '4 4' : undefined}
              strokeWidth="1"
            />
            <text x={PAD.l - 10} y={py(v) + 3.5} className="chart__tick">
              {v}
            </text>
          </g>
        ))}

        {/* Meses */}
        {S_CURVE.map((p, i) => (
          <text
            key={p.mes}
            x={px(i, n)}
            y={H - 10}
            className="chart__tick chart__tick--x"
          >
            {p.mes}
          </text>
        ))}

        {/* Corte de datos: a la derecha ya no hay medición */}
        <rect
          x={cutX}
          y={PAD.t}
          width={W - PAD.r - cutX}
          height={H - PAD.t - PAD.b}
          fill="rgba(148,163,184,0.035)"
        />
        <line
          x1={cutX}
          x2={cutX}
          y1={PAD.t}
          y2={H - PAD.b}
          stroke="var(--hairline-strong)"
          strokeDasharray="3 3"
        />
        <text x={cutX + 8} y={PAD.t + 12} className="chart__note">
          CORTE · 19 AGO
        </text>

        <path d={areaAc} fill="url(#acFill)" />

        {/* Planeado: contorno de plano */}
        <path
          d={line(pv)}
          className="chart__line chart__line--plan"
          pathLength={1}
        />
        {/* Ganado */}
        <path
          d={line(ev)}
          className="chart__line chart__line--ev"
          pathLength={1}
        />
        {/* Real ejecutado: sólido */}
        <path
          d={line(ac)}
          className="chart__line chart__line--ac"
          pathLength={1}
        />
        {/* Proyección */}
        <path
          d={line(fc)}
          className="chart__line chart__line--fc"
          pathLength={1}
        />

        <circle
          cx={cutX}
          cy={py(S_CURVE[CUTOFF_INDEX].ac ?? 0)}
          r="4"
          className="chart__dot"
        />
        <circle
          cx={px(n - 1, n)}
          cy={py(S_CURVE[n - 1].forecast ?? 0)}
          r="3.5"
          className="chart__dot chart__dot--fc"
        />
      </svg>

      <figcaption className="chart__legend">
        <span className="lg lg--plan">Valor planeado · PV</span>
        <span className="lg lg--ev">Valor ganado · EV</span>
        <span className="lg lg--ac">Costo real · AC</span>
        <span className="lg lg--fc">Proyección · EAC 108.7%</span>
      </figcaption>
    </figure>
  );
}

/** Presupuesto contra real por partida. El contorno es el presupuesto;
    la barra sólida, lo gastado. Cuando el sólido se sale del contorno,
    el sobrecosto se ve sin leer la cifra. */
export function PartidaBars({ partidas }: { partidas: Partida[] }) {
  const max = Math.max(...partidas.map((p) => Math.max(p.presupuesto, p.real)));

  return (
    <ul className="pbars">
      {partidas.map((p) => {
        const dev = (p.real - p.presupuesto) / p.presupuesto;
        return (
          <li className={`pbar pbar--${p.severity}`} key={p.id}>
            <span className="pbar__name">{p.nombre}</span>
            <span className="pbar__track" aria-hidden="true">
              <span
                className="pbar__plan"
                style={{ width: `${(p.presupuesto / max) * 100}%` }}
              />
              <span
                className="pbar__real"
                style={{ width: `${(p.real / max) * 100}%` }}
              />
            </span>
            <span className="pbar__dev mono-num">
              {dev >= 0 ? '+' : '−'}
              {Math.abs(dev * 100).toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Anillo de un solo valor, para índices centrados en 1.00 (CPI/SPI). */
export function IndexRing({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  // 0.80–1.20 mapeado al anillo completo: fuera de ese rango se satura
  const t = Math.min(Math.max((value - 0.8) / 0.4, 0), 1);
  const tone = value >= 1 ? 'contained' : value >= 0.95 ? 'signal' : 'critical';

  return (
    <div className={`ring ring--${tone}`}>
      <svg viewBox="0 0 88 88" width="88" height="88" aria-hidden="true">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          className="ring__arc"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(c * t).toFixed(1)} ${c.toFixed(1)}`}
          transform="rotate(-90 44 44)"
        />
        {/* Marca del 1.00: el umbral en el que ganar y gastar se igualan */}
        <line
          x1="44"
          y1="4"
          x2="44"
          y2="14"
          stroke="var(--bone-faint)"
          strokeWidth="1.5"
          transform="rotate(90 44 44)"
        />
      </svg>
      <p className="ring__value mono-num">{value.toFixed(2)}</p>
      <p className="ring__label">{label}</p>
    </div>
  );
}
