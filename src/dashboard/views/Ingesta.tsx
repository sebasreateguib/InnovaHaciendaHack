import { useState } from 'react';
import type { DragEvent } from 'react';
import { Card, Meter, SkeletonRows, Stub, Tag, ViewHead } from '../primitives';
import { COLA, EXTRACCION } from '../data';
import { useMockLoad } from '../../hooks/useMockLoad';

/* 03 · Ingesta & OCR — la entrada multimodal.
   La zona de carga acepta archivos de verdad y los lista, pero no los
   sube: sin backend, fingir una subida exitosa sería mentir sobre el
   estado del sistema. Los archivos elegidos se marcan como locales. */

const ESTADO_TAG = {
  'en cola': 'neutral',
  ocr: 'tech',
  extrayendo: 'tech',
  indexado: 'neutral',
  error: 'neutral',
} as const;

export function Ingesta() {
  const loading = useMockLoad(480);
  const [dragging, setDragging] = useState(false);
  const [locales, setLocales] = useState<{ nombre: string; peso: string }[]>([]);
  const [sel, setSel] = useState(EXTRACCION.doc);

  const añadir = (files: FileList | null) => {
    if (!files) return;
    setLocales((prev) => [
      ...Array.from(files).map((f) => ({
        nombre: f.name,
        peso: `${(f.size / 1024).toFixed(0)} KB`,
      })),
      ...prev,
    ]);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    añadir(e.dataTransfer.files);
  };

  const doc = COLA.find((d) => d.id === sel) ?? COLA[0];

  return (
    <>
      <ViewHead
        index="03"
        title="Ingesta & OCR"
        lede="Facturas, remisiones, bitácoras y actas entran por aquí. El agente las normaliza a esquema JSON, inserta las filas en SQL e indexa los vectores en pgvector."
      />

      <div className="grid">
        <label
          className={`drop${dragging ? ' drop--over' : ''}`}
          data-span="full"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
            className="drop__input"
            onChange={(e) => añadir(e.target.files)}
          />
          <span className="drop__glyph" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <rect
                x="0.75"
                y="0.75"
                width="38.5"
                height="38.5"
                rx="8"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
              />
              <path
                d="M20 27V13m0 0-5.5 5.5M20 13l5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="drop__title">
            Suelta documentos aquí o haz clic para elegir
          </span>
          <span className="drop__hint">
            PDF · JPG · PNG · XLSX — hasta 25 MB por archivo
          </span>
        </label>

        {locales.length > 0 && (
          <Card
            title="Seleccionados en este navegador"
            meta={`${locales.length} archivos`}
            span="span 12"
          >
            <ul className="locales">
              {locales.map((f, i) => (
                <li className="local" key={`${f.nombre}-${i}`}>
                  <span className="local__name">{f.nombre}</span>
                  <span className="local__size mono-num">{f.peso}</span>
                  <Tag>sin subir</Tag>
                </li>
              ))}
            </ul>
            <Stub endpoint="POST /api/v1/ingesta (multipart/form-data)">
              El archivo no sale del navegador. La subida real encola el
              documento y devuelve un <code>doc_id</code> para seguir su estado.
            </Stub>
          </Card>
        )}

        <Card
          title="Cola de procesamiento"
          meta={`${COLA.length} documentos`}
          span="span 7"
          flush
          actions={
            <span className="tag tag--live">
              <span className="pulse" aria-hidden="true" />
              2 activos
            </span>
          }
        >
          {loading ? (
            <div className="pad">
              <SkeletonRows rows={5} cols={4} />
            </div>
          ) : (
            <table className="dtable dtable--click">
              <thead>
                <tr>
                  <th scope="col">Documento</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Confianza</th>
                  <th scope="col">Recibido</th>
                </tr>
              </thead>
              <tbody>
                {COLA.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSel(d.id)}
                    className={d.id === sel ? 'is-on' : undefined}
                  >
                    <th scope="row">
                      <span className="dtable__entity">{d.archivo}</span>
                      <span className="dtable__sub">
                        {d.id} · {d.peso}
                      </span>
                    </th>
                    <td>{d.tipo}</td>
                    <td>
                      <span className={`estado estado--${d.estado.replace(' ', '-')}`}>
                        {d.estado}
                      </span>
                      {d.estado !== 'indexado' && d.estado !== 'error' && (
                        <span className="estado__bar" aria-hidden="true">
                          <span style={{ width: `${d.progreso * 100}%` }} />
                        </span>
                      )}
                    </td>
                    <td className="mono-num">
                      {d.confianza !== null
                        ? `${(d.confianza * 100).toFixed(0)}%`
                        : '—'}
                    </td>
                    <td className="mono-num">{d.recibido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card
          title="Extracción"
          meta={doc.id}
          span="span 5"
          actions={<Tag tone={ESTADO_TAG[doc.estado]}>{doc.estado}</Tag>}
        >
          {loading ? (
            <SkeletonRows rows={6} cols={2} />
          ) : doc.estado === 'error' ? (
            <div className="fallo">
              <p className="fallo__titulo">OCR interrumpido</p>
              <p className="fallo__detalle">
                El documento tiene 148 páginas escaneadas a 150 dpi y superó el
                tiempo máximo de extracción. Conviene dividirlo por capítulos o
                reprocesarlo con OCR de alta resolución.
              </p>
              <button className="btn btn--ghost" type="button" disabled>
                Reprocesar
              </button>
              <Stub endpoint="POST /api/v1/ingesta/:id/reprocesar">
                Reintento con parámetros de OCR distintos.
              </Stub>
            </div>
          ) : doc.id === EXTRACCION.doc ? (
            <>
              <ul className="campos">
                {EXTRACCION.campos.map((c) => (
                  <li className="campo" key={c.campo}>
                    <span className="campo__key mono-num">{c.campo}</span>
                    <span className="campo__val">{c.valor}</span>
                    <span className="campo__conf">
                      <Meter
                        real={c.confianza}
                        tone={c.confianza > 0.94 ? 'contained' : 'signal'}
                      />
                      <span className="mono-num">
                        {(c.confianza * 100).toFixed(0)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="campos__acciones">
                <button className="btn btn--solid" type="button" disabled>
                  Validar y escribir en SQL
                </button>
                <button className="btn btn--ghost" type="button" disabled>
                  Corregir campo
                </button>
              </div>
              <Stub endpoint="PATCH /api/v1/ingesta/:id/campos">
                La corrección manual reentrena el prompt de extracción y vuelve
                a insertar la fila.
              </Stub>
            </>
          ) : (
            <div className="procesando">
              <p className="procesando__titulo">Extrayendo campos…</p>
              <SkeletonRows rows={5} cols={2} />
              <p className="procesando__nota">
                El esquema aparece cuando el agente termina de normalizar el
                documento.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
