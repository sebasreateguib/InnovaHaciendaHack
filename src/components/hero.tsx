import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './hero.css';

/* Anotaciones sobre el metraje: leen como acotaciones de plano y usan las
   mismas partidas que la consola, así el hero no inventa cifras propias.
   x/y van en porcentaje del área libre entre la franja superior y el bloque. */
const NOTES = [
  {
    code: 'P-04.2',
    partida: 'Estructura',
    value: '+20.4%',
    note: 'Concreto premezclado',
    tone: 'critical',
    x: '17%',
    y: '16%',
  },
  {
    code: 'P-08.1',
    partida: 'Acabados',
    value: '+6.4%',
    note: 'Interiores y pintura',
    tone: 'signal',
    x: '63%',
    y: '58%',
  },
];

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
          <div className="hero__mesh" aria-hidden="true" />

          <div data-parallax-layer="3" className="hero__content">
            {/* Franja superior: el eyebrow sube aquí y el cajetín ocupa la
                esquina que antes quedaba vacía, con la ficha de la obra que
                se audita — mismo formato que el cajetín de un plano. */}
            <div className="hero__topbar">
              <p className="eyebrow hero__eyebrow">
                <span className="hero__rule" aria-hidden="true" />
                Presupuesto vivo · Del ERP a la bitácora de campo
              </p>

              <div className="hero__plate">
                <p className="hero__plate-head">
                  <span className="hero__plate-pulse" aria-hidden="true" />
                  Obra en observación
                </p>
                <dl className="hero__plate-specs">
                  <div>
                    <dt>Proyecto</dt>
                    <dd>Edificio Panorama · 10 pisos</dd>
                  </div>
                  <div>
                    <dt>Contrato</dt>
                    <dd className="mono-num">$4.82M</dd>
                  </div>
                  <div>
                    <dt>Corte</dt>
                    <dd className="mono-num">19 ago 2026 · 09:45</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Banda intermedia: acota el metraje en lugar de dejarlo mudo */}
            <div className="hero__notes" aria-hidden="true">
              {NOTES.map((n) => (
                <div
                  className={`hero__note hero__note--${n.tone}`}
                  key={n.code}
                  style={{ left: n.x, top: n.y }}
                >
                  <span className="hero__note-pin" />
                  <span className="hero__note-body">
                    <span className="hero__note-top">
                      <span className="hero__note-code">{n.code}</span>
                      <span className="hero__note-partida">{n.partida}</span>
                      <span className="hero__note-value mono-num">{n.value}</span>
                    </span>
                    <span className="hero__note-detail">{n.note}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="hero__grid">
              <div className="hero__lede">
                {/* Entrada de la frase: el wordmark es la última palabra
                    ("El control de obra toma FORMA"), así que va pegado al
                    bloque y con el verbo en ámbar para tender el puente. */}
                <p className="hero__slogan">
                  El control de obra <span>toma</span>
                </p>

                {/* Tres capas sobre el mismo glifo: la extrusión rayada
                    detrás (el span y sus dos pseudo-elementos dan las tres
                    líneas del despiece), y encima la cara con contorno duro y
                    relleno recortado a la altura del avance. Solo la cara
                    lleva texto expuesto, así que el nombre accesible del h1
                    sigue siendo "FORMA" una sola vez. */}
                <div className="hero__mark">
                  <h1 className="hero__title">
                    <span className="hero__title-extrude" aria-hidden="true">
                      FORMA
                    </span>
                    <span className="hero__title-face">FORMA</span>
                    <span className="hero__title-built" aria-hidden="true">
                      FORMA
                    </span>
                  </h1>
                  <span className="hero__datum" aria-hidden="true">
                    <span className="hero__datum-label">88.0% de facturas auditadas</span>
                  </span>
                </div>

                <p className="hero__expansion">
                  <span>
                    <b>F</b>inancial <span aria-hidden="true">&amp;</span>{' '}
                    <b>O</b>perations <b>R</b>isk <b>M</b>anagement{' '}
                    <b>A</b>ssistant
                  </span>
                </p>
              </div>

              <div className="hero__meta">
                <p className="hero__copy">
                  CFO virtual y auditor autónomo de obras. FORMA cruza el ERP
                  con las bitácoras de campo para detectar el sobrecosto,
                  explicar su causa y proyectar el impacto en el margen.
                </p>
                <div className="hero__actions">
                  {/* Ancla a la sección 04, no a la app: el rótulo promete
                      lo que hay al final del scroll, no una consola real. */}
                  <a className="btn btn--solid" href="#consola">
                    Ver el caso Panorama
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
            <div className={`hero__tick hero__tick--${item.tone}`} key={item.label}>
              <span className="hero__tick-label">{item.label}</span>
              <span className="hero__tick-row">
                <span className="hero__tick-value mono-num">{item.value}</span>
                <span className="hero__tick-delta">{item.delta}</span>
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
