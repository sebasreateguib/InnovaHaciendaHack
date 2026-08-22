import type { ReactNode } from 'react';
import type { Severity } from './data';
import { SEVERITY_LABEL } from './data';

/* ============================================================
   Primitivas del panel
   Piezas compartidas por todas las vistas. Ninguna guarda estado:
   lo que necesitan lo reciben, para que sustituir el mock por el
   fetch real no obligue a tocarlas.
   ============================================================ */

/** Bloque de carga. `w` y `h` aceptan cualquier medida CSS. */
export function Skeleton({
  w = '100%',
  h = '1rem',
  radius = '3px',
  delay = 0,
}: {
  w?: string;
  h?: string;
  radius?: string;
  delay?: number;
}) {
  return (
    <span
      className="skel"
      aria-hidden="true"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

/** Párrafo fantasma: las líneas decrecen para imitar texto real. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['96%', '88%', '72%', '81%', '64%'];
  return (
    <span className="skel-stack">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          w={widths[i % widths.length]}
          h="0.6875rem"
          delay={i * 90}
        />
      ))}
    </span>
  );
}

/** Filas fantasma con la misma retícula que la tabla que sustituyen. */
export function SkeletonRows({
  rows = 4,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="skel-rows" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div
          className="skel-rows__row"
          key={r}
          style={{ gridTemplateColumns: `1.6fr ${'1fr '.repeat(cols - 1)}` }}
        >
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton
              key={c}
              w={c === 0 ? '70%' : '48%'}
              h="0.75rem"
              delay={(r * cols + c) * 45}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Superficie base de todo el panel. `flush` quita el padding del cuerpo
    para que una tabla llegue hasta el filo. */
export function Card({
  title,
  meta,
  actions,
  children,
  flush = false,
  span,
  className = '',
}: {
  title?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  span?: string;
  className?: string;
}) {
  return (
    <section
      className={`card ${className}`}
      style={span ? { gridColumn: span } : undefined}
    >
      {title && (
        <header className="card__head">
          <h2 className="card__title">{title}</h2>
          <div className="card__aside">
            {meta && <span className="card__meta mono-num">{meta}</span>}
            {actions}
          </div>
        </header>
      )}
      <div className={flush ? 'card__body card__body--flush' : 'card__body'}>
        {children}
      </div>
    </section>
  );
}

/** Chip de severidad. Nunca va solo de color: lleva punto y etiqueta,
    porque el ámbar de interfaz y el de riesgo comparten tono. */
export function Chip({
  severity,
  label,
}: {
  severity: Severity;
  label?: string;
}) {
  return (
    <span className={`dchip dchip--${severity}`}>
      <span className="dchip__dot" aria-hidden="true" />
      {label ?? SEVERITY_LABEL[severity]}
    </span>
  );
}

/** Etiqueta neutra para estados de proceso (no de riesgo). */
export function Tag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'tech' | 'live';
}) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

/** Barra horizontal. `plan` dibuja el contorno de lo planeado y `real`
    el sólido ejecutado: el mismo lenguaje del wordmark. */
export function Meter({
  real,
  plan = 1,
  tone = 'signal',
}: {
  real: number;
  plan?: number;
  tone?: Severity;
}) {
  return (
    <span className={`meter meter--${tone}`} aria-hidden="true">
      <span className="meter__plan" style={{ width: `${plan * 100}%` }} />
      <span
        className="meter__real"
        style={{ width: `${Math.min(real, 1.35) * 100}%` }}
      />
    </span>
  );
}

/** Cabecera de vista: índice, título y bajada. */
export function ViewHead({
  index,
  title,
  lede,
  actions,
}: {
  index: string;
  title: string;
  lede: string;
  actions?: ReactNode;
}) {
  return (
    <header className="vhead">
      <div>
        <p className="eyebrow">
          <span className="vhead__index">{index}</span> {title}
        </p>
        <p className="vhead__lede">{lede}</p>
      </div>
      {actions && <div className="vhead__actions">{actions}</div>}
    </header>
  );
}

/** Marca explícita de lo que todavía no está cableado.
    Es deliberadamente visible: un esqueleto que se disfraza de producto
    terminado es la manera más rápida de que alguien lo dé por hecho. */
export function Stub({
  endpoint,
  children,
}: {
  endpoint: string;
  children: ReactNode;
}) {
  return (
    <p className="stub">
      <span className="stub__flag">Pendiente</span>
      <span className="stub__text">{children}</span>
      <code className="stub__endpoint">{endpoint}</code>
    </p>
  );
}

/** Estado vacío con acción sugerida. */
export function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty__glyph" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="31"
            height="31"
            rx="6"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeDasharray="3 3"
          />
          <path
            d="M9 20.5 L14 14 L19 18 L24 11"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        </svg>
      </span>
      <p className="empty__title">{title}</p>
      <p className="empty__detail">{detail}</p>
      {action}
    </div>
  );
}

/** Par dato/etiqueta con cifras tabulares. */
export function Stat({
  label,
  value,
  unit,
  note,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  tone?: Severity;
}) {
  return (
    <div className={`stat${tone ? ` stat--${tone}` : ''}`}>
      <p className="stat__label">{label}</p>
      <p className="stat__value mono-num">
        {value}
        {unit && <span className="stat__unit">{unit}</span>}
      </p>
      {note && <p className="stat__note">{note}</p>}
    </div>
  );
}
