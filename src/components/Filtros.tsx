import { CATEGORIAS, colorSerie, type ClaveCategoria } from '../lib/categorias'
import { numero } from '../lib/format'
import type { Filtros as FiltrosT, Resumen } from '../hooks/usePuntos'
import type { CapasVisibles } from './Mapa'
import type { Barrio, Plataforma } from '../lib/municipal'
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
  onCambio: (f: FiltrosT) => void
  onCapas: (c: CapasVisibles) => void
}

const CAPAS: { clave: keyof CapasVisibles; rotulo: string }[] = [
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
          Plataforma asignada
        </label>
        <select
          id="plataforma"
          value={filtros.plataforma ?? ''}
          onChange={(e) => onCambio({ ...filtros, plataforma: e.target.value || null })}
          className="w-full rounded border px-2 py-1.5 text-sm"
          style={campo}
        >
          <option value="">Todo el cantón</option>
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
        {/* El ambito va en el rotulo: sin el, 222 y 30 se leen igual de total. */}
        <p className="gr-eyebrow mb-1.5">
          Capas tematicas{filtros.plataforma ? ` · plataforma ${filtros.plataforma}` : ''}
          {filtros.barrio ? ` · ${filtros.barrio}` : ''}
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
