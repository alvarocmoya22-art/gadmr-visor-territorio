import { POR_CLAVE, colorSerie, type ClaveCategoria } from '../lib/categorias'
import { numero, porcentaje } from '../lib/format'
import {
  ESCENARIOS,
  RADIOS_HEXAGONO,
  RADIO_HEXAGONO_INICIAL,
  ARCO_ALERTA_M,
  MAX_ARCOS,
  type ClaveEscenario,
  type ColorPor,
  type PesoDensidad,
} from '../config/deckEscenarios'
import { RAMPA_DENSIDAD } from '../lib/deck/colores'

/** Lo elegido en la vista de análisis espacial. Vive en App. */
export interface EstadoEspacial {
  escenario: ClaveEscenario
  colorPor: ColorPor
  radio: number
  peso: PesoDensidad
  extruido: boolean
  tipoEquipamiento: string
}

export const ESPACIAL_INICIAL: EstadoEspacial = {
  escenario: 'puntos',
  colorPor: 'categoria',
  radio: RADIO_HEXAGONO_INICIAL,
  peso: 'registros',
  extruido: true,
  tipoEquipamiento: 'educativo',
}

/** Resumen que calcula `lib/deck/escenarios` y esta vista solo muestra. */
export interface ResumenFlujos {
  poblacion: number
  lejos: number
  poblacionLejos: number
  mediana: number | null
  porEquipamiento: { nombre: string; barrios: number; poblacion: number }[]
}

interface Props {
  estado: EstadoEspacial
  onEstado: (e: EstadoEspacial) => void
  /** Tipos del inventario, con cuántos hay de cada uno. */
  tipos: { tipo: string; n: number }[]
  /** Registros en vista, ya filtrados. */
  totalPuntos: number
  /** Reparto por categoría, para la tabla alternativa al mapa. */
  porCategoria: { clave: string; n: number }[]
  pendientes: number
  /** Resumen de la asignación; null mientras no toque. */
  flujos: ResumenFlujos | null
  arcos: number
  ambito: string
}

const campo = {
  background: 'var(--gr-superficie)',
  borderColor: 'var(--gr-linea-fuerte)',
  color: 'var(--gr-tinta)',
}

/** Mínimo táctil: 44 px de alto, como pide la pauta de accesibilidad. */
const TACTIL = { minHeight: 44 }

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

/**
 * Análisis espacial: los mismos datos del visor, dibujados con deck.gl.
 *
 * Cada escenario lleva sus indicadores, su leyenda y una tabla con las mismas
 * cifras: un mapa 3D no es legible para todo el mundo ni con un lector de
 * pantalla, así que la tabla no es un extra, es la vía alternativa.
 */
