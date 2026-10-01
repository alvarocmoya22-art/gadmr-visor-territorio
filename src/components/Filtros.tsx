import { CATEGORIAS, colorSerie, type ClaveCategoria } from '../lib/categorias'
import { numero } from '../lib/format'
import type { Filtros as FiltrosT, Resumen } from '../hooks/usePuntos'
import type { CapasVisibles, MapaCalor } from './Mapa'
import { URBANO, type Barrio, type Plataforma } from '../lib/municipal'
import { colorUso } from '../lib/usos'
import { MAPAS_BASE } from '../config/mapasBase'
import { hayToken as hayTokenMapillary } from '../lib/mapillary'

interface Props {
  filtros: FiltrosT
  /** Resumen del ambito visible (plataforma, texto y estado), sin el filtro de categorias. */
  resumenAmbito: Resumen
  plataformas: Plataforma[]
  barrios: Barrio[]
  capas: CapasVisibles
  mapaBase: string
  onMapaBase: (clave: string) => void
  mapaCalor: MapaCalor
  onMapaCalor: (m: MapaCalor) => void
  /** Usos del inventario en el ambito, con su cuenta. */
  usosEquip: { tipo: string; n: number }[]
  /** Que tiñe los anillos del inventario. */
  colorEquip: 'cotejo' | 'uso'
  onColorEquip: (c: 'cotejo' | 'uso') => void
  onCambio: (f: FiltrosT) => void
  onCapas: (c: CapasVisibles) => void
}

const CAPAS: { clave: keyof CapasVisibles; rotulo: string }[] = [
  { clave: 'osm', rotulo: 'Registros de OpenStreetMap' },
  { clave: 'plataformas', rotulo: 'Plataformas' },
  { clave: 'parroquias', rotulo: 'Parroquias urbanas' },
  { clave: 'barrios', rotulo: 'Barrios' },
  { clave: 'equipamientos', rotulo: 'Equipamientos del GADM' },
  { clave: 'mapillary', rotulo: 'Fotos de calle (Mapillary)' },
]

/**
 * Leyenda y filtro son el mismo control: el color de cada categoria se muestra
 * junto a su rotulo y su conteo, de modo que la clase nunca depende solo del color.
 */
