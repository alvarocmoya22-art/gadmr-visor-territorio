import { CATEGORIAS, colorSerie, POR_CLAVE, type ClaveCategoria } from '../lib/categorias'
import { numero, porcentaje } from '../lib/format'
import type { Cruce, Deficit, Hallazgo } from '../lib/analisis'
import {
  EQUIVALENTE_OSM,
  RADIOS,
  type Cobertura,
  type FuenteCobertura,
} from '../lib/cobertura'

/** Qué se pinta sobre los barrios; solo cabe una cosa a la vez. */
export type CapaBarrios = 'ninguna' | 'deficit' | 'cobertura'

/** Lo que el usuario ha elegido analizar. Vive en App y se pasa entero. */
export interface EstadoAnalisis {
  /** Coropleta activa sobre los barrios. */
  capaBarrios: CapaBarrios
  /** Tipo de equipamiento del que se mide la cobertura. */
  tipo: string
  /** Radio de servicio en metros. */
  radio: number
  /** De dónde salen los equipamientos que cuentan como servicio. */
  fuente: FuenteCobertura
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
  capaBarrios: 'ninguna',
  tipo: 'educativo',
  radio: 500,
  fuente: 'gadm',
  cruce: false,
  a: 'comercio',
  b: 'salud',
  umbral: 500,
  hallazgos: 'salud',
}

/** Tramos de la escala de cobertura; los colores son los de la capa del mapa. */
const TRAMOS_COBERTURA = [
  { color: '#eef4ef', rotulo: 'menos del 20 %' },
  { color: '#c9e3d0', rotulo: '20 a 40 %' },
  { color: '#95c9a8', rotulo: '40 a 60 %' },
  { color: '#55a87a', rotulo: '60 a 80 %' },
  { color: '#1b6046', rotulo: 'más del 80 %' },
]

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
  cobertura: Cobertura | null
  /** Tipos del inventario en el ámbito, con cuántos hay de cada uno. */
  tipos: { tipo: string; n: number }[]
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
  cobertura,
  tipos,
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

      {/* ──────────────────────── 1. lo que se pinta sobre los barrios */}
      <section>
        <label htmlFor="capa-barrios" className="gr-eyebrow mb-1.5">
          Análisis por barrio
        </label>
        <select
          id="capa-barrios"
          value={analisis.capaBarrios}
          onChange={(e) => cambiar({ capaBarrios: e.target.value as CapaBarrios })}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          <option value="ninguna">Sin capa por barrio</option>
          <option value="deficit">Distancia al equipamiento más cercano</option>
          <option value="cobertura">Cobertura por radio de servicio</option>
        </select>

        {/* ── cobertura por área de influencia */}
        {analisis.capaBarrios === 'cobertura' && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Qué parte de cada barrio queda dentro del radio de servicio de algún equipamiento
              del tipo elegido.
            </p>

            <label className="block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Tipo de equipamiento
              <select
                value={analisis.tipo}
                onChange={(e) => cambiar({ tipo: e.target.value })}
                className="mt-0.5 w-full rounded border px-2 py-1.5 text-[13px]"
                style={campo}
              >
                {tipos.map((t) => (
                  <option key={t.tipo} value={t.tipo}>
                    {t.tipo} · {numero(t.n)}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                Radio de servicio
              </p>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {RADIOS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => cambiar({ radio: r })}
                    aria-pressed={analisis.radio === r}
                    className="gr-num rounded border px-1 py-1 text-[12px]"
                    style={{
                      borderColor: analisis.radio === r ? 'var(--gr-info)' : 'var(--gr-linea-fuerte)',
                      background: analisis.radio === r ? 'var(--gr-info)' : 'var(--gr-superficie)',
                      color: analisis.radio === r ? '#ffffff' : 'var(--gr-tinta-2)',
                    }}
                  >
                    {r} m
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Contar como servicio
              <select
                value={analisis.fuente}
                onChange={(e) => cambiar({ fuente: e.target.value as FuenteCobertura })}
                className="mt-0.5 w-full rounded border px-2 py-1.5 text-[13px]"
                style={campo}
                disabled={!EQUIVALENTE_OSM[analisis.tipo]}
              >
                <option value="gadm">Solo el inventario del GADM</option>
                <option value="osm">Solo lo registrado en OSM</option>
                <option value="ambas">Las dos fuentes juntas</option>
              </select>
            </label>
            {!EQUIVALENTE_OSM[analisis.tipo] && (
              <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                Este tipo no tiene equivalente claro en OSM, así que se cuenta solo el inventario.
              </p>
            )}

            {cobertura && (
              <>
                <dl className="grid grid-cols-3 gap-2 text-center">
                  {(cobertura.poblacion > 0
                    ? [
                        {
                          t: 'de la población cubierta',
                          v: porcentaje((cobertura.poblacionCubierta / cobertura.poblacion) * 100),
                        },
                        { t: 'personas fuera', v: numero(cobertura.poblacion - cobertura.poblacionCubierta) },
                        { t: 'equipamientos', v: numero(cobertura.servicios) },
                      ]
                    : [
                        { t: 'del área cubierta', v: porcentaje(cobertura.total * 100) },
                        { t: 'barrios sin nada', v: numero(cobertura.sinNada) },
                        { t: 'equipamientos', v: numero(cobertura.servicios) },
                      ]
                  ).map((c) => (
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

                {cobertura.poblacion > 0 && (
                  <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                    {numero(cobertura.poblacionCubierta)} de {numero(cobertura.poblacion)} habitantes
                    · {porcentaje(cobertura.total * 100)} de la superficie ·{' '}
                    {numero(cobertura.poblacionSinNada)} viven en barrios sin ninguna cobertura.
                  </p>
                )}

                {cobertura.fuente === 'ambas' && (
                  <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                    {numero(cobertura.deGadm)} del inventario y {numero(cobertura.deOsm)} de OSM.
                  </p>
                )}

                <ul className="space-y-0.5">
                  {TRAMOS_COBERTURA.map((t) => (
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

                {cobertura.filas.length > 0 && (
                  <>
                    <p className="gr-eyebrow mb-1">
                      {cobertura.poblacion > 0 ? 'Donde queda más gente fuera' : 'Los peor cubiertos'}
                    </p>
                    <ul className="max-h-[22vh] overflow-auto">
                      {cobertura.filas.slice(0, 12).map((f) => (
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
                            <span
                              className="gr-num shrink-0"
                              style={{
                                color: f.cubierto === 0 ? 'var(--gr-error)' : 'var(--gr-tinta-3)',
                              }}
                            >
                              {cobertura.poblacion > 0
                                ? `${numero(Math.round(f.pob - f.pobCubierta))} hab`
                                : porcentaje(f.cubierto * 100)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Un porcentaje de cobertura invita a citarse tal cual. Las
                    tres limitaciones van pegadas al numero, no en una ayuda
                    aparte que nadie abre. */}
                <p className="gr-nota">
                  Medido en línea recta, con todos los equipamientos pesando igual —sin su
                  capacidad— y repartiendo la población uniformemente dentro de cada barrio. El
                  radio es un valor de partida: fíjelo contra el estándar urbanístico del PUGS
                  antes de llevar la cifra a un informe.
                  {cobertura.poblacion > 0 && ' Población: INEC, Censo 2022.'}
                </p>
              </>
            )}
          </div>
        )}

        {analisis.capaBarrios === 'deficit' && (
          <p className="mt-2 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Pinta cada barrio según lo lejos que le queda el equipamiento municipal más cercano.
          </p>
        )}

        {analisis.capaBarrios === 'deficit' && deficit && (
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
