# FORMA

**F**inancial & **O**perations **R**isk **M**anagement **A**ssistant — CFO virtual y auditor autónomo de obras.

Arquitectura multi-agente con sistema híbrido (SQL + RAG documental) para el reto financiero inmobiliario. FORMA cruza el ERP con las bitácoras de campo para detectar el sobrecosto, explicar su causa y proyectar el impacto en el margen.

---

## Estado del repositorio

**Este repositorio contiene únicamente la landing page** que presenta el plan de solución. No incluye el sistema.

| | |
|---|---|
| ✅ En el repo | Landing page en React + Vite + TypeScript |
| ❌ No en el repo | Agentes, orquestador, backend, base de datos, ingesta OCR |

Todo lo descrito en las secciones «La tesis», «Arquitectura», «Triggers» y «Stack» es **diseño propuesto**, documentado en [`public/Hackathon Financial Plan.pdf`](public/Hackathon%20Financial%20Plan.pdf). No hay código Python ni servicios en este árbol. Las cifras que muestra la consola de la landing son **simuladas**.

---

## La tesis: por qué un RAG híbrido es estrictamente necesario

En finanzas inmobiliarias coexisten dos realidades de dato, y ningún sistema que atienda solo a una puede auditar una obra: le faltará el número exacto o le faltará el motivo.

| Mundo A · Estructurado | Mundo B · No estructurado |
|---|---|
| Números de factura y montos de presupuesto | PDFs de contratos y anexos |
| Cubicajes y partidas contables en ERP | Bitácoras de campo del residente |
| Costo real ejecutado contra costo planeado | Órdenes de cambio y correos |
| **Herramienta:** Text-to-SQL | **Herramienta:** RAG vectorial |

Un RAG vectorial puro comete errores matemáticos graves. Por eso **el cómputo va por SQL y la causa por vectores**.

---

## Arquitectura del sistema multi-agente

### Los cuatro agentes

**1 · Agente Ingesta & OCR** — *Entrada multimodal*
Recibe facturas, remisiones y actas de obra.
- Extracción visual con LLM multimodal / OCR
- Estructura a esquema JSON: RUC, ítems, precios unitarios, partida contable
- Almacena vectores en pgvector e inserta filas en PostgreSQL / DuckDB

**2 · Agente Cuantitativo** — *Text-to-SQL*
Consultas exactas sobre bases de datos.
- Calcula valor ganado: CPI (Cost Performance Index) y SPI
- Compara presupuesto planeado contra costo real ejecutado
- Devuelve tablas exactas, sin riesgo de alucinación matemática

**3 · Agente Investigador** — *RAG vectorial*
Auditoría causal en textos y bitácoras.
- Búsqueda semántica en bitácoras diarias, contratos y anexos
- Responde al *¿por qué ocurrió el sobrecosto?* (lluvias, falta de acero, roturas)
- Cita la página y el documento exacto de la bitácora

**4 · Agente Predictor & Simulador** — *Simulación*
Modelado de escenarios y proyecciones.
- Estima la variación en el margen neto del proyecto, TIR y VAN
- Simulación *what-if*: ¿y si el concreto sube 10% adicional?
- Sugiere reasignación de partidas de contingencia

### Orquestador central (Supervisor Graph)

Controla el flujo de deliberación. La inteligencia del sistema no está en ningún agente: está en cómo el orquestador cruza sus respuestas.

```
              EVENTO · CONSULTA DEL CFO
                        │
                  ┌─────▼─────┐
                  │ORQUESTADOR│
                  └─────┬─────┘
              ┌─────────┴─────────┐
        ┌─────▼──────┐     ┌──────▼──────┐
        │CUANTITATIVO│     │INVESTIGADOR │   (en paralelo)
        └─────┬──────┘     └──────┬──────┘
              └─────────┬─────────┘
                  ┌─────▼─────┐
                  │ PREDICTOR │
                  └─────┬─────┘
                        ▼
            RECOMENDACIÓN DIRECTIVA
```

Recibe el evento de disparo —una factura con sobrecosto o una consulta del CFO—, llama en paralelo al Cuantitativo y al Investigador, une sus hallazgos, solicita el cálculo de impacto al Predictor y entrega una sola recomendación consolidada.

---

## Triggers y flujo operativo

El mismo grafo de agentes responde a un archivo que llega, a un reloj que marca fin de mes y a una pregunta en lenguaje natural.

| Trigger | Flujo de ejecución | Resultado generado |
|---|---|---|
| **1 · Event-driven** (ingesta) | Se sube una factura o valorización en PDF → el OCR parsea los datos → SQL detecta que la partida supera el margen de tolerancia (>5%) | **Alerta inmediata** — notificación push o correo con el desglose del sobrecosto y la causa raíz sugerida |
| **2 · Batch / programado** | Un cron job semanal o mensual ejecuta el análisis general de todas las partidas y calcula las métricas de avance de obra (curva S) | **Reporte ejecutivo** — informe integral de cierre de mes con proyección de rentabilidad final |
| **3 · On-demand** (chat) | «¿Qué partidas de acabados están en riesgo de sobrecosto este mes y por qué?», pregunta el gerente de finanzas | **Respuesta híbrida** — tabla SQL de partidas en riesgo más la justificación contextual citando las bitácoras |

