import { CATEGORIAS, colorSerie, POR_CLAVE, type ClaveCategoria } from '../lib/categorias'
import { numero, porcentaje } from '../lib/format'
import type { Cruce, Deficit, Hallazgo } from '../lib/analisis'
import { EQUIVALENTE_OSM, type Cobertura, type FuenteCobertura } from '../lib/cobertura'
import { claveNivel, nivelesMedibles, CITA_NORMA, NORMA } from '../lib/norma'

/**
 * Qué se está analizando. Uno a la vez, a propósito.
 *
 * Los cuatro apilados ocupaban tres pantallas de scroll y un centenar de
 * controles, y nadie usa dos a la vez: o se mide cobertura, o se cruzan
 * categorías, o se revisa la cola de verificación. Con un solo selector,
 * además, los que no están a la vista dejan de calcularse.
 */
export type Analisis = 'ninguno' | 'distancia' | 'cobertura' | 'cruce' | 'inventario'

/** Lo que el usuario ha elegido analizar. Vive en App y se pasa entero. */
export interface EstadoAnalisis {
  activo: Analisis
  /** Tipo de equipamiento; vale para distancia y para cobertura. */
  tipo: string
  /** Nivel de la norma elegido, por su clave; de él sale el radio. */
  nivel: string
  /** De dónde salen los equipamientos que cuentan como servicio. */
  fuente: FuenteCobertura
  a: ClaveCategoria
  b: ClaveCategoria
  /** Distancia, en metros, por debajo de la cual se da por atendido. */
  umbral: number
  /** Categoría de la que se listan los registros no inventariados. */
  hallazgos: ClaveCategoria
}

export const ANALISIS_INICIAL: EstadoAnalisis = {
  activo: 'ninguno',
  tipo: 'educativo',
  nivel: 'EE1|400',
  fuente: 'gadm',
  a: 'comercio',
  b: 'salud',
  umbral: 500,
  hallazgos: 'salud',
}

const OPCIONES: { clave: Analisis; rotulo: string }[] = [
  { clave: 'ninguno', rotulo: 'Nada por ahora' },
  { clave: 'distancia', rotulo: 'Distancia al equipamiento más cercano' },
  { clave: 'cobertura', rotulo: 'Cobertura por radio de la ordenanza' },
  { clave: 'cruce', rotulo: 'Cruce de dos categorías' },
  { clave: 'inventario', rotulo: 'Levantado en OSM y no inventariado' },
]

/** Tramos de las escalas; los colores son los de las capas del mapa. */
const TRAMOS_COBERTURA = [
  { color: '#eef4ef', rotulo: 'menos del 20 %' },
  { color: '#c9e3d0', rotulo: '20 a 40 %' },
  { color: '#95c9a8', rotulo: '40 a 60 %' },
  { color: '#55a87a', rotulo: '60 a 80 %' },
  { color: '#1b6046', rotulo: 'más del 80 %' },
]
const TRAMOS_DISTANCIA = [
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
  /** Tipos del inventario, con cuántos hay de cada uno. */
  tipos: { tipo: string; n: number }[]
  /** Los puntos que prestan el servicio elegido, y de dónde salen. */
  servicios: { servicios: unknown[]; deGadm: number; deOsm: number }
  cruce: Cruce | null
  hallazgos: Hallazgo[]
  /** Ámbito sobre el que se calcula todo, para decirlo en los rótulos. */
  ambito: string
  onElegirBarrio: (nombre: string) => void
  onElegirPunto: (id: string) => void
  onDescargarHallazgos: () => void
}

const rotulo = (c: ClaveCategoria) => POR_CLAVE.get(c)?.rotulo ?? c

const campo = {
  background: 'var(--gr-superficie)',
  borderColor: 'var(--gr-linea-fuerte)',
  color: 'var(--gr-tinta)',
}

