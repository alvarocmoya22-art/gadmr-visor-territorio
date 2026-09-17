import { CATEGORIAS, colorSerie, POR_CLAVE, type ClaveCategoria } from '../lib/categorias'
import { numero } from '../lib/format'
import type { Cruce, Deficit, Hallazgo } from '../lib/analisis'

/** Lo que el usuario ha elegido analizar. Vive en App y se pasa entero. */
export interface EstadoAnalisis {
  /** Coropleta de distancia al equipamiento más cercano. */
  deficit: boolean
  /** Cruce de dos categorías encendido. */
  cruce: boolean
  a: ClaveCategoria
  b: ClaveCategoria
  /** Distancia, en metros, por debajo de la cual se da por atendido. */
  umbral: number
  /** Categoría de la que se listan los registros no inventariados. */
  hallazgos: ClaveCategoria
}

export const ANALISIS_INICIAL: EstadoAnalisis = {
  deficit: false,
  cruce: false,
  a: 'comercio',
  b: 'salud',
  umbral: 500,
  hallazgos: 'salud',
}

/** Tramos de la escala del déficit; los colores son los de la capa del mapa. */
const TRAMOS = [
  { color: '#dce9f4', rotulo: 'menos de 250 m' },
  { color: '#b3cfe7', rotulo: '250 a 500 m' },
  { color: '#7faed6', rotulo: '500 a 750 m' },
  { color: '#4a88be', rotulo: '750 m a 1 km' },
  { color: '#1f5f94', rotulo: 'más de 1 km' },
]

const UMBRALES = [250, 500, 750, 1000]

interface Props {
  analisis: EstadoAnalisis
  onAnalisis: (a: EstadoAnalisis) => void
  deficit: Deficit | null
  cruce: Cruce | null
  hallazgos: Hallazgo[]
  /** Ámbito sobre el que se calcula todo, para decirlo en los rótulos. */
  ambito: string
  onElegirBarrio: (nombre: string) => void
  onElegirPunto: (id: string) => void
  onDescargarHallazgos: () => void
}

const rotulo = (c: ClaveCategoria) => POR_CLAVE.get(c)?.rotulo ?? c

/**
 * Los tres análisis que el visor responde sin salir de la pantalla, todos
 * sobre el ámbito que dejan los filtros: si arriba se elige la plataforma D,
 * aquí se habla de la D.
 */
