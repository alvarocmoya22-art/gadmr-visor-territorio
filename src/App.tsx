import { useEffect, useMemo, useRef, useState } from 'react'
import Mapa, { type CapasVisibles, type MapaCalor } from './components/Mapa'
import PanelKpis from './components/PanelKpis'
import Filtros from './components/Filtros'
import Pestanas, { type Pestana } from './components/Pestanas'
import BuscadorCalles from './components/BuscadorCalles'
import TablaPuntos from './components/TablaPuntos'
import TablaPlataformas from './components/TablaPlataformas'
import Ficha from './components/Ficha'
import TiraFotos from './components/TiraFotos'
import FichaEquipamiento from './components/FichaEquipamiento'
import PanelAnalisis, {
  ANALISIS_INICIAL,
  type EstadoAnalisis,
} from './components/PanelAnalisis'
import {
  aplicarFiltros,
  filtrarEquipamientos,
  FILTROS_INICIALES,
  useResumen,
  useTerritorio,
  type Filtros as FiltrosT,
} from './hooks/usePuntos'
import { descargarCsv, descargarGeoJSON, descargarShapefile } from './lib/exportar'
import { barriosDe, calcularDeficit, cruzar, hallazgosACsv, sinInventariar } from './lib/analisis'
import { avancePorPlataforma, URBANO } from './lib/municipal'
import { VISTA_INICIAL } from './config/riobamba'
import { MAPA_BASE_INICIAL } from './config/mapasBase'
import { hayToken as hayTokenMapillary } from './lib/mapillary'
import { fecha, numero } from './lib/format'
import { useFotosCalle } from './hooks/useFotosCalle'
import type { Foto } from './lib/mapillary'
import type { Calle } from './lib/calles'

type Tema = 'claro' | 'oscuro' | 'sistema'

/** Secciones del panel lateral. */
type ClavePestana = 'filtros' | 'analisis' | 'datos' | 'calle'

