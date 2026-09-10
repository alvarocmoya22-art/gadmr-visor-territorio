import { useEffect, useMemo, useRef, useState } from 'react'
import Mapa, { type CapasVisibles } from './components/Mapa'
import PanelKpis from './components/PanelKpis'
import Filtros from './components/Filtros'
import TablaPuntos from './components/TablaPuntos'
import TablaPlataformas from './components/TablaPlataformas'
import Ficha from './components/Ficha'
import TiraFotos from './components/TiraFotos'
import FichaEquipamiento from './components/FichaEquipamiento'
import {
  aplicarFiltros,
  filtrarEquipamientos,
  FILTROS_INICIALES,
  useResumen,
  useTerritorio,
  type Filtros as FiltrosT,
} from './hooks/usePuntos'
import { aGeoJSON } from './lib/overpass'
import { avancePorPlataforma } from './lib/municipal'
import { VISTA_INICIAL } from './config/riobamba'
import { MAPA_BASE_INICIAL } from './config/mapasBase'
import { hayToken as hayTokenMapillary } from './lib/mapillary'
import { fecha, numero } from './lib/format'
import { useFotosCalle } from './hooks/useFotosCalle'
import type { Foto } from './lib/mapillary'

type Tema = 'claro' | 'oscuro' | 'sistema'

const CAPAS_INICIALES: CapasVisibles = {
  mapillary: hayTokenMapillary,
  plataformas: true,
  parroquias: false,
  barrios: false,
  equipamientos: true,
}