---

## Stack tecnológico propuesto (MVP para hackathon)

Nada exótico: todo elegido para levantarse en las horas que dura un hackathon y seguir en pie después.

| Componente | Tecnología | Propósito en el demo |
|---|---|---|
| Orquestador | LangGraph · Python StateGraph | Estado multi-agente, ciclos de validación y tool calling determinista |
| Modelos LLM & OCR | Claude Opus 5 (`claude-opus-5`) · GPT-4o · Gemini 1.5 Pro | Extracción multimodal de facturas PDF y síntesis ejecutiva |
| Almacenamiento híbrido | PostgreSQL + pgvector (o Supabase) | Tablas relacionales de costos y partidas junto a la base vectorial de chunks |
| Backend API | FastAPI · Python | Servicios REST, webhooks de ingesta y endpoints de streaming de agentes |
| Frontend dashboard | React · Vite · TypeScript | Panel financiero con curva S, visor de alertas y chat con el CFO virtual |

---

## Plan de ejecución del demo

El pitch es una demostración, no una lámina. Tres movimientos:

1. **Dataset mockeado coherente** — un presupuesto base del *Edificio Panorama* (10 pisos) con cinco partidas clave: cimentación, estructura, instalaciones sanitarias, acabados y carpintería.
2. **El incidente** — en vivo se sube un PDF de factura de concreto con 20% de sobreprecio, junto a una bitácora del residente anotando una contingencia geológica.
3. **La revelación en pantalla** — el grafo multi-agente resuelve la anomalía frente al jurado: justifica el motivo y proyecta el impacto en la rentabilidad en segundos.

---

## La landing page

Lo que sí corre en este repositorio.

### Requisitos

- Node.js 20.19+ / 22.12+ (desarrollado con v25)
- npm

### Puesta en marcha

```bash
npm install
npm run dev
```

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Typecheck (`tsc -b`) y build de producción a `dist/` |
| `npm run lint` | Oxlint |
| `npm run preview` | Sirve el build de producción en local |

### Estructura

```
src/
├── App.tsx                 Composición de la página y pie
├── main.tsx                Punto de entrada
├── index.css               Tokens del sistema de diseño
├── app.css                 Pie de página
├── hooks/
│   └── useReveal.ts        Revelado por scroll (IntersectionObserver)
└── components/
    ├── Navbar.tsx          Barra fija con estado de scroll
    ├── hero.tsx            Hero con video, parallax y wordmark-medidor
    ├── Thesis.tsx          01 · Los dos mundos de dato
    ├── Architecture.tsx    02 · Cuatro agentes y el orquestador
    ├── Triggers.tsx        03 · Los tres disparadores
    ├── RiskConsole.tsx     04 · Consola de riesgo (datos simulados)
    ├── Stack.tsx           05 · Stack tecnológico
    ├── Demo.tsx            06 · Plan de ejecución
    ├── Logo.tsx            Marca: la F como gráfico de barras
    ├── hero.css            Estilos del hero
    ├── navbar.css          Estilos de la barra
    ├── risk-console.css    Estilos de la consola
    └── sections.css        Estilos compartidos de secciones

public/                     Assets estáticos: video y póster del hero,
                            favicon y el PDF del plan de solución
```

### Sistema de diseño

Producto de software sobre fondo mineral: retícula técnica, superficies con filo interior y un único acento ámbar (`#e4a340`) que sirve tanto de color de interfaz como de señal de riesgo. Como el tono se comparte, **la severidad nunca se apoya solo en el color**: los chips y el feed de la consola llevan además punto, etiqueta textual y filo lateral.

- **Tipografía** — Space Grotesk (display), Inter (cuerpo), JetBrains Mono con cifras tabulares (todo dato numérico)
- **Movimiento** — una sola curva `cubic-bezier(0.16, 1, 0.3, 1)`; se respeta `prefers-reduced-motion`
- **Wordmark** — «FORMA» se lee como un vaciado en obra: contorno de plano para lo planeado, sólido para lo ejecutado, con línea de cota al nivel del avance

Dependencias de runtime: **GSAP** (parallax del hero) y **Lenis** (scroll suave).

---

## Licencia

**GNU General Public License v3.0** — texto completo en [`LICENSE`](LICENSE).

Software libre: puedes usarlo, estudiarlo, modificarlo y redistribuirlo. La GPL-3.0 es *copyleft* fuerte, de modo que cualquier obra derivada que distribuyas debe publicarse también bajo GPL-3.0 y con su código fuente disponible. Se entrega **sin garantía alguna**, en los términos de las secciones 15 y 16 de la licencia.
