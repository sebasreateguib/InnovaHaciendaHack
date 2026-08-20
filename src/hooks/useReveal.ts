import { useEffect } from 'react';

/**
 * Revela los elementos marcados con [data-reveal] al entrar en viewport.
 *
 * El estado base (oculto) vive en CSS detrás de ese atributo, así que si el
 * observer no está disponible hay que descubrirlos a mano: de lo contrario la
 * página quedaría en blanco. Por lo mismo se desconecta cada elemento tras
 * revelarlo — la animación es de entrada, no un toggle.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );

    const reveal = (el: HTMLElement) => el.classList.add('is-visible');

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      // Se dispara antes de que el borde inferior toque el elemento, para que
      // termine de entrar mientras el usuario sigue desplazándose.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
