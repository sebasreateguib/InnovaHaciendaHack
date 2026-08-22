import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import './navbar.css';

const LINKS = [
  { label: 'Arquitectura', href: '#arquitectura' },
  { label: 'Triggers', href: '#triggers' },
  { label: 'Consola', href: '#consola' },
  { label: 'Stack', href: '#stack' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <a className="nav__mark" href="#top" aria-label="FORMA — inicio">
        <Logo className="nav__mark-logo" size={30} />
        <span className="nav__mark-word" aria-hidden="true">FORMA</span>
      </a>

      <nav className="nav__links" aria-label="Principal">
        {LINKS.map((link) => (
          <a key={link.href} className="nav__link" href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="nav__aside">
        <span className="nav__status">
          <span className="pulse" aria-hidden="true" />
          Sistemas nominales
        </span>
        {/* Apunta al panel real, no a la sección que lo ilustra: el prefijo
            `#/` es la frontera entre la landing y la aplicación */}
        <a className="btn btn--solid nav__cta" href="#/panel">
          Abrir el panel
        </a>
      </div>
    </header>
  );
}
