import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './hero.css';

const TICKER = [
  { label: 'Presupuesto de obra', value: '$4.82M', delta: '68.4% ejec.', tone: 'contained' },
  { label: 'Desviación acumulada', value: '+7.4%', delta: '↑ 2.1', tone: 'critical' },
  { label: 'Partidas en riesgo', value: '03', delta: 'de 05', tone: 'signal' },
  { label: 'CPI · valor ganado', value: '0.92', delta: '↓ 0.04', tone: 'signal' },
];

export function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = parallaxRef.current;
    const triggerElement = root?.querySelector('[data-parallax-layers]');
    const lenis = new Lenis();
    const raf = (time: number) => lenis.raf(time * 1000);
    let tl: gsap.core.Timeline | undefined;

    if (triggerElement) {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: '0% 0%',
          end: '100% 0%',
          scrub: 0,
        },
      });

      // El video se arrastra poco; el texto se despega hacia abajo.
      const layers = [
        { layer: '1', yPercent: 14 },
        { layer: '3', yPercent: 34 },
      ];

      layers.forEach((layerObj, idx) => {
        tl!.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          { yPercent: layerObj.yPercent, ease: 'none' },
          idx === 0 ? undefined : '<',
        );
      });
    }

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Se desmonta solo lo propio: matar todos los ScrollTrigger de la
      // página rompería cualquier otra animación montada en paralelo.
      tl?.scrollTrigger?.kill();
      tl?.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="hero" id="top" ref={parallaxRef}>
      <section className="hero__frame">
        <div data-parallax-layers className="hero__layers">
          <video
            data-parallax-layer="1"
            className="hero__video"
            src="/hero-video.mp4"
            poster="/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="hero__scrim" />

          <div data-parallax-layer="3" className="hero__content">
            <div className="hero__grid">
              <div className="hero__lede">
                <p className="eyebrow hero__eyebrow">
                  <span className="hero__rule" aria-hidden="true" />
                  Reto 3 · Financiero · Hackathon 2026
                </p>

                <h1 className="hero__title">FORMA</h1>

                <p className="hero__expansion">
                  Financial <span aria-hidden="true">&amp;</span> Operations Risk
                  Management Assistant
                </p>
              </div>

              <div className="hero__meta">
                <p className="hero__copy">
                  CFO virtual y auditor autónomo de obras. FORMA cruza el ERP
                  con las bitácoras de campo para detectar el sobrecosto,
                  explicar su causa y proyectar el impacto en el margen.
                </p>
                <div className="hero__actions">
                  <a className="btn btn--solid" href="#consola">
                    Abrir consola
                  </a>
                  <a className="btn btn--ghost" href="#arquitectura">
                    Ver arquitectura
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cinta de indicadores: cierra el hero sin necesidad de scroll */}
        <div className="hero__ticker">
          {TICKER.map((item) => (
            <div className="hero__tick" key={item.label}>
              <span className="hero__tick-label">{item.label}</span>
              <span className="hero__tick-row">
                <span className="hero__tick-value mono-num">{item.value}</span>
                <span className={`hero__tick-delta hero__tick-delta--${item.tone}`}>
                  {item.delta}
                </span>
              </span>
            </div>
          ))}
        </div>

        <span className="hero__scroll-cue" aria-hidden="true">
          Desplazar
        </span>
      </section>
    </div>
  );
}
