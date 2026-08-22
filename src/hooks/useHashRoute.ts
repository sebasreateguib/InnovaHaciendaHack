import { useEffect, useState } from 'react';
import type { ViewId } from '../dashboard/routes';
import { resolveRoute } from '../dashboard/routes';

/**
 * Ruteo por hash, sin dependencias.
 *
 * Devuelve `null` cuando el hash no pertenece al panel: ese es el caso de
 * la landing, que usa anclas simples. El panel vive siempre bajo `#/`.
 */
export function useHashRoute(): ViewId | null {
  const [route, setRoute] = useState<ViewId | null>(() =>
    resolveRoute(window.location.hash),
  );

  useEffect(() => {
    const onHash = () => setRoute(resolveRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}
