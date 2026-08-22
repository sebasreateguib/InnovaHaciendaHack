import { useEffect, useState } from 'react';

/**
 * Simula la latencia de la primera carga de una vista para que los
 * esqueletos sean visibles y no piezas muertas del código.
 *
 * Cuando el backend exista, esta llamada se sustituye por el estado de
 * carga del fetch real: la firma —`true` mientras no hay datos— es la
 * misma, así que las vistas no cambian.
 */
export function useMockLoad(ms = 620): boolean {
  // Con movimiento reducido no hay fase de carga: el esqueleto es una
  // animación, y quien la desactiva quiere el contenido, no el pulso
  const [loading, setLoading] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
    // Solo interesa el montaje: reabrir el temporizador en cada cambio de
    // `loading` volvería a esconder el contenido ya cargado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);

  return loading;
}