/** Tres cifras en fila; es el formato que comparten los cuatro análisis. */
function Cifras({ items }: { items: { t: string; v: string }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2 text-center">
      {items.map((c) => (
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
  )
}

/** Leyenda de una coropleta. */
function Escala({ tramos }: { tramos: { color: string; rotulo: string }[] }) {
  return (
    <ul className="space-y-0.5">
      {tramos.map((t) => (
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
  )
}

/** Lista de barrios con una cifra a la derecha; al pulsar, filtra por él. */
function ListaBarrios({
  titulo,
  filas,
  onElegir,
}: {
  titulo: string
  filas: { nombre: string; valor: string; alerta?: boolean }[]
  onElegir: (nombre: string) => void
}) {
  if (filas.length === 0) return null
  return (
    <>
      <p className="gr-eyebrow mb-1">{titulo}</p>
      <ul className="max-h-[24vh] overflow-auto">
        {filas.map((f) => (
          <li key={f.nombre}>
            <button
              type="button"
              onClick={() => onElegir(f.nombre)}
              className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[12px] hover:bg-black/5"
            >
              <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--gr-tinta-2)' }}>
                {f.nombre}
              </span>
              <span
                className="gr-num shrink-0"
                style={{ color: f.alerta ? 'var(--gr-error)' : 'var(--gr-tinta-3)' }}
              >
                {f.valor}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * Los cuatro análisis que el visor responde sin salir de la pantalla, todos
 * sobre el ámbito que dejan los filtros: si arriba se elige la plataforma D,
 * aquí se habla de la D.
 */
export default function PanelAnalisis({
  analisis,
  onAnalisis,
  deficit,
  cobertura,
  tipos,
  servicios,
  cruce,
  hallazgos,
  ambito,
  onElegirBarrio,
  onElegirPunto,
  onDescargarHallazgos,
}: Props) {
  const cambiar = (parcial: Partial<EstadoAnalisis>) => onAnalisis({ ...analisis, ...parcial })
  const porBarrio = analisis.activo === 'distancia' || analisis.activo === 'cobertura'

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="que-analizar" className="gr-eyebrow mb-1.5">
          Qué analizar · {ambito}
        </label>
        <select
          id="que-analizar"
          value={analisis.activo}
          onChange={(e) => cambiar({ activo: e.target.value as Analisis })}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          {OPCIONES.map((o) => (
            <option key={o.clave} value={o.clave}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Todo se calcula sobre lo que dejan ver los filtros. Las distancias son en línea recta;
          por calle siempre serán algo mayores.
        </p>
      </div>

      {/* Tipo y fuente valen para las dos capas por barrio: las dos miden
          contra los mismos puntos, y separarlas daría lecturas que se
          contradicen entre sí. */}
      {porBarrio && (
        <div className="space-y-2">
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

          <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            {!EQUIVALENTE_OSM[analisis.tipo] ? (
              'Este tipo no tiene equivalente claro en OSM, así que se cuenta solo el inventario.'
            ) : (
              <>
                {numero(servicios.servicios.length)}{' '}
                {servicios.servicios.length === 1 ? 'punto' : 'puntos'} en vista
                {analisis.fuente === 'ambas' &&
                  ` · ${numero(servicios.deGadm)} del inventario y ${numero(servicios.deOsm)} de OSM`}
                .
              </>
            )}
          </p>
        </div>
      )}

      {/* ─────────────────────────────── distancia al más cercano */}
      {analisis.activo === 'distancia' && (
        <div className="space-y-2">
          <Escala tramos={TRAMOS_DISTANCIA} />
          {deficit && (
            <>
              <Cifras
                items={[
                  { t: 'barrios', v: numero(deficit.filas.length) },
                  { t: 'sin ninguno', v: numero(deficit.sinNada) },
                  {
                    t: 'mediana',
                    v: deficit.mediana === null ? '—' : `${numero(deficit.mediana)} m`,
                  },
                ]}
              />
              <ListaBarrios
                titulo="Los más alejados"
                onElegir={onElegirBarrio}
                filas={deficit.filas.slice(0, 12).map((f) => ({
                  nombre: f.nombre,
                  valor: f.distancia === null ? '—' : `${numero(f.distancia)} m`,
                  alerta: f.equipamientos === 0,
                }))}
              />
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────── cobertura por radio normativo */}
      {analisis.activo === 'cobertura' && (
        <div className="space-y-2">
          <div>
            <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Radio de influencia según la ordenanza
            </p>
            <div className="mt-1 space-y-1">
              {nivelesMedibles(analisis.tipo).map((n) => {
                const clave = claveNivel(n)
                const activo = analisis.nivel === clave
                return (
                  <button
                    key={clave}
                    type="button"
                    onClick={() => cambiar({ nivel: clave })}
                    aria-pressed={activo}
                    className="flex w-full items-baseline gap-2 rounded border px-2 py-1 text-left text-[12px]"
                    style={{
                      borderColor: activo ? 'var(--gr-info)' : 'var(--gr-linea-fuerte)',
                      background: activo ? 'var(--gr-info)' : 'var(--gr-superficie)',
                      color: activo ? '#ffffff' : 'var(--gr-tinta-2)',
                    }}
                  >
                    <span className="font-semibold">{n.tipologia}</span>
                    <span className="gr-num">{numero(n.radio!)} m</span>
                    <span className="gr-num text-[10px] opacity-80">{n.simbolo}</span>
                  </button>
                )
              })}
            </div>
            {/* Qué cubre cada nivel: «Barrial» a secas no dice si entra el
                colegio o solo la escuela. */}
            {(() => {
              const n = nivelesMedibles(analisis.tipo).find((x) => claveNivel(x) === analisis.nivel)
              if (!n) return null
              return (
                <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                  {n.actividades}
                  {n.m2hab !== null && ` · norma ${n.m2hab} m²/hab`}
                  {n.pobBase !== null && ` · población base ${numero(n.pobBase)} hab`}
                </p>
              )
            })()}
            {(NORMA[analisis.tipo] ?? []).some((n) => n.radio === null) && (
              <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                El nivel cantonal no aparece porque la ordenanza no le fija radio: sirve a toda la
                ciudad.
              </p>
            )}
          </div>

          {cobertura && (
            <>
              <Cifras
                items={
                  cobertura.poblacion > 0
                    ? [
                        {
                          t: 'de la población cubierta',
                          v: porcentaje((cobertura.poblacionCubierta / cobertura.poblacion) * 100),
                        },
                        {
                          t: 'personas fuera',
                          v: numero(cobertura.poblacion - cobertura.poblacionCubierta),
                        },
                        { t: 'equipamientos', v: numero(cobertura.servicios) },
                      ]
                    : [
                        { t: 'del área cubierta', v: porcentaje(cobertura.total * 100) },
                        { t: 'barrios sin nada', v: numero(cobertura.sinNada) },
                        { t: 'equipamientos', v: numero(cobertura.servicios) },
                      ]
                }
              />

              {cobertura.poblacion > 0 && (
                <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                  {numero(cobertura.poblacionCubierta)} de {numero(cobertura.poblacion)} habitantes
                  · {porcentaje(cobertura.total * 100)} de la superficie ·{' '}
                  {numero(cobertura.poblacionSinNada)} viven en barrios sin ninguna cobertura.
                </p>
              )}

              <Escala tramos={TRAMOS_COBERTURA} />

              <ListaBarrios
                titulo={
                  cobertura.poblacion > 0 ? 'Donde queda más gente fuera' : 'Los peor cubiertos'
                }
                onElegir={onElegirBarrio}
                filas={cobertura.filas.slice(0, 12).map((f) => ({
                  nombre: f.nombre,
                  valor:
                    cobertura.poblacion > 0
                      ? `${numero(Math.round(f.pob - f.pobCubierta))} hab`
                      : porcentaje(f.cubierto * 100),
                  alerta: f.cubierto === 0,
                }))}
              />

              {/* Un porcentaje de cobertura invita a citarse tal cual, así que
                  sus límites van pegados al número y no en una ayuda aparte. */}
              <p className="gr-nota">
                Radio de influencia del {CITA_NORMA}. La propia tabla dice que es «evaluatorio en
                las áreas urbanas consolidadas», que es justo este uso.
                {cobertura.poblacion > 0 && ' Población: INEC, Censo 2022.'} Medido en línea recta,
                con todos los equipamientos pesando igual —sin su capacidad— y repartiendo la
                población uniformemente dentro de cada barrio.
              </p>
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────── cruce de dos categorías */}
      {analisis.activo === 'cruce' && (
        <div className="space-y-2">
          <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Mide a qué distancia tiene cada punto de la primera categoría el más cercano de la
            segunda. Solo usa lo registrado en OpenStreetMap, y en el mapa se apaga el resto.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['a', 'b'] as const).map((lado) => (
              <label key={lado} className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                {lado === 'a' ? 'Desde' : 'Hasta'}
                <select
                  value={analisis[lado]}
                  onChange={(e) => cambiar({ [lado]: e.target.value as ClaveCategoria })}
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
            ))}
          </div>

          <div>
            <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Se da por atendido a menos de
            </p>
            <div className="mt-1 flex gap-1">
              {UMBRALES.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => cambiar({ umbral: u })}
                  aria-pressed={analisis.umbral === u}
                  className="gr-num flex-1 rounded border px-1 py-1 text-[12px]"
                  style={{
                    borderColor: analisis.umbral === u ? 'var(--gr-info)' : 'var(--gr-linea-fuerte)',
                    background: analisis.umbral === u ? 'var(--gr-info)' : 'var(--gr-superficie)',
                    color: analisis.umbral === u ? '#ffffff' : 'var(--gr-tinta-2)',
                  }}
                >
                  {u} m
                </button>
              ))}
            </div>
          </div>

          {cruce &&
            (cruce.nA === 0 || cruce.nB === 0 ? (
              <p className="gr-nota gr-nota--aviso">
                No hay {cruce.nA === 0 ? rotulo(cruce.a) : rotulo(cruce.b)} en este ámbito, así que
                el cruce no da nada. Pruebe con otra categoría o quite el filtro de plataforma.
              </p>
            ) : (
              <>
                <p className="text-[12px]" style={{ color: 'var(--gr-tinta-2)' }}>
                  <b className="gr-num">{numero(cruce.nA)}</b> {rotulo(cruce.a).toLowerCase()}{' '}
                  frente a <b className="gr-num">{numero(cruce.nB)}</b>{' '}
                  {rotulo(cruce.b).toLowerCase()}.
                </p>
                <Cifras
                  items={[
                    {
                      t: `a menos de ${cruce.umbral} m`,
                      v: `${Math.round((cruce.cubiertos / cruce.nA) * 100)} %`,
                    },
                    {
                      t: 'distancia mediana',
                      v: cruce.mediana === null ? '—' : `${numero(cruce.mediana)} m`,
                    },
                    { t: 'quedan fuera', v: numero(cruce.desatendidos.length) },
                  ]}
                />
                <p
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: 'var(--gr-tinta-3)' }}
                >
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

                <ListaBarrios
                  titulo={`Barrios con ${rotulo(cruce.a).toLowerCase()} y sin ${rotulo(
                    cruce.b,
                  ).toLowerCase()} · ${numero(cruce.barriosSinB.length)}`}
                  onElegir={onElegirBarrio}
                  filas={cruce.barriosSinB.slice(0, 12).map((f) => ({
                    nombre: f.nombre,
                    valor: numero(f.a),
                  }))}
                />

                {/* Este umbral no sale de ninguna norma y convive con los
                    radios del Código Urbano en el mismo panel. Decirlo evita
                    que las dos cifras se citen con el mismo peso. */}
                <p className="gr-nota">
                  El umbral de {cruce.umbral} m es de exploración, no normativo: la ordenanza fija
                  radios para los equipamientos, no para la distancia entre categorías de
                  OpenStreetMap. Para una cifra con respaldo, use «Cobertura por radio de la
                  ordenanza».
                </p>
              </>
            ))}
        </div>
      )}

      {/* ──────────────── lo levantado en OSM que no está inventariado */}
      {analisis.activo === 'inventario' && (
        <div className="space-y-2">
          <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Registros de OpenStreetMap sin ningún equipamiento del GADM a 50 m. Es la cola de
            verificación en terreno, al revés que la distancia y la cobertura.
          </p>
          <select
            value={analisis.hallazgos}
            onChange={(e) => cambiar({ hallazgos: e.target.value as ClaveCategoria })}
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={campo}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.clave} value={c.clave}>
                {c.rotulo}
              </option>
            ))}
          </select>

          <p className="text-[12px]" style={{ color: 'var(--gr-tinta-2)' }}>
            <b className="gr-num">{numero(hallazgos.length)}</b>{' '}
            {rotulo(analisis.hallazgos).toLowerCase()} sin equivalente en el inventario.
          </p>

          {hallazgos.length > 0 && (
            <>
              <button
                type="button"
                className="gr-btn gr-btn--secundario"
                onClick={onDescargarHallazgos}
              >
                Descargar CSV con coordenadas
              </button>
              <ul className="max-h-[30vh] overflow-auto">
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
                        <span
                          className="block truncate text-[10px]"
                          style={{ color: 'var(--gr-tinta-3)' }}
                        >
                          {h.punto.clase}
                          {h.punto.barrio ? ` · ${h.punto.barrio}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {hallazgos.length > 60 && (
                <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                  Se listan los 60 primeros; el CSV los trae todos.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