const CAPAS_INICIALES: CapasVisibles = {
  osm: true,
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
  const [calleElegida, setCalleElegida] = useState<Calle | null>(null)
  const [mapaBase, setMapaBase] = useState(MAPA_BASE_INICIAL)
  const [mapaCalor, setMapaCalor] = useState<MapaCalor>('ninguno')
  const [analisis, setAnalisis] = useState<EstadoAnalisis>(ANALISIS_INICIAL)
  const [tema, setTema] = useState<Tema>('sistema')
  const [pestana, setPestana] = useState<ClavePestana>('filtros')
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') raiz.removeAttribute('data-theme')
    else raiz.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light')
  }, [tema])

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

  /*
   * El analisis mide cobertura, y la cobertura no se detiene en el limite del
   * barrio: quien vive en uno usa el centro de salud del de al lado. Por eso
   * estos dos ambitos ignoran el filtro de barrio y se quedan en la
   * plataforma, mientras que el cruce si respeta el barrio elegido.
   */
  const ambitoPlataforma = useMemo(
    () => aplicarFiltros(todos, { ...filtros, categorias: new Set(), barrio: null }),
    [todos, filtros],
  )
  const equipAmbito = useMemo(
    () => filtrarEquipamientos(equipamientos, { ...filtros, barrio: null }),
    [equipamientos, filtros],
  )

  /**
   * Los barrios del ambito. Alimenta tanto el selector como el analisis: si el
   * filtro ofrece unos barrios y la coropleta pinta otros, el mapa y el panel
   * dejan de hablar del mismo territorio.
   */
  const barriosAmbito = useMemo(
    () => barriosDe(capasMun?.barriosLista ?? [], filtros.plataforma),
    [capasMun, filtros.plataforma],
  )

  // Solo se calcula con la capa encendida: no hay por que recorrer los barrios
  // mientras nadie la mire.
  const deficit = useMemo(
    () =>
      analisis.deficit && capasMun
        ? calcularDeficit(barriosAmbito, equipAmbito, ambitoPlataforma)
        : null,
    [analisis.deficit, capasMun, barriosAmbito, equipAmbito, ambitoPlataforma],
  )

  const cruce = useMemo(
    () => (analisis.cruce ? cruzar(ambito, analisis.a, analisis.b, analisis.umbral) : null),
    [analisis.cruce, analisis.a, analisis.b, analisis.umbral, ambito],
  )

  const hallazgos = useMemo(
    () => sinInventariar(ambito, equipAmbito, analisis.hallazgos),
    [ambito, equipAmbito, analisis.hallazgos],
  )

  /**
   * Como se llama y que es el territorio en vista. El titulo va sobre los KPI
   * y el detalle lo situa: sin la superficie, «Plataforma D» no dice si son
   * doscientas hectareas o dos mil.
   */
  const plataformaSel = capasMun?.plataformas.find((p) => p.clave === filtros.plataforma) ?? null
  const barrioSel = barriosAmbito.find((b) => b.nombre === filtros.barrio) ?? null

  const zonaTitulo =
    filtros.plataforma === URBANO
      ? 'Riobamba urbano'
      : plataformaSel
        ? `Plataforma ${plataformaSel.clave}`
        : 'Todo el cantón'
  const ambitoTitulo = barrioSel ? `${zonaTitulo} · ${barrioSel.nombre}` : zonaTitulo

  const ha = (n: number) => `${numero(Math.round(n))} ha`
  const ambitoDetalle = barrioSel
    ? // La plataforma solo se nombra si el titulo no la lleva ya delante.
      plataformaSel
      ? ha(barrioSel.areaHa)
      : `${ha(barrioSel.areaHa)} · ${
          barrioSel.plataforma ? `plataforma ${barrioSel.plataforma}` : 'fuera de plataforma'
        }`
    : plataformaSel
      ? `${ha(plataformaSel.areaHa)} · ${numero(barriosAmbito.length)} barrios`
      : filtros.plataforma === URBANO
        ? `${numero(capasMun?.plataformas.length ?? 0)} plataformas · ${numero(barriosAmbito.length)} barrios`
        : `urbano y rural · ${numero(barriosAmbito.length)} barrios`

  const ambitoRotulo = (() => {
    const zona =
      filtros.plataforma === URBANO
        ? 'Riobamba urbano'
        : filtros.plataforma
          ? `plataforma ${filtros.plataforma}`
          : null
    if (zona) return filtros.barrio ? `${zona} · ${filtros.barrio}` : zona
    return filtros.barrio ?? 'todo el cantón'
  })()

  const descargarHallazgos = () =>
    descargarCsv(
      hallazgosACsv(hallazgos),
      `riobamba-sin-inventariar-${analisis.hallazgos}-${new Date().toISOString().slice(0, 10)}.csv`,
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
    if (f.plataforma !== filtros.plataforma) {
      if (f.plataforma) setCapas((c) => (c.plataformas ? c : { ...c, plataformas: true }))
      // Al cambiar de ambito, un barrio de la plataforma anterior dejaria la
      // vista vacia sin decir por que. Se suelta salvo que siga perteneciendo.
      const suyos = barriosDe(capasMun?.barriosLista ?? [], f.plataforma)
      if (f.barrio && !suyos.some((b) => b.nombre === f.barrio)) f = { ...f, barrio: null }
    }
    // Lo mismo con el barrio: filtrar por una zona que no se ve dibujada deja
    // sin saber que recorte se esta mirando.
    if (f.barrio && f.barrio !== filtros.barrio) {
      setCapas((c) => (c.barrios ? c : { ...c, barrios: true }))
    }
    setFiltros(f)
  }

  const elegirBarrio = (nombre: string) => cambiarFiltros({ ...filtros, barrio: nombre })

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

  const [exportando, setExportando] = useState(false)
  const [errorExportar, setErrorExportar] = useState<string | null>(null)

  // El shapefile se arma en el navegador y con miles de puntos tarda un poco,
  // asi que el boton avisa mientras trabaja en vez de parecer que no responde.
  const exportarShapefile = async () => {
    setExportando(true)
    setErrorExportar(null)
    try {
      await descargarShapefile(filtrados)
    } catch (e) {
      setErrorExportar(e instanceof Error ? e.message : String(e))
    } finally {
      setExportando(false)
    }
  }

  const pestanas: Pestana<ClavePestana>[] = [
    { clave: 'filtros', rotulo: 'Filtros', nota: 'Buscador, ámbito, capas y leyenda' },
    {
      clave: 'analisis',
      rotulo: 'Análisis',
      nota: 'Déficit por barrio, cruce de categorías y lo no inventariado',
    },
    {
      clave: 'datos',
      rotulo: 'Datos',
      cuenta: filtrados.length,
      nota: 'Avance por plataforma, inventario por verificar y cola de campo',
    },
    { clave: 'calle', rotulo: 'Calle', nota: 'Fotografía de calle de Mapillary' },
  ]

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
        Saltar al panel lateral
      </a>

      <header
        className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5"
        style={{ background: 'var(--gr-superficie)', borderColor: 'var(--gr-linea)' }}
      >
        {/* El escudo del canton, recortado del logotipo institucional. */}
        <img
          src={`${import.meta.env.BASE_URL}escudo.png`}
          alt=""
          width={32}
          height={32}
          className="shrink-0 rounded"
        />
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

        <span className="flex items-center gap-1.5">
          <span className="text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Descargar
          </span>
          <button
            type="button"
            className="gr-btn gr-btn--secundario"
            onClick={() => descargarGeoJSON(filtrados)}
            disabled={!datos || filtrados.length === 0}
            title="Lo que se ve ahora, en GeoJSON"
          >
            GeoJSON
          </button>
          <button
            type="button"
            className="gr-btn gr-btn--secundario"
            onClick={exportarShapefile}
            disabled={!datos || filtrados.length === 0 || exportando}
            title="Lo que se ve ahora, como shapefile comprimido"
          >
            {exportando ? 'Armando…' : 'Shapefile'}
          </button>
        </span>
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
          ambito={ambitoTitulo}
          ambitoDetalle={ambitoDetalle}
          // Se vuelve al ambito de partida, no a todo el canton: el visor abre
          // en el urbano y ahi es donde se espera regresar.
          onQuitarFiltro={
            filtros.plataforma === URBANO && !filtros.barrio
              ? null
              : () => cambiarFiltros({ ...filtros, plataforma: URBANO, barrio: null })
          }
        />
      </div>

      {estado === 'error' && (
        <div className="px-4 pt-3">
          <p className="gr-nota gr-nota--alerta" role="alert">
            {error}
          </p>
        </div>
      )}

      {/* Si la base que respondio viene atrasada, las cifras no son las de hoy
          y hay que decirlo: si no, el mismo tablero da numeros distintos segun
          que espejo conteste y nadie sabe por que. */}
      {datos && (datos.diasDeRetraso ?? 0) > 3 && (
        <div className="px-4 pt-3">
          <p className="gr-nota gr-nota--aviso">
            Los datos vienen de una copia de OpenStreetMap con{' '}
            <b>{numero(datos.diasDeRetraso ?? 0)} días de retraso</b> (base al{' '}
            {fecha(datos.selloOsm ?? undefined)}). Ningún espejo respondió con la base al día, así
            que se usó el menos atrasado. Lo levantado en campo estos días puede no aparecer
            todavía: pulse «Actualizar desde OSM» más tarde.
          </p>
        </div>
      )}

      {errorExportar && (
        <div className="px-4 pt-3">
          <p className="gr-nota gr-nota--alerta" role="alert">
            No se pudo generar el shapefile: {errorExportar}
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
          className="relative h-[60vh] min-h-[340px] overflow-hidden rounded lg:h-auto"
          style={{ border: '1px solid var(--gr-linea-fuerte)' }}
        >
          <Mapa
            puntos={filtrados}
            equipamientos={equipFiltrados}
            capasMunicipales={capasMun}
            seleccionado={seleccionado}
            plataformaActiva={filtros.plataforma}
            barrioActivo={filtros.barrio}
            calleElegida={calleElegida}
            mapaBase={mapaBase}
            mapaCalor={mapaCalor}
            deficit={deficit?.geo ?? null}
            cruce={
              cruce ? { a: cruce.a, b: cruce.b, desatendidos: cruce.desatendidos } : null
            }
            onElegirBarrio={elegirBarrio}
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

          {/* La ficha flota sobre el mapa en vez de ocupar el panel: asi se
              puede mirar un punto sin perder de vista los filtros ni el
              analisis, que es justo lo que se estaba haciendo antes. */}
          {(equipSeleccionado || seleccionado) && (
            <div className="absolute left-3 top-3 z-10 max-h-[calc(100%-1.5rem)] w-[330px] max-w-[calc(100%-1.5rem)] overflow-auto rounded shadow-lg">
              {equipSeleccionado ? (
                <FichaEquipamiento
                  equipamiento={equipSeleccionado}
                  onCerrar={() => setEquipSeleccionadoId(null)}
                  onVerEnOsm={elegirPunto}
                />
              ) : (
                seleccionado && (
                  <Ficha punto={seleccionado} onCerrar={() => setSeleccionadoId(null)} />
                )
              )}
            </div>
          )}
        </section>

        <aside
          className="flex flex-col overflow-hidden rounded lg:min-h-0"
          id="tabla"
          style={{ background: 'var(--gr-superficie)', border: '1px solid var(--gr-linea)' }}
        >
          <Pestanas pestanas={pestanas} activa={pestana} onCambiar={setPestana} />
          <div ref={panel} className="flex-1 space-y-3 overflow-auto p-3">
            {pestana === 'filtros' && (
              <>
                <BuscadorCalles
                  elegida={calleElegida}
                  onElegir={setCalleElegida}
                  onIrAPlataforma={elegirPlataforma}
                />
                <Filtros
                  filtros={filtros}
                  resumenAmbito={resumenAmbito}
                  plataformas={capasMun?.plataformas ?? []}
                  capas={capas}
                  barrios={barriosAmbito}
                  mapaBase={mapaBase}
                  onMapaBase={setMapaBase}
                  mapaCalor={mapaCalor}
                  onMapaCalor={setMapaCalor}
                  onCambio={cambiarFiltros}
                  onCapas={setCapas}
                />
              </>
            )}

            {pestana === 'analisis' && (
              <PanelAnalisis
                analisis={analisis}
                onAnalisis={setAnalisis}
                deficit={deficit}
                cruce={cruce}
                hallazgos={hallazgos}
                ambito={ambitoRotulo}
                onElegirBarrio={elegirBarrio}
                onElegirPunto={elegirPunto}
                onDescargarHallazgos={descargarHallazgos}
              />
            )}

            {pestana === 'calle' && (
              <TiraFotos
                {...fotosCalle}
                onFotoActiva={setFotoActiva}
                idPreferido={fotoDelMapa?.id ?? null}
              />
            )}

            {pestana === 'datos' && (
              <>
          {avance.length > 0 && (
            <div>
              <p className="gr-eyebrow mb-1.5">Registros por plataforma</p>
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
                  {/* Dice cuantos faltan sobre el total: «57 puntos» a secas se
                      leia como si la cola fuera todo lo que hay en el sector. */}
                  <p className="gr-eyebrow mb-1.5">
                    Cola de campo · {numero(resumen.pendientes)} pendientes de{' '}
                    {numero(filtrados.length)} registros
                  </p>
                  <TablaPuntos
                    puntos={filtrados}
                    seleccionadoId={seleccionadoId}
                    onSeleccionar={elegirPunto}
                  />
                </div>
              </>
            )}
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