export default function PanelEspacial({
  estado,
  onEstado,
  tipos,
  totalPuntos,
  porCategoria,
  pendientes,
  flujos,
  arcos,
  ambito,
}: Props) {
  const cambiar = (p: Partial<EstadoEspacial>) => onEstado({ ...estado, ...p })
  const actual = ESCENARIOS.find((e) => e.clave === estado.escenario)

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="escenario" className="gr-eyebrow mb-1.5">
          Escenario · {ambito}
        </label>
        <select
          id="escenario"
          value={estado.escenario}
          onChange={(e) => cambiar({ escenario: e.target.value as ClaveEscenario })}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={{ ...campo, ...TACTIL }}
        >
          {ESCENARIOS.map((e) => (
            <option key={e.clave} value={e.clave} disabled={e.bloqueado !== null}>
              {e.rotulo}
              {e.bloqueado !== null ? ' — sin datos' : ''}
            </option>
          ))}
        </select>
        {actual && (
          <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            {actual.resumen} {actual.origen}
          </p>
        )}
      </div>

      {/* El escenario bloqueado explica por qué, en vez de desaparecer. */}
      {actual?.bloqueado && <p className="gr-nota gr-nota--aviso">{actual.bloqueado}</p>}

      {/* ───────────────────────────────────────── puntos */}
      {estado.escenario === 'puntos' && (
        <>
          <label className="block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Colorear por
            <select
              value={estado.colorPor}
              onChange={(e) => cambiar({ colorPor: e.target.value as ColorPor })}
              className="mt-0.5 w-full rounded border px-2 py-1.5 text-[13px]"
              style={{ ...campo, ...TACTIL }}
            >
              <option value="categoria">Categoría del registro</option>
              <option value="frescura">Estado de la verificación</option>
            </select>
          </label>

          <Cifras
            items={[
              { t: 'registros en vista', v: numero(totalPuntos) },
              { t: 'categorías', v: numero(porCategoria.length) },
              {
                t: 'pendientes',
                v: totalPuntos ? porcentaje((pendientes / totalPuntos) * 100) : '—',
              },
            ]}
          />

          <table className="gr-tabla">
            <caption className="gr-eyebrow mb-1 text-left">Registros por categoría</caption>
            <thead>
              <tr>
                <th scope="col">Categoría</th>
                <th scope="col" className="text-right">
                  Registros
                </th>
              </tr>
            </thead>
            <tbody>
              {porCategoria.map((c) => (
                <tr key={c.clave}>
                  <th scope="row" className="font-normal">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: colorSerie(c.clave as ClaveCategoria) }}
                      />
                      {POR_CLAVE.get(c.clave as ClaveCategoria)?.rotulo ?? c.clave}
                    </span>
                  </th>
                  <td className="gr-num text-right">{numero(c.n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ───────────────────────────────────────── densidad */}
      {estado.escenario === 'densidad' && (
        <>
          <div>
            <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Radio del hexágono
            </p>
            <div className="mt-1 grid grid-cols-4 gap-1">
              {RADIOS_HEXAGONO.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => cambiar({ radio: r })}
                  aria-pressed={estado.radio === r}
                  className="gr-num rounded border px-1 text-[12px]"
                  style={{
                    ...TACTIL,
                    borderColor: estado.radio === r ? 'var(--gr-info)' : 'var(--gr-linea-fuerte)',
                    background: estado.radio === r ? 'var(--gr-info)' : 'var(--gr-superficie)',
                    color: estado.radio === r ? '#ffffff' : 'var(--gr-tinta-2)',
                  }}
                >
                  {r} m
                </button>
              ))}
            </div>
          </div>

          <label className="block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Qué se agrega
            <select
              value={estado.peso}
              onChange={(e) => cambiar({ peso: e.target.value as PesoDensidad })}
              className="mt-0.5 w-full rounded border px-2 py-1.5 text-[13px]"
              style={{ ...campo, ...TACTIL }}
            >
              <option value="registros">Todos los registros</option>
              <option value="pendientes">Solo lo que falta verificar</option>
            </select>
          </label>

          <label
            className="flex items-center gap-2 text-[13px]"
            style={{ color: 'var(--gr-tinta-2)', ...TACTIL }}
          >
            <input
              type="checkbox"
              checked={estado.extruido}
              onChange={(e) => cambiar({ extruido: e.target.checked })}
            />
            Levantar en 3D
          </label>

          <Cifras
            items={[
              {
                t: 'puntos agregados',
                v: numero(estado.peso === 'pendientes' ? pendientes : totalPuntos),
              },
              { t: 'radio', v: `${numero(estado.radio)} m` },
              { t: 'vista', v: estado.extruido ? '3D' : 'plana' },
            ]}
          />

          <div>
            <p className="gr-eyebrow mb-1">Escala de densidad</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                menos
              </span>
              <span
                aria-hidden
                className="h-2 flex-1 rounded-sm"
                style={{
                  background: `linear-gradient(to right, ${RAMPA_DENSIDAD.map(
                    (c) => `rgb(${c[0]},${c[1]},${c[2]})`,
                  ).join(',')})`,
                }}
              />
              <span className="text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                más
              </span>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              El color se reparte por cuantiles dentro de lo que hay en vista, así que el extremo
              oscuro es «lo más denso de aquí», no una cantidad fija. Al cambiar de plataforma, la
              escala se recalcula.
            </p>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────── flujos */}
      {estado.escenario === 'flujos' && (
        <>
          <label className="block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Equipamiento al que se asigna
            <select
              value={estado.tipoEquipamiento}
              onChange={(e) => cambiar({ tipoEquipamiento: e.target.value })}
              className="mt-0.5 w-full rounded border px-2 py-1.5 text-[13px]"
              style={{ ...campo, ...TACTIL }}
            >
              {tipos.map((t) => (
                <option key={t.tipo} value={t.tipo}>
                  {t.tipo} · {numero(t.n)}
                </option>
              ))}
            </select>
          </label>

          {flujos && arcos > 0 ? (
            <>
              <Cifras
                items={[
                  { t: 'barrios asignados', v: numero(arcos) },
                  {
                    t: 'distancia mediana',
                    v: flujos.mediana === null ? '—' : `${numero(flujos.mediana)} m`,
                  },
                  { t: 'población', v: numero(flujos.poblacion) },
                ]}
              />

              <p className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                {numero(flujos.lejos)} barrios a más de {numero(ARCO_ALERTA_M)} m, con{' '}
                {numero(flujos.poblacionLejos)} habitantes; sus arcos van en rojo.
              </p>

              <table className="gr-tabla">
                <caption className="gr-eyebrow mb-1 text-left">
                  Carga por equipamiento
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Equipamiento</th>
                    <th scope="col" className="text-right">
                      Barrios
                    </th>
                    <th scope="col" className="text-right">
                      Habitantes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {flujos.porEquipamiento.slice(0, 12).map((e) => (
                    <tr key={e.nombre}>
                      <th scope="row" className="font-normal">
                        {e.nombre}
                      </th>
                      <td className="gr-num text-right">{numero(e.barrios)}</td>
                      <td className="gr-num text-right">{numero(e.poblacion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Un arco entre dos puntos se lee como un viaje, y no lo es.
                  Decirlo aquí evita que la imagen diga más de lo que el dato
                  sostiene. */}
              <p className="gr-nota">
                No son viajes observados: el proyecto no tiene ninguna matriz origen-destino. Cada
                arco une el centro de un barrio con el equipamiento que le queda más cerca en línea
                recta, y su grosor es la población del barrio según el Censo 2022. Sirve para ver
                qué equipamiento carga con cuánta gente, no para medir desplazamientos.
                {arcos >= MAX_ARCOS &&
                  ` Se dibujan los ${numero(MAX_ARCOS)} barrios más poblados para que la vista siga siendo legible.`}
              </p>
            </>
          ) : (
            <p className="gr-nota gr-nota--aviso">
              No hay equipamientos de ese tipo en el ámbito, o los barrios en vista no tienen
              población asignada, así que no hay nada que enlazar.
            </p>
          )}
        </>
      )}
    </div>
  )
}