export default function App() {
  const {
    datos,
    puntos: todos,
    capas: capasMun,
    equipamientos,
    estado,
    error,
    errorCapas,
    recargar,
  } = useTerritorio()
  const [filtros, setFiltros] = useState<FiltrosT>(FILTROS_INICIALES)
  const [capas, setCapas] = useState<CapasVisibles>(CAPAS_INICIALES)
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [equipSeleccionadoId, setEquipSeleccionadoId] = useState<string | null>(null)
  const [fotoRespaldo, setFotoRespaldo] = useState<{ id: string; lon: number; lat: number } | null>(null)
  const [fotoActiva, setFotoActiva] = useState<Foto | null>(null)
  const [fotoDelMapa, setFotoDelMapa] = useState<{ id: string; lon: number; lat: number } | null>(
    null,
  )
  const [centro, setCentro] = useState<[number, number]>(VISTA_INICIAL.centro)
  const [mapaBase, setMapaBase] = useState(MAPA_BASE_INICIAL)
  const [tema, setTema] = useState<Tema>('sistema')
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') raiz.removeAttribute('data-theme')
    else raiz.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light')
  }, [tema])

  // Al abrir una ficha, el panel vuelve arriba: si no, queda cortada por el scroll.
  useEffect(() => {
    if (seleccionadoId || equipSeleccionadoId) panel.current?.scrollTo({ top: 0 })
  }, [seleccionadoId, equipSeleccionadoId])

  const filtrados = useMemo(() => aplicarFiltros(todos, filtros), [todos, filtros])
  const equipFiltrados = useMemo(
    () => filtrarEquipamientos(equipamientos, filtros),
    [equipamientos, filtros],
  )
  const resumen = useResumen(filtrados)
  /**
   * Ambito de la leyenda: todos los filtros MENOS el de categorias. Si tambien
   * se aplicara ese, elegir una categoria dejaria las demas en cero y la
   * leyenda dejaria de servir para saber que mas hay en el sector.
   */
  const ambito = useMemo(
    () => aplicarFiltros(todos, { ...filtros, categorias: new Set() }),
    [todos, filtros],
  )
  const resumenAmbito = useResumen(ambito)
  const seleccionado = useMemo(
    () => todos.find((p) => p.id === seleccionadoId) ?? null,
    [todos, seleccionadoId],
  )
  const equipSeleccionado = useMemo(
    () => equipamientos.find((e) => e.id === equipSeleccionadoId) ?? null,
    [equipamientos, equipSeleccionadoId],
  )
  const avance = useMemo(
    () => (capasMun ? avancePorPlataforma(capasMun.plataformas, todos, equipamientos) : []),
    [capasMun, todos, equipamientos],
  )
  /**
   * La vista de calle mira al punto elegido; si no hay ninguno, al centro del
   * mapa. Asi el panel derecho nunca se queda sin imagen.
   */
  const foco = fotoDelMapa
    ? { lon: fotoDelMapa.lon, lat: fotoDelMapa.lat, clave: `foto:${fotoDelMapa.id}` }
    : equipSeleccionado
      ? { lon: equipSeleccionado.lon, lat: equipSeleccionado.lat, clave: equipSeleccionado.id }
      : seleccionado
        ? { lon: seleccionado.lon, lat: seleccionado.lat, clave: seleccionado.id }
        : { lon: centro[0], lat: centro[1], clave: 'centro' }
  const fotosCalle = useFotosCalle(foco.lon, foco.lat, foco.clave, fotoRespaldo?.id ?? null)

  const porVerificar = useMemo(
    () => equipFiltrados.filter((e) => e.cotejo.estado !== 'confirmado'),
    [equipFiltrados],
  )

  /**
   * Elegir una plataforma enciende su capa: filtrar por un sector que no se ve
   * dibujado deja al usuario sin saber qué recorte está mirando.
   */
  const elegirPlataforma = (clave: string | null) => {
    setFiltros((f) => ({ ...f, plataforma: clave }))
    if (clave) setCapas((c) => (c.plataformas ? c : { ...c, plataformas: true }))
  }

  const cambiarFiltros = (f: FiltrosT) => {
    if (f.plataforma && f.plataforma !== filtros.plataforma) {
      setCapas((c) => (c.plataformas ? c : { ...c, plataformas: true }))
    }
    // Lo mismo con el barrio: filtrar por una zona que no se ve dibujada deja
    // sin saber que recorte se esta mirando.
    if (f.barrio && f.barrio !== filtros.barrio) {
      setCapas((c) => (c.barrios ? c : { ...c, barrios: true }))
    }
    setFiltros(f)
  }

  const elegirPunto = (id: string | null) => {
    setFotoDelMapa(null)
    setEquipSeleccionadoId(null)
    setSeleccionadoId(id)
  }
  const elegirEquipamiento = (id: string) => {
    setFotoDelMapa(null)
    setSeleccionadoId(null)
    setEquipSeleccionadoId(id)
  }

  const descargarGeoJSON = () => {
    const blob = new Blob([JSON.stringify(aGeoJSON(filtrados), null, 1)], {
      type: 'application/geo+json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `riobamba-levantamiento-${new Date().toISOString().slice(0, 10)}.geojson`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const campo = {
    background: 'var(--gr-superficie)',
    borderColor: 'var(--gr-linea-fuerte)',
    color: 'var(--gr-tinta)',
  }

  return (
    <div className="flex min-h-full flex-col lg:h-full" style={{ background: 'var(--gr-fondo)' }}>
      <a
        href="#tabla"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:p-2"
      >
        Saltar al listado de puntos
      </a>

      <header
        className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5"
        style={{ background: 'var(--gr-superficie)', borderColor: 'var(--gr-linea)' }}
      >
        <div className="mr-auto">
          <h1 className="text-[15px] font-bold" style={{ color: 'var(--gr-tinta)' }}>
            Visor de Territorio · GADM Riobamba
          </h1>
          <p className="gr-num text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            {datos
              ? `Base OSM al ${fecha(datos.selloOsm ?? undefined)} · descargado ${fecha(datos.obtenido)}${datos.desdeCache ? ' (cache local)' : ''}`
              : 'Consultando OpenStreetMap…'}
          </p>
        </div>

        <label
          className="flex items-center gap-1.5 text-[13px]"
          style={{ color: 'var(--gr-tinta-2)' }}
        >
          <span className="sr-only">Tema de la interfaz</span>
          <select
            value={tema}
            onChange={(e) => setTema(e.target.value as Tema)}
            className="rounded border px-1.5 py-1 text-[13px]"
            style={campo}
          >
            <option value="sistema">Tema del sistema</option>
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
          </select>
        </label>

        <button
          type="button"
          className="gr-btn gr-btn--secundario"
          onClick={descargarGeoJSON}
          disabled={!datos}
        >
          Descargar GeoJSON
        </button>
        <button type="button" className="gr-btn" onClick={recargar} disabled={estado === 'cargando'}>
          {estado === 'cargando' ? 'Consultando…' : 'Actualizar desde OSM'}
        </button>
      </header>

      <div className="px-4 pt-3">
        <PanelKpis
          resumen={resumen}
          totalCanton={todos.length}
          equipamientos={equipFiltrados.length}
          equipPorVerificar={porVerificar.length}
        />
      </div>

      {estado === 'error' && (
        <div className="px-4 pt-3">
          <p className="gr-nota gr-nota--alerta" role="alert">
            {error}
          </p>
        </div>
      )}

      {errorCapas && (
        <div className="px-4 pt-3">
          <p className="gr-nota gr-nota--alerta" role="alert">
            No se pudieron cargar las capas del GADM: {errorCapas}
          </p>
        </div>
      )}

      <main className="grid gap-3 p-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_380px]">
        <section
          className="h-[55vh] min-h-[320px] overflow-hidden rounded lg:h-auto"
          style={{ border: '1px solid var(--gr-linea-fuerte)' }}
        >
          <Mapa
            puntos={filtrados}
            equipamientos={equipFiltrados}
            capasMunicipales={capasMun}
            seleccionado={seleccionado}
            plataformaActiva={filtros.plataforma}
            barrioActivo={filtros.barrio}
            mapaBase={mapaBase}
            capas={capas}
            onSeleccionar={elegirPunto}
            onSeleccionarEquipamiento={elegirEquipamiento}
            onFotoCercana={setFotoRespaldo}
            onCentro={(lon, lat) => setCentro([lon, lat])}
            fotoMostrada={
              fotoActiva
                ? { lon: fotoActiva.lon, lat: fotoActiva.lat, rumbo: fotoActiva.rumbo }
                : fotoRespaldo
                  ? { lon: fotoRespaldo.lon, lat: fotoRespaldo.lat }
                  : null
            }
            // Pinchar una foto del mapa la abre en el panel, no en otra pestaña.
            onFotoMapillary={(id, lon, lat) => setFotoDelMapa({ id, lon, lat })}
          />
        </section>

        <aside ref={panel} className="space-y-3 lg:min-h-0 lg:overflow-auto" id="tabla">
          <div
            className="rounded p-3"
            style={{ background: 'var(--gr-superficie)', border: '1px solid var(--gr-linea)' }}
          >
            <TiraFotos
              {...fotosCalle}
              onFotoActiva={setFotoActiva}
              idPreferido={fotoDelMapa?.id ?? null}
            />
          </div>

          {equipSeleccionado ? (
            <FichaEquipamiento
              equipamiento={equipSeleccionado}
              onCerrar={() => setEquipSeleccionadoId(null)}
              onVerEnOsm={elegirPunto}
            />
          ) : seleccionado ? (
            <Ficha
              punto={seleccionado}
              onCerrar={() => setSeleccionadoId(null)}
            />
          ) : (
            <div
              className="rounded p-3"
              style={{ background: 'var(--gr-superficie)', border: '1px solid var(--gr-linea)' }}
            >
              <Filtros
                filtros={filtros}
                resumenAmbito={resumenAmbito}
                plataformas={capasMun?.plataformas ?? []}
                capas={capas}
                barrios={capasMun?.barriosLista ?? []}
                mapaBase={mapaBase}
                onMapaBase={setMapaBase}
                onCambio={cambiarFiltros}
                onCapas={setCapas}
              />
            </div>
          )}

          {avance.length > 0 && (
            <div>
              <p className="gr-eyebrow mb-1.5">Avance por plataforma</p>
              <TablaPlataformas
                avance={avance}
                activa={filtros.plataforma}
                onElegir={elegirPlataforma}
              />
            </div>
          )}

          {porVerificar.length > 0 && (
            <div>
              <p className="gr-eyebrow mb-1.5">
                Inventario del GADM por verificar · {numero(porVerificar.length)}
              </p>
              <ul
                className="max-h-[30vh] divide-y overflow-auto rounded"
                style={{ background: 'var(--gr-superficie)', borderColor: 'var(--gr-linea)' }}
              >
                {porVerificar.slice(0, 80).map((e) => (
                  <li key={e.id} style={{ borderColor: 'var(--gr-linea)' }}>
                    <button
                      type="button"
                      onClick={() => elegirEquipamiento(e.id)}
                      className="flex w-full items-start gap-2 px-2 py-1.5 text-left text-[13px] hover:bg-black/5"
                    >
                      <span
                        aria-hidden
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{
                          border: `2.5px solid ${
                            e.cotejo.estado === 'ausente'
                              ? 'var(--gr-error)'
                              : e.cotejo.estado === 'dudoso'
                                ? 'var(--gr-aviso)'
                                : 'var(--gr-tinta-3)'
                          }`,
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate" style={{ color: 'var(--gr-tinta)' }}>
                          {e.nombre || 'Sin nombre'}
                        </span>
                        <span
                          className="block truncate text-[11px]"
                          style={{ color: 'var(--gr-tinta-3)' }}
                        >
                          {e.tipo}
                          {e.plataforma ? ` · plataforma ${e.plataforma}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="gr-eyebrow mb-1.5">Cola de campo · {numero(filtrados.length)} puntos</p>
            <TablaPuntos
              puntos={filtrados}
              seleccionadoId={seleccionadoId}
              onSeleccionar={elegirPunto}
            />
          </div>
        </aside>
      </main>

      <footer
        className="border-t px-4 py-2 text-[11px]"
        style={{ borderColor: 'var(--gr-linea)', color: 'var(--gr-tinta-3)' }}
      >
        Datos de{' '}
        <a href="https://www.openstreetmap.org/copyright" style={{ color: 'var(--gr-info)' }}>
          OpenStreetMap
        </a>
        , bajo licencia ODbL · fotografias de{' '}
        <a href="https://www.mapillary.com" style={{ color: 'var(--gr-info)' }}>
          Mapillary
        </a>
        , CC BY-SA 4.0 · plataformas, parroquias, barrios y equipamientos: GADM Riobamba, uso
        interno · levantamiento en campo con Every Door.
      </footer>
    </div>
  )
}
