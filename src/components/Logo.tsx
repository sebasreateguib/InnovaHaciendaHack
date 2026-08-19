type LogoProps = {
  /** Lado en píxeles. El sello mantiene proporción 1:1. */
  size?: number;
  className?: string;
};

/**
 * Marca FORMA. La "F" está construida como un gráfico de barras: el asta es
 * el eje y los brazos son barras. La barra superior es la que excede la
 * escala, y por eso va en ámbar.
 *
 * La barra completa lleva el color en lugar de solo su extremo: a 16px un
 * acento pequeño se pierde y el sello queda monocromo.
 */
export function Logo({ size = 30, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="FORMA"
    >
      {/* Sello: encuadre de un pixel, hereda el color del texto */}
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        stroke="currentColor"
        strokeOpacity="0.3"
      />
      {/* Eje */}
      <rect x="9" y="8" width="3.6" height="16" fill="currentColor" />
      {/* Barra intermedia, dentro de escala */}
      <rect x="9" y="14.6" width="8.4" height="3.6" fill="currentColor" />
      {/* Barra que excede el umbral */}
      <rect x="9" y="8" width="13.4" height="3.6" fill="var(--signal, #e4a340)" />
    </svg>
  );
}