export default function PanelAnalisis({
  analisis,
  onAnalisis,
  deficit,
  cruce,
  hallazgos,
  ambito,
  onElegirBarrio,
  onElegirPunto,
  onDescargarHallazgos,
}: Props) {
  const campo = {
    background: 'var(--gr-superficie)',
    borderColor: 'var(--gr-linea-fuerte)',
    color: 'var(--gr-tinta)',
  }
  const cambiar = (parcial: Partial<EstadoAnalisis>) => onAnalisis({ ...analisis, ...parcial })

  return (
    <div className="space-y-4">
      <div>
        <p className="gr-eyebrow">Análisis · {ambito}</p>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Todo lo de abajo se calcula sobre lo que dejan ver los filtros. Las distancias son en
          línea recta; por calle siempre serán algo mayores.
        </p>
      </div>

      {/* ───────────────────────────── 1. déficit de equipamiento por barrio */}
      <section>
        <label
          className="flex items-center gap-2 text-[13px] font-semibold"
          style={{ color: 'var(--gr-tinta)' }}
        >
          <input
            type="checkbox"
            checked={analisis.deficit}
            onChange={(e) => cambiar({ deficit: e.target.checked })}
          />
          Déficit de equipamiento por barrio
        </label>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Pinta cada barrio según lo lejos que le queda el equipamiento municipal más cercano.
        </p>

        {analisis.deficit && deficit && (
          <>
            <ul className="mt-2 space-y-0.5">
              {TRAMOS.map((t) => (
                <li key={t.rotulo} className="flex items-center gap-2 text-[12px]">
                  <span
                    aria-hidden
                    className="h-3 w-5 shrink-0 rounded-sm"
                    style={{ background: t.color, border: '1px solid rgba(0,0,0,.15)' }}
                  />
                  <span style={{ color: 'var(--gr-tinta-3)' }}>{t.rotulo}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                { t: 'barrios', v: numero(deficit.filas.length) },
                { t: 'sin ninguno', v: numero(deficit.sinNada) },
                {
                  t: 'mediana',
                  v: deficit.mediana === null ? '—' : `${numero(deficit.mediana)} m`,
                },
              ].map((c) => (
                <div key={c.t}>
                  <dd className="gr-num text-[16px] font-bold" style={{ color: 'var(--gr-tinta)' }}>
                    {c.v}
                  </dd>
                  <dt className="text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                    {c.t}
                  </dt>
                </div>
              ))}
            </dl>

            {deficit.filas.length > 0 && (
              <>
                <p className="gr-eyebrow mb-1 mt-2">Los más alejados</p>
                <ul className="max-h-[22vh] overflow-auto">
                  {deficit.filas.slice(0, 12).map((f) => (
                    <li key={f.nombre}>
                      <button
                        type="button"
                        onClick={() => onElegirBarrio(f.nombre)}
                        className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[12px] hover:bg-black/5"
                      >
                        <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--gr-tinta-2)' }}>
                          {f.nombre}
                        </span>
                        <span
                          className="gr-num shrink-0"
                          style={{
                            color: f.equipamientos === 0 ? 'var(--gr-error)' : 'var(--gr-tinta-3)',
                          }}
                        >
                          {f.distancia === null ? '—' : `${numero(f.distancia)} m`}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </section>

      {/* ──────────────────────────────────── 2. cruce de dos categorías */}
      <section style={{ borderTop: '1px solid var(--gr-linea)', paddingTop: '0.75rem' }}>
        <label
          className="flex items-center gap-2 text-[13px] font-semibold"
          style={{ color: 'var(--gr-tinta)' }}
        >
          <input
            type="checkbox"
            checked={analisis.cruce}
            onChange={(e) => cambiar({ cruce: e.target.checked })}
          />
          Cruce de dos categorías
        </label>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Mide a qué distancia tiene cada punto de la primera categoría el más cercano de la
          segunda. En el mapa se apaga todo lo demás.
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Desde
            <select
              value={analisis.a}
              onChange={(e) => cambiar({ a: e.target.value as ClaveCategoria, cruce: true })}
              className="mt-0.5 w-full rounded border px-1.5 py-1 text-[13px]"
              style={campo}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.clave} value={c.clave}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Hasta
            <select
              value={analisis.b}
              onChange={(e) => cambiar({ b: e.target.value as ClaveCategoria, cruce: true })}
              className="mt-0.5 w-full rounded border px-1.5 py-1 text-[13px]"
              style={campo}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.clave} value={c.clave}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-2">
          <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Se da por atendido a menos de
          </p>
          <div className="mt-1 flex gap-1">
            {UMBRALES.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => cambiar({ umbral: u, cruce: true })}
                aria-pressed={analisis.umbral === u}
                className="gr-num flex-1 rounded border px-1 py-1 text-[12px]"
                style={{
                  borderColor:
                    analisis.umbral === u ? 'var(--gr-info)' : 'var(--gr-linea-fuerte)',
                  background: analisis.umbral === u ? 'var(--gr-info)' : 'var(--gr-superficie)',
                  color: analisis.umbral === u ? '#ffffff' : 'var(--gr-tinta-2)',
                }}
              >
                {u} m
              </button>
            ))}
          </div>
        </div>

        {analisis.cruce && cruce && (
          <div className="mt-2">
            {cruce.nA === 0 || cruce.nB === 0 ? (
              <p className="gr-nota gr-nota--aviso">
                No hay {cruce.nA === 0 ? rotulo(cruce.a) : rotulo(cruce.b)} en este ámbito, así que
                el cruce no da nada. Pruebe con otra categoría o quite el filtro de plataforma.
              </p>
            ) : (
              <>
                <p className="text-[12px]" style={{ color: 'var(--gr-tinta-2)' }}>
                  <b className="gr-num">{numero(cruce.nA)}</b> {rotulo(cruce.a).toLowerCase()} frente
                  a <b className="gr-num">{numero(cruce.nB)}</b> {rotulo(cruce.b).toLowerCase()}.
                </p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
                  {[
                    {
                      t: `a menos de ${cruce.umbral} m`,
                      v: `${Math.round((cruce.cubiertos / cruce.nA) * 100)} %`,
                    },
                    {
                      t: 'distancia mediana',
                      v: cruce.mediana === null ? '—' : `${numero(cruce.mediana)} m`,
                    },
                    { t: 'quedan fuera', v: numero(cruce.desatendidos.length) },
                  ].map((c) => (
                    <div key={c.t}>
                      <dd
                        className="gr-num text-[16px] font-bold"
                        style={{ color: 'var(--gr-tinta)' }}
                      >
                        {c.v}
                      </dd>
                      <dt className="text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                        {c.t}
                      </dt>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ border: '2px solid #b23a1e' }}
                  />
                  En el mapa, anillo rojo sobre {rotulo(cruce.a).toLowerCase()} sin{' '}
                  {rotulo(cruce.b).toLowerCase()} cerca
                  <span
                    aria-hidden
                    className="ml-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: colorSerie(cruce.a) }}
                  />
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: colorSerie(cruce.b) }}
                  />
                </p>

                {cruce.barriosSinB.length > 0 && (
                  <>
                    <p className="gr-eyebrow mb-1 mt-2">
                      Barrios con {rotulo(cruce.a).toLowerCase()} y sin{' '}
                      {rotulo(cruce.b).toLowerCase()} · {numero(cruce.barriosSinB.length)}
                    </p>
                    <ul className="max-h-[20vh] overflow-auto">
                      {cruce.barriosSinB.slice(0, 12).map((f) => (
                        <li key={f.nombre}>
                          <button
                            type="button"
                            onClick={() => onElegirBarrio(f.nombre)}
                            className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[12px] hover:bg-black/5"
                          >
                            <span
                              className="min-w-0 flex-1 truncate"
                              style={{ color: 'var(--gr-tinta-2)' }}
                            >
                              {f.nombre}
                            </span>
                            <span className="gr-num shrink-0" style={{ color: 'var(--gr-tinta-3)' }}>
                              {numero(f.a)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* ─────────────────── 3. lo levantado en OSM que no está inventariado */}
      <section style={{ borderTop: '1px solid var(--gr-linea)', paddingTop: '0.75rem' }}>
        <p className="text-[13px] font-semibold" style={{ color: 'var(--gr-tinta)' }}>
          Levantado en OSM y no inventariado
        </p>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Registros de OpenStreetMap sin ningún equipamiento del GADM a 50 m. Es la cola de
          verificación en terreno, al revés que la lista de arriba.
        </p>
        <select
          value={analisis.hallazgos}
          onChange={(e) => cambiar({ hallazgos: e.target.value as ClaveCategoria })}
          className="mt-2 w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.clave} value={c.clave}>
              {c.rotulo}
            </option>
          ))}
        </select>

        <p className="mt-2 text-[12px]" style={{ color: 'var(--gr-tinta-2)' }}>
          <b className="gr-num">{numero(hallazgos.length)}</b>{' '}
          {rotulo(analisis.hallazgos).toLowerCase()} sin equivalente en el inventario.
        </p>

        {hallazgos.length > 0 && (
          <>
            <button
              type="button"
              className="gr-btn gr-btn--secundario mt-2"
              onClick={onDescargarHallazgos}
            >
              Descargar CSV con coordenadas
            </button>
            <ul className="mt-2 max-h-[26vh] overflow-auto">
              {hallazgos.slice(0, 60).map((h) => (
                <li key={h.punto.id}>
                  <button
                    type="button"
                    onClick={() => onElegirPunto(h.punto.id)}
                    className="flex w-full items-start gap-2 rounded px-1 py-1 text-left text-[12px] hover:bg-black/5"
                  >
                    <span
                      aria-hidden
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: colorSerie(h.punto.categoria) }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate" style={{ color: 'var(--gr-tinta-2)' }}>
                        {h.punto.nombre || 'Sin nombre'}
                      </span>
                      <span className="block truncate text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                        {h.punto.clase}
                        {h.punto.barrio ? ` · ${h.punto.barrio}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {hallazgos.length > 60 && (
              <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                Se listan los 60 primeros; el CSV los trae todos.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