export default function Filtros({
  filtros,
  resumenAmbito,
  plataformas,
  barrios,
  capas,
  mapaBase,
  onMapaBase,
  mapaCalor,
  onMapaCalor,
  usosEquip,
  colorEquip,
  onColorEquip,
  onCambio,
  onCapas,
}: Props) {
  const conteo = new Map(resumenAmbito.porCategoria.map((c) => [c.clave, c.total]))

  const alternar = (clave: ClaveCategoria) => {
    const categorias = new Set(filtros.categorias)
    if (categorias.has(clave)) categorias.delete(clave)
    else categorias.add(clave)
    onCambio({ ...filtros, categorias })
  }

  const campo = {
    background: 'var(--gr-superficie)',
    borderColor: 'var(--gr-linea-fuerte)',
    color: 'var(--gr-tinta)',
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="buscar" className="sr-only">
          Buscar por nombre, clase o calle
        </label>
        <input
          id="buscar"
          type="search"
          value={filtros.texto}
          onChange={(e) => onCambio({ ...filtros, texto: e.target.value })}
          placeholder="Buscar por nombre, clase o calle"
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        />
      </div>

      <div>
        <label htmlFor="plataforma" className="gr-eyebrow mb-1.5">
          Ámbito
        </label>
        <select
          id="plataforma"
          value={filtros.plataforma ?? ''}
          onChange={(e) => onCambio({ ...filtros, plataforma: e.target.value || null })}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          <option value="">Todo el cantón (urbano y rural)</option>
          <option value={URBANO}>
            Riobamba urbano · las {plataformas.length} plataformas
          </option>
          {plataformas.map((p) => (
            <option key={p.clave} value={p.clave}>
              Plataforma {p.clave} · {p.areaHa.toFixed(0)} ha
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="barrio" className="gr-eyebrow mb-1.5">
          Barrio
          {filtros.plataforma && filtros.plataforma !== URBANO
            ? ` · los ${barrios.length} de la plataforma ${filtros.plataforma}`
            : ''}
        </label>
        <select
          id="barrio"
          value={filtros.barrio ?? ''}
          onChange={(e) => onCambio({ ...filtros, barrio: e.target.value || null })}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          <option value="">Todos los barrios</option>
          {barrios.map((b) => (
            <option key={b.nombre} value={b.nombre}>
              {b.nombre} · {b.areaHa.toFixed(0)} ha
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mapa-base" className="gr-eyebrow mb-1.5">
          Mapa base
        </label>
        <select
          id="mapa-base"
          value={mapaBase}
          onChange={(e) => onMapaBase(e.target.value)}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          {MAPAS_BASE.map((b) => (
            <option key={b.clave} value={b.clave}>
              {b.rotulo}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          {MAPAS_BASE.find((b) => b.clave === mapaBase)?.nota}
        </p>
      </div>

      <div>
        <label htmlFor="mapa-calor" className="gr-eyebrow mb-1.5">
          Mapa de calor
        </label>
        <select
          id="mapa-calor"
          value={mapaCalor}
          onChange={(e) => onMapaCalor(e.target.value as MapaCalor)}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          <option value="ninguno">Sin mapa de calor</option>
          <option value="registros">Densidad de registros (OSM)</option>
          <option value="pendientes">Densidad de lo que falta levantar</option>
          <option value="equipamientos">Densidad de equipamientos del GADM</option>
        </select>
        {mapaCalor !== 'ninguno' && (
          <>
            {/* La rampa lleva sus extremos rotulados: una mancha de color sin
                escala no dice cuanta densidad es mucha. */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                menos
              </span>
              <span
                aria-hidden
                className="h-2 flex-1 rounded-sm"
                style={{
                  background:
                    mapaCalor === 'pendientes'
                      ? 'linear-gradient(to right, rgba(255,241,214,.3), #fad68c, #f0a64a, #db6c2c, #b23a1e, #781c12)'
                      : 'linear-gradient(to right, rgba(220,233,244,.2), #b3cfe7, #7faed6, #4a88be, #1f5f94, #0a3860)',
                }}
              />
              <span className="text-[10px]" style={{ color: 'var(--gr-tinta-3)' }}>
                más
              </span>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Densidad de{' '}
              {mapaCalor === 'registros'
                ? 'lo registrado en OSM'
                : mapaCalor === 'pendientes'
                  ? 'los registros sin verificar o con la verificación vencida'
                  : 'los equipamientos del inventario'}
              , sobre lo que dejan ver los filtros. Cambia al filtrar por plataforma o barrio.
            </p>
          </>
        )}
      </div>

      <div>
        <p className="gr-eyebrow mb-1.5">Capas del mapa</p>
        <ul>
          {CAPAS.map((c) => {
            // Sin token la capa de Mapillary ni se crea: dejar la casilla
            // marcable solo haria creer que el mapa deberia mostrar algo.
            const inerte = c.clave === 'mapillary' && !hayTokenMapillary
            return (
              <li key={c.clave}>
                <label
                  className="flex items-center gap-2 py-0.5 text-[13px]"
                  style={{ color: 'var(--gr-tinta-2)', opacity: inerte ? 0.5 : 1 }}
                >
                  <input
                    type="checkbox"
                    checked={capas[c.clave] && !inerte}
                    disabled={inerte}
                    onChange={(e) => onCapas({ ...capas, [c.clave]: e.target.checked })}
                  />
                  {c.rotulo}
                  {inerte && <span className="gr-chip gr-chip--aviso">sin token</span>}
                </label>
              </li>
            )
          })}
        </ul>
        {!hayTokenMapillary && (
          <p className="gr-nota gr-nota--aviso mt-1.5">
            Para ver las fotos de calle hace falta un token de Mapillary en{' '}
            <span className="gr-num">.env.local</span>. Con el, apareceran los trayectos sobre el
            mapa y las miniaturas dentro de la ficha de cada punto.
          </p>
        )}
      </div>

      <div>
        {/* El ambito va en el rotulo: sin el, 222 y 30 se leen igual de total.
            Y dice «registrados» porque se leia al reves, como si fueran los
            que faltan: son los que YA estan en OpenStreetMap. */}
        <p className="gr-eyebrow mb-1.5">
          Registrados por categoria
          {filtros.plataforma === URBANO
            ? ' · Riobamba urbano'
            : filtros.plataforma
              ? ` · plataforma ${filtros.plataforma}`
              : ''}
          {filtros.barrio ? ` · ${filtros.barrio}` : ''}
        </p>
        <p className="mb-1.5 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Lo que ya existe en OpenStreetMap; suman el total en vista. Pulse una para filtrar.
        </p>
        <ul className="space-y-0.5">
          {CATEGORIAS.map((c) => {
            const activa = filtros.categorias.size === 0 || filtros.categorias.has(c.clave)
            const n = conteo.get(c.clave) ?? 0
            return (
              <li key={c.clave}>
                <button
                  type="button"
                  onClick={() => alternar(c.clave)}
                  aria-pressed={filtros.categorias.has(c.clave)}
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[13px] hover:bg-black/5"
                  style={{ opacity: activa ? 1 : 0.4 }}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: colorSerie(c.clave) }}
                  />
                  <span className="flex-1 truncate" style={{ color: 'var(--gr-tinta-2)' }}>
                    {c.rotulo}
                  </span>
                  <span className="gr-num text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
                    {numero(n)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {filtros.categorias.size > 0 && (
          <button
            type="button"
            className="mt-1 text-[12px] underline"
            style={{ color: 'var(--gr-info)' }}
            onClick={() => onCambio({ ...filtros, categorias: new Set() })}
          >
            Ver todas las capas
          </button>
        )}
      </div>

      {/* Segunda leyenda, y separada a proposito: el inventario del GADM usa
          otra taxonomia que OpenStreetMap. De las nueve categorias de OSM y los
          doce usos de aqui, solo Educacion y Salud significan lo mismo, asi que
          juntarlas en una lista invitaria a sumar lo que no se puede sumar. */}
      <div>
        <p className="gr-eyebrow mb-1.5">
          Equipamientos del GADM por uso
          {filtros.plataforma === URBANO
            ? ' · Riobamba urbano'
            : filtros.plataforma
              ? ` · plataforma ${filtros.plataforma}`
              : ''}
        </p>
        <p className="mb-1.5 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Inventario municipal, otra fuente distinta de la de arriba. Pulse uno para filtrar.
        </p>

        <label className="mb-1.5 block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Colorear los anillos por
          <select
            value={colorEquip}
            onChange={(e) => onColorEquip(e.target.value as 'cotejo' | 'uso')}
            className="mt-0.5 w-full rounded border px-2 py-1.5 text-[13px]"
            style={campo}
          >
            <option value="cotejo">Estado del cotejo con OSM</option>
            <option value="uso">Uso del equipamiento</option>
          </select>
        </label>

        <ul className="space-y-0.5">
          {usosEquip.map((u) => {
            const activo = filtros.usos.size === 0 || filtros.usos.has(u.tipo)
            return (
              <li key={u.tipo}>
                <button
                  type="button"
                  onClick={() => {
                    const usos = new Set(filtros.usos)
                    if (usos.has(u.tipo)) usos.delete(u.tipo)
                    else usos.add(u.tipo)
                    onCambio({ ...filtros, usos })
                  }}
                  aria-pressed={filtros.usos.has(u.tipo)}
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-[13px] hover:bg-black/5"
                  style={{ opacity: activo ? 1 : 0.4 }}
                >
                  {/* Anillo hueco, como en el mapa: la forma distingue la
                      fuente y el color, el uso. */}
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      border: `2px solid ${
                        colorEquip === 'uso' ? colorUso(u.tipo) : 'var(--gr-tinta-3)'
                      }`,
                    }}
                  />
                  <span className="flex-1 truncate" style={{ color: 'var(--gr-tinta-2)' }}>
                    {u.tipo}
                  </span>
                  <span className="gr-num text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
                    {numero(u.n)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {filtros.usos.size > 0 && (
          <button
            type="button"
            className="mt-1 text-[12px] underline"
            style={{ color: 'var(--gr-info)' }}
            onClick={() => onCambio({ ...filtros, usos: new Set() })}
          >
            Ver todos los usos
          </button>
        )}
      </div>

      <div>
        <p className="gr-eyebrow mb-1.5">Estado del dato</p>
        <label
          className="flex items-center gap-2 py-0.5 text-[13px]"
          style={{ color: 'var(--gr-tinta-2)' }}
        >
          <input
            type="checkbox"
            checked={filtros.frescura === 'pendientes'}
            onChange={(e) =>
              onCambio({ ...filtros, frescura: e.target.checked ? 'pendientes' : 'todas' })
            }
          />
          Solo pendientes de verificar en campo
        </label>
        <label
          className="flex items-center gap-2 py-0.5 text-[13px]"
          style={{ color: 'var(--gr-tinta-2)' }}
        >
          <input
            type="checkbox"
            checked={filtros.soloIncompletos}
            onChange={(e) => onCambio({ ...filtros, soloIncompletos: e.target.checked })}
          />
          Solo fichas con campos clave vacios
        </label>
      </div>

      <div>
        <p className="gr-eyebrow mb-1.5">Simbologia</p>
        <ul className="space-y-1 text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full border-2 border-white"
              style={{ background: 'var(--gr-s1)' }}
            />
            Punto OSM con borde blanco: verificado hace 12 meses o menos
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: 'var(--gr-s1)', border: '1px solid rgba(15,25,34,.45)' }}
            />
            Punto OSM con borde oscuro: pendiente de verificacion
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ border: '2.5px solid var(--gr-ok)' }}
            />
            Equipamiento del GADM confirmado en OSM
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ border: '2.5px solid var(--gr-aviso)' }}
            />
            Equipamiento con vecino cercano pero nombre distinto
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ border: '2.5px solid var(--gr-error)' }}
            />
            Equipamiento sin nada en OSM a 50 m
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 shrink-0" style={{ background: '#7f8c14' }} />
            Trayecto fotografico de Mapillary
          </li>
        </ul>
      </div>
    </div>
  )
}
