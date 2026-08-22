import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Logo } from '../components/Logo';
import type { ViewId } from './routes';
import { GRUPOS, VIEWS } from './routes';
import { AGENTS, PROJECT } from './data';

/* ============================================================
   Armazón del panel
   Rail de navegación, barra superior y paleta de comandos.
   El armazón no sabe qué vista está dentro: recibe `children`.
   ============================================================ */

const AGENT_STATE_LABEL = {
  idle: 'en reposo',
  running: 'trabajando',
  blocked: 'bloqueado',
  ok: 'nominal',
} as const;

function go(id: ViewId) {
  window.location.hash = `#/${id}`;
}

export function Shell({
  route,
  children,
}: {
  route: ViewId;
  children: ReactNode;
}) {
  const [railOpen, setRailOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setRailOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activo = VIEWS.find((v) => v.id === route);

  return (
    <div className={`shell${railOpen ? ' shell--rail-open' : ''}`}>
      <a className="skip" href="#stage">
        Saltar al contenido
      </a>

      <aside className="rail" aria-label="Navegación del panel">
        <div className="rail__brand">
          <a className="rail__mark" href="#top" aria-label="FORMA — landing">
            <Logo size={28} />
            <span className="rail__wordmark">
              FORMA
              <em>panel de control</em>
            </span>
          </a>
        </div>

        <nav className="rail__nav">
          {GRUPOS.map((grupo) => (
            <div className="rail__group" key={grupo}>
              <p className="rail__group-title">{grupo}</p>
              <ul className="rail__list">
                {VIEWS.filter((v) => v.grupo === grupo).map((v) => (
                  <li key={v.id}>
                    <a
                      className={`rail__item${v.id === route ? ' rail__item--on' : ''}`}
                      href={`#/${v.id}`}
                      aria-current={v.id === route ? 'page' : undefined}
                      // En pantallas estrechas el rail es un cajón sobre el
                      // contenido: navegar tiene que cerrarlo, o el usuario
                      // queda mirando el mismo menú que acaba de usar
                      onClick={() => setRailOpen(false)}
                    >
                      <span className="rail__index mono-num">{v.index}</span>
                      <span className="rail__label">{v.label}</span>
                      {v.badge && (
                        <span className="rail__badge mono-num">{v.badge}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Salud de los agentes: siempre a la vista, porque una respuesta
            del panel vale lo que valga el agente que la produjo */}
        <div className="rail__health">
          <p className="rail__group-title">Agentes</p>
          <ul className="reactors">
            {AGENTS.map((a) => (
              <li className={`reactor reactor--${a.state}`} key={a.id}>
                <span className="reactor__dot" aria-hidden="true" />
                <span className="reactor__name">{a.nombre}</span>
                <span className="reactor__state">
                  {AGENT_STATE_LABEL[a.state]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <a className="rail__exit" href="#top">
          ← Volver a la landing
        </a>
      </aside>

      <div className="frame">
        <header className="topbar">
          <button
            className="topbar__burger"
            type="button"
            onClick={() => setRailOpen((v) => !v)}
            aria-expanded={railOpen}
            aria-label="Menú del panel"
          >
            <span aria-hidden="true" />
          </button>

          {/* Un solo proyecto en la maqueta: un select de una opción sería
              un control que no controla nada. Vuelve cuando haya cartera. */}
          <div className="picker">
            <span className="picker__label">Proyecto</span>
            <span className="picker__name">
              {PROJECT.name} · {PROJECT.detail}
            </span>
          </div>

          <p className="topbar__stamp mono-num">Corte {PROJECT.cutoff}</p>

          <div className="topbar__aside">
            <button
              className="cmdk"
              type="button"
              onClick={() => setPaletteOpen(true)}
            >
              Buscar o ejecutar
              <kbd>⌘K</kbd>
            </button>
            <span className="topbar__live">
              <span className="pulse" aria-hidden="true" />
              Ingesta activa
            </span>
            <span className="topbar__user" title="Sesión de demostración">
              CFO
            </span>
          </div>
        </header>

        <main className="stage" id="stage" key={route}>
          {children}
        </main>

        <footer className="stage__foot">
          <p>
            Prototipo · todas las cifras son simuladas · vista{' '}
            <span className="mono-num">{activo?.index}</span> {activo?.label}
          </p>
          <p className="mono-num">FORMA v0.1 · datos mock</p>
        </footer>
      </div>

      {railOpen && (
        <button
          className="scrim"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setRailOpen(false)}
        />
      )}

      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

/** Paleta de comandos. Navega entre vistas; las acciones que aún no existen
    llevan a la vista donde vivirán, no a un callejón sin salida. */
function Palette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const term = q.trim().toLowerCase();
  const results = VIEWS.filter(
    (v) =>
      term === '' ||
      v.label.toLowerCase().includes(term) ||
      v.hint.toLowerCase().includes(term),
  );

  const pick = useCallback(
    (id: ViewId) => {
      go(id);
      onClose();
    },
    [onClose],
  );

  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Comandos">
      <button className="palette__scrim" type="button" aria-label="Cerrar" onClick={onClose} />
      <div className="palette__box">
        <input
          ref={inputRef}
          className="palette__input"
          value={q}
          placeholder="Ir a una vista, buscar una partida, ejecutar un agente…"
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, results.length - 1));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            }
            if (e.key === 'Enter' && results[cursor]) pick(results[cursor].id);
          }}
        />
        <ul className="palette__list">
          {results.map((v, i) => (
            <li key={v.id}>
              <button
                type="button"
                className={`palette__item${i === cursor ? ' palette__item--on' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(v.id)}
              >
                <span className="palette__index mono-num">{v.index}</span>
                <span className="palette__label">{v.label}</span>
                <span className="palette__hint">{v.hint}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="palette__none">
              Sin coincidencias. La búsqueda sobre partidas y documentos entra
              con <code>POST /api/v1/buscar</code>.
            </li>
          )}
        </ul>
        <p className="palette__foot">
          <kbd>↑</kbd> <kbd>↓</kbd> navegar · <kbd>↵</kbd> abrir ·{' '}
          <kbd>esc</kbd> cerrar
        </p>
      </div>
    </div>
  );
}
