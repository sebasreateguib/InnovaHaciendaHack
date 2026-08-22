/* Formato de cifras. Centralizado para que toda la interfaz redondee
   igual: dos paneles que muestran el mismo número con distinto decimal
   parecen dos números distintos. */

// El símbolo se antepone a mano: `style: 'currency'` con este locale rinde
// «USD 86,000» y con `narrowSymbol` deja un espacio («$ 86,000»). Ninguna de
// las dos casa con el «$1.24M» que usa el resto del panel.
const grupos = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });

/** $1,240,000 */
export const money = (n: number) => `$${grupos.format(n)}`;

/** $1.24M — para celdas estrechas */
export function moneyShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** +20.4% · −1.2% — el signo menos es U+2212, no un guion */
export function pctSigned(n: number, digits = 1) {
  const s = n >= 0 ? '+' : '−';
  return `${s}${Math.abs(n).toFixed(digits)}%`;
}

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
