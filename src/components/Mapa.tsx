import { useEffect, useRef, useState } from 'react'
import maplibregl, { type ExpressionSpecification, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { VISTA_INICIAL } from '../config/riobamba'
import { capaDe, MAPAS_BASE, MAPA_BASE_INICIAL } from '../config/mapasBase'
import { CATEGORIAS, paletaResuelta } from '../lib/categorias'
import { aGeoJSON, type Punto } from '../lib/overpass'
import { aGeoJSONEquipamientos, type CapasMunicipales, type EquipamientoMunicipal } from '../lib/municipal'
import { urlTeselas as urlTeselasMapillary } from '../lib/mapillary'
import { distanciaM } from '../lib/geo'

export interface CapasVisibles {
  mapillary: boolean
  plataformas: boolean
  parroquias: boolean
  barrios: boolean
  equipamientos: boolean
}

interface Props {
  puntos: Punto[]
  equipamientos: EquipamientoMunicipal[]
  capasMunicipales: CapasMunicipales | null
  seleccionado: Punto | null
  plataformaActiva: string | null
  capas: CapasVisibles
  onSeleccionar: (id: string | null) => void
  onSeleccionarEquipamiento: (id: string) => void
  onFotoMapillary: (id: string, lon: number, lat: number) => void
  /** Foto de Mapillary mas cercana, leida de las teselas (id y posicion). */
  onFotoCercana: (foto: { id: string; lon: number; lat: number } | null) => void
  /** Centro del mapa, para la vista de calle cuando no hay seleccion. */
  onCentro: (lon: number, lat: number) => void
  /** Foto que se muestra en el panel; se marca en el mapa. */
  fotoMostrada: { lon: number; lat: number; rumbo?: number } | null
  /** Clave del mapa base activo. */
  mapaBase: string
  /** Barrio filtrado, para resaltarlo y encuadrarlo. */
  barrioActivo: string | null
}

const VACIO: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

/** Color de la capa de fotografia de calle; en la leyenda va rotulada. */
const COLOR_MAPILLARY = '#7f8c14'

/**
 * Se construye uno nuevo por mapa a proposito: MapLibre consume el objeto de
 * estilo que recibe, asi que compartir una constante entre montajes deja al
 * segundo mapa sin estilo y su evento 'load' no llega a dispararse nunca.
 */
function crearEstiloBase(): StyleSpecification {
  return {
    version: 8,
    // MapLibre no dibuja texto sin glyphs. Se usan los del propio proyecto
    // MapLibre; si algun dia dejaran de servirse, las etiquetas de barrio
    // desaparecen pero el resto del mapa sigue igual.
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    // Los cuatro mapas base se declaran juntos y solo se alterna su
    // visibilidad: cambiar de estilo obligaria a rehacer todas las capas.
    sources: Object.fromEntries(
      MAPAS_BASE.map((b) => [
        capaDe(b.clave),
        {
          type: 'raster' as const,
          tiles: b.teselas,
          tileSize: 256,
          maxzoom: b.maxzoom,
          attribution: `${b.atribucion} · límites y equipamientos: GADM Riobamba`,
        },
      ]),
    ),
    layers: MAPAS_BASE.map((b) => ({
      id: capaDe(b.clave),
      type: 'raster' as const,
      source: capaDe(b.clave),
      layout: { visibility: b.clave === MAPA_BASE_INICIAL ? ('visible' as const) : ('none' as const) },
    })),
  }
}

function expresionColor(): ExpressionSpecification {
  const paleta = paletaResuelta()
  const pares = CATEGORIAS.flatMap((c) => [c.clave, paleta[c.clave]])
  return ['match', ['get', 'categoria'], ...pares, paleta.otros] as unknown as ExpressionSpecification
}

/** Los colores semánticos marcan estado, nunca categoría. */
function colorEstadoCotejo(): ExpressionSpecification {
  const raiz = getComputedStyle(document.documentElement)
  const leer = (v: string) => raiz.getPropertyValue(v).trim()
  return [
    'match',
    ['get', 'estado'],
    'confirmado', leer('--gr-ok'),
    'dudoso', leer('--gr-aviso'),
    'ausente', leer('--gr-error'),
    leer('--gr-tinta-3'),
  ] as unknown as ExpressionSpecification
}

/**
 * Relee los tokens del tema activo y los vuelve a pintar en el mapa.
 * MapLibre resuelve los colores una sola vez, así que sin esto un cambio de
 * tema dejaría el mapa con la paleta del tema anterior.
 */
function aplicarColoresTema(m: maplibregl.Map) {
  const raiz = getComputedStyle(document.documentElement)
  const leer = (v: string) => raiz.getPropertyValue(v).trim()
  const azul = leer('--gr-info')
  const tinta3 = leer('--gr-tinta-3')

  const pintar = (capa: string, prop: string, valor: unknown) => {
    if (m.getLayer(capa)) m.setPaintProperty(capa, prop, valor as never)
  }

  pintar('barrios-linea', 'line-color', leer('--gr-limite-barrio'))
  pintar('barrios-relleno', 'fill-color', leer('--gr-limite-barrio'))
  pintar('barrios-etiqueta', 'text-color', leer('--gr-limite-barrio'))
  pintar('parroquias-linea', 'line-color', tinta3)
  pintar('plataformas-relleno', 'fill-color', azul)
  pintar('plataformas-halo', 'line-color', leer('--gr-superficie'))
  pintar('plataformas-linea', 'line-color', azul)
  pintar('pois-halo', 'circle-stroke-color', azul)
  pintar('pois', 'circle-color', expresionColor())
  pintar('equipamientos', 'circle-stroke-color', colorEstadoCotejo())
}

/**
 * Foto de Mapillary mas cercana a un punto, leida de las teselas ya cargadas.
 * Devuelve null si no hay ninguna dentro de `maxM`.
 */
function fotoMasCercana(
  m: maplibregl.Map,
  lon: number,
  lat: number,
  maxM: number,
): { id: string; lon: number; lat: number } | null {
  if (!m.getSource('mapillary')) return null
  const rasgos = m.querySourceFeatures('mapillary', { sourceLayer: 'image' })
  let mejor: { id: string; lon: number; lat: number; d: number } | null = null
  for (const r of rasgos) {
    const g = r.geometry as GeoJSON.Point | undefined
    const id = r.properties?.id
    if (!g || g.type !== 'Point' || id === undefined) continue
    const d = distanciaM(lon, lat, g.coordinates[0], g.coordinates[1])
    if (!mejor || d < mejor.d)
      mejor = { id: String(id), lon: g.coordinates[0], lat: g.coordinates[1], d }
  }
  return mejor && mejor.d <= maxM ? { id: mejor.id, lon: mejor.lon, lat: mejor.lat } : null
}

export default function Mapa({
  puntos,
  equipamientos,
  capasMunicipales,
  seleccionado,
  plataformaActiva,
  capas,
  onSeleccionar,
  onSeleccionarEquipamiento,
  onFotoMapillary,
  onFotoCercana,
  onCentro,
  fotoMostrada,
  mapaBase,
  barrioActivo,
}: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<maplibregl.Map | null>(null)
  const [mapaListo, setMapaListo] = useState(false)
  const rotulos = useRef<maplibregl.Marker[]>([])
  const marcaFoto = useRef<maplibregl.Marker | null>(null)
  const cb = useRef({ onSeleccionar, onSeleccionarEquipamiento, onFotoMapillary, onFotoCercana, onCentro })
  cb.current = { onSeleccionar, onSeleccionarEquipamiento, onFotoMapillary, onFotoCercana, onCentro }

  /**
   * Ejecuta `fn` solo con el mapa ya cargado. `mapaListo` es estado, no ref, a
   * proposito: cuando pasa a true React vuelve a correr todos los efectos que
   * dependen de el, sin que haya que encolar nada ni arriesgar perder el aviso.
   */
  const cuandoListo = (fn: (m: maplibregl.Map) => void) => {
    const m = mapa.current
    if (!m || !mapaListo) return
    fn(m)
  }

  useEffect(() => {
    if (!contenedor.current || mapa.current) return

    const m = new maplibregl.Map({
      container: contenedor.current,
      style: crearEstiloBase(),
      center: VISTA_INICIAL.centro,
      zoom: VISTA_INICIAL.zoom,
      maxZoom: 19,
      attributionControl: { compact: true },
      locale: {
        'NavigationControl.ZoomIn': 'Acercar',
        'NavigationControl.ZoomOut': 'Alejar',
        'NavigationControl.ResetBearing': 'Restablecer el norte',
      },
    })
    mapa.current = m
    m.on('error', (e) => {
      console.error('[mapa]', e.error?.message ?? e)
    })
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    m.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left')

    m.on('load', () => {
      const raiz = getComputedStyle(document.documentElement)
      const azul = raiz.getPropertyValue('--gr-info').trim()
      const tinta3 = raiz.getPropertyValue('--gr-tinta-3').trim()
      const limiteBarrio = raiz.getPropertyValue('--gr-limite-barrio').trim()

      // ── Límites municipales, de más grande a más pequeño
      m.addSource('barrios', { type: 'geojson', data: VACIO })
      // Filete claro por debajo: el mapa base mezcla grises, amarillos y
      // rosados, y sobre esa mezcla una linea sola se pierde.
      m.addLayer({
        id: 'barrios-relleno',
        type: 'fill',
        source: 'barrios',
        filter: ['==', ['get', 'nombre'], ''],
        paint: { 'fill-color': limiteBarrio, 'fill-opacity': 0.16 },
      })
      m.addLayer({
        id: 'barrios-halo',
        type: 'line',
        source: 'barrios',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: {
          // Blanco fijo, no el color de superficie: el mapa base es claro
          // siempre, tambien cuando la interfaz esta en tema oscuro.
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 5],
          'line-opacity': 0.7,
        },
      })
      m.addLayer({
        id: 'barrios-linea',
        type: 'line',
        source: 'barrios',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: {
          'line-color': limiteBarrio,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.4, 16, 2.4],
          'line-opacity': 0.95,
        },
      })
      // Nombre de cada barrio. MapLibre reparte y descarta las que chocan, asi
      // que con 197 barrios el mapa no se satura: aparecen al acercarse.
      m.addLayer({
        id: 'barrios-etiqueta',
        type: 'symbol',
        source: 'barrios',
        minzoom: 13,
        layout: {
          visibility: 'none',
          'text-field': ['get', 'nombre'],
          // Una sola fuente: este servidor no sirve pilas combinadas (da 404).
          'text-font': ['Open Sans Semibold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 9, 17, 13],
          'text-max-width': 8,
          'text-padding': 4,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': limiteBarrio,
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      })

      m.addSource('parroquias', { type: 'geojson', data: VACIO })
      m.addLayer({
        id: 'parroquias-linea',
        type: 'line',
        source: 'parroquias',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: { 'line-color': tinta3, 'line-width': 1.6, 'line-dasharray': [3, 2] },
      })

      m.addSource('plataformas', { type: 'geojson', data: VACIO, promoteId: 'clave' })
      m.addLayer({
        id: 'plataformas-relleno',
        type: 'fill',
        source: 'plataformas',
        filter: ['==', ['get', 'clave'], ''],
        layout: { visibility: 'none' },
        paint: { 'fill-color': azul, 'fill-opacity': 0.16 },
      })
      // Filete claro por debajo: sin él, el azul se pierde sobre las calles
      // amarillas y los tejados rosados del mapa base.
      m.addLayer({
        id: 'plataformas-halo',
        type: 'line',
        source: 'plataformas',
        layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': raiz.getPropertyValue('--gr-superficie').trim(),
          'line-width': 6,
          'line-opacity': 0.7,
        },
      })
      m.addLayer({
        id: 'plataformas-linea',
        type: 'line',
        source: 'plataformas',
        layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': azul,
          'line-width': 2.6,
          'line-opacity': 0.95,
        },
      })

      // ── Mapillary: solo si hay token. Sus teselas lo exigen y sin el
      // devuelven 401, asi que ni siquiera se anade la fuente.
      const teselasMly = urlTeselasMapillary()
      if (teselasMly) {
        m.addSource('mapillary', {
          type: 'vector',
          tiles: [teselasMly],
          minzoom: 0,
          maxzoom: 14,
          attribution: '<a href="https://www.mapillary.com">Mapillary</a>',
        })
        m.addLayer({
          id: 'mly-secuencias',
          type: 'line',
          source: 'mapillary',
          'source-layer': 'sequence',
          layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
          paint: {
            'line-color': COLOR_MAPILLARY,
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 16, 3.5],
            'line-opacity': 0.7,
          },
        })
        m.addLayer({
          id: 'mly-fotos',
          type: 'circle',
          source: 'mapillary',
          'source-layer': 'image',
          minzoom: 14,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 2.5, 19, 5.5],
            'circle-color': COLOR_MAPILLARY,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      // ── Puntos OSM
      m.addSource('pois', { type: 'geojson', data: VACIO, promoteId: 'id' })
      m.addLayer({
        id: 'pois-halo',
        type: 'circle',
        source: 'pois',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 10, 18, 20],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 3,
          'circle-stroke-color': azul,
        },
      })
      m.addLayer({
        id: 'pois',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 14, 5, 18, 9],
          'circle-color': expresionColor(),
          'circle-opacity': 0.9,
          'circle-stroke-width': ['case', ['==', ['get', 'frescura'], 'vigente'], 2, 1],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'frescura'], 'vigente'],
            '#ffffff',
            'rgba(15,25,34,0.45)',
          ],
        },
      })

      // ── Inventario municipal: anillos huecos, para no confundirlos con OSM
      m.addSource('equipamientos', { type: 'geojson', data: VACIO, promoteId: 'id' })
      m.addLayer({
        id: 'equipamientos',
        type: 'circle',
        source: 'equipamientos',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 5, 14, 7, 18, 12],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': colorEstadoCotejo(),
        },
      })

      m.on('click', 'pois', (e) => {
        const f = e.features?.[0]
        if (f) cb.current.onSeleccionar(String(f.properties?.id ?? ''))
      })
      m.on('click', 'equipamientos', (e) => {
        const f = e.features?.[0]
        if (f) cb.current.onSeleccionarEquipamiento(String(f.properties?.id ?? ''))
      })
      m.on('click', 'mly-fotos', (e) => {
        const f = e.features?.[0]
        const c = (f?.geometry as GeoJSON.Point | undefined)?.coordinates
        if (c) cb.current.onFotoMapillary(String(f?.properties?.id ?? ''), c[0], c[1])
      })
      m.on('click', (e) => {
        const capasClicables = ['pois', 'equipamientos', 'mly-fotos'].filter((c) =>
          m.getLayer(c),
        )
        const hit = m.queryRenderedFeatures(e.point, { layers: capasClicables })
        if (hit.length === 0) cb.current.onSeleccionar(null)
      })
      for (const capa of ['pois', 'equipamientos', 'mly-fotos']) {
        if (!m.getLayer(capa)) continue
        m.on('mouseenter', capa, () => {
          m.getCanvas().style.cursor = 'pointer'
        })
        m.on('mouseleave', capa, () => {
          m.getCanvas().style.cursor = ''
        })
      }

      setMapaListo(true)
    })

    return () => {
      for (const r of rotulos.current) r.remove()
      rotulos.current = []
      marcaFoto.current?.remove()
      marcaFoto.current = null
      m.remove()
      mapa.current = null
      setMapaListo(false)
    }
  }, [])

  // Mapa base elegido
  useEffect(() => {
    cuandoListo((m) => {
      for (const b of MAPAS_BASE) {
        const capa = capaDe(b.clave)
        if (m.getLayer(capa)) {
          m.setLayoutProperty(capa, 'visibility', b.clave === mapaBase ? 'visible' : 'none')
        }
      }
    })
  }, [mapaBase, mapaListo])

  // Cambio de tema: el usuario puede elegirlo, o venir del sistema.
  useEffect(() => {
    const repintar = () => cuandoListo(aplicarColoresTema)
    const observador = new MutationObserver(repintar)
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    consulta.addEventListener('change', repintar)
    return () => {
      observador.disconnect()
      consulta.removeEventListener('change', repintar)
    }
  }, [mapaListo])

  // Puntos de OSM
  useEffect(() => {
    cuandoListo((m) => {
      ;(m.getSource('pois') as maplibregl.GeoJSONSource | undefined)?.setData(aGeoJSON(puntos))
    })
  }, [puntos, mapaListo])

  // Capas municipales y rótulos de plataforma
  useEffect(() => {
    if (!capasMunicipales) return
    cuandoListo((m) => {
      ;(m.getSource('plataformas') as maplibregl.GeoJSONSource | undefined)?.setData(
        capasMunicipales.plataformasGeo,
      )
      ;(m.getSource('parroquias') as maplibregl.GeoJSONSource | undefined)?.setData(
        capasMunicipales.parroquias,
      )
      ;(m.getSource('barrios') as maplibregl.GeoJSONSource | undefined)?.setData(
        capasMunicipales.barrios,
      )

      // Rótulo por plataforma como marcador HTML: evita depender de un
      // servidor de glyphs solo para 18 letras.
      for (const r of rotulos.current) r.remove()
      rotulos.current = capasMunicipales.plataformas.map((p) => {
        const el = document.createElement('div')
        el.className = 'gr-rotulo-plataforma'
        el.textContent = p.clave
        el.title = `${p.nombre} · ${p.areaHa.toFixed(1)} ha`
        return new maplibregl.Marker({ element: el }).setLngLat(p.rotulo).addTo(m)
      })
    })
  }, [capasMunicipales, mapaListo])

  // Inventario municipal (su color depende del cotejo, que cambia con OSM)
  useEffect(() => {
    cuandoListo((m) => {
      ;(m.getSource('equipamientos') as maplibregl.GeoJSONSource | undefined)?.setData(
        aGeoJSONEquipamientos(equipamientos),
      )
    })
  }, [equipamientos, mapaListo])

  // Visibilidad de capas
  useEffect(() => {
    cuandoListo((m) => {
      const poner = (capa: string, visible: boolean) => {
        if (m.getLayer(capa)) m.setLayoutProperty(capa, 'visibility', visible ? 'visible' : 'none')
      }
      poner('mly-secuencias', capas.mapillary)
      poner('mly-fotos', capas.mapillary)
      poner('plataformas-relleno', capas.plataformas)
      poner('plataformas-halo', capas.plataformas)
      poner('plataformas-linea', capas.plataformas)
      poner('parroquias-linea', capas.parroquias)
      poner('barrios-relleno', capas.barrios)
      poner('barrios-halo', capas.barrios)
      poner('barrios-linea', capas.barrios)
      poner('barrios-etiqueta', capas.barrios)
      poner('equipamientos', capas.equipamientos)
      for (const r of rotulos.current) {
        r.getElement().style.display = capas.plataformas ? '' : 'none'
      }
    })
  }, [capas, mapaListo])

  /**
   * Plataforma activa: se rellena, se engruesa su contorno, las demás se
   * atenúan y el mapa se encuadra en ella. Sin el contraste entre activa y
   * resto, filtrar por plataforma no se distingue de no filtrar.
   */
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('plataformas-relleno')) return
      const activa = plataformaActiva ?? ''
      const esActiva = ['==', ['get', 'clave'], activa]

      m.setFilter('plataformas-relleno', esActiva as never)
      m.setPaintProperty('plataformas-linea', 'line-width', (
        activa ? ['case', esActiva, 5, 1.6] : 2.6
      ) as never)
      m.setPaintProperty('plataformas-linea', 'line-opacity', (
        activa ? ['case', esActiva, 1, 0.35] : 0.95
      ) as never)
      m.setPaintProperty('plataformas-halo', 'line-width', (
        activa ? ['case', esActiva, 9, 4] : 6
      ) as never)
      m.setPaintProperty('plataformas-halo', 'line-opacity', (
        activa ? ['case', esActiva, 0.85, 0.25] : 0.7
      ) as never)

      // El rótulo de la plataforma elegida también se destaca.
      for (const r of rotulos.current) {
        const el = r.getElement()
        const suya = el.textContent === activa
        el.classList.toggle('gr-rotulo-plataforma--activa', !!activa && suya)
        el.style.opacity = activa && !suya ? '0.4' : '1'
      }

      const p = capasMunicipales?.plataformas.find((x) => x.clave === plataformaActiva)
      if (p) {
        m.fitBounds([p.caja[0], p.caja[1], p.caja[2], p.caja[3]], {
          padding: 40,
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
        })
      }
    })
  }, [plataformaActiva, capasMunicipales, mapaListo])

  /**
   * Barrio filtrado: se rellena y el mapa se encuadra en el. El relleno solo
   * aparece si la capa de barrios esta encendida, para no dibujar una mancha
   * suelta sin su contorno.
   */
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('barrios-relleno')) return
      m.setFilter('barrios-relleno', ['==', ['get', 'nombre'], barrioActivo ?? ''])
      const b = capasMunicipales?.barriosLista.find((x) => x.nombre === barrioActivo)
      if (b) {
        m.fitBounds([b.caja[0], b.caja[1], b.caja[2], b.caja[3]], {
          padding: 50,
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
        })
      }
    })
  }, [barrioActivo, capasMunicipales, mapaListo])

  /**
   * Marca en el mapa de donde sale la foto que se ve en el panel, y hacia
   * donde apunta la camara. Sin esto, la imagen no dice a que sitio pertenece.
   */
  useEffect(() => {
    const m = mapa.current
    if (!m || !mapaListo) return
    if (!fotoMostrada) {
      marcaFoto.current?.remove()
      marcaFoto.current = null
      return
    }
    if (!marcaFoto.current) {
      const el = document.createElement('div')
      el.className = 'gr-marca-foto'
      el.innerHTML = '<span class="gr-marca-foto__cono"></span><span class="gr-marca-foto__punto"></span>'
      el.title = 'Aqui se tomo la foto que se ve en el panel'
      // La posicion va antes de addTo: MapLibre la lee al montar el marcador.
      marcaFoto.current = new maplibregl.Marker({ element: el })
        .setLngLat([fotoMostrada.lon, fotoMostrada.lat])
        .addTo(m)
    } else {
      marcaFoto.current.setLngLat([fotoMostrada.lon, fotoMostrada.lat])
    }
    const cono = marcaFoto.current.getElement().querySelector<HTMLElement>('.gr-marca-foto__cono')
    if (cono) {
      // El cono solo se dibuja si se conoce el rumbo de la camara.
      cono.style.display = fotoMostrada.rumbo === undefined ? 'none' : ''
      cono.style.transform = `rotate(${fotoMostrada.rumbo ?? 0}deg)`
    }
  }, [fotoMostrada, mapaListo])

  /**
   * Sin punto elegido, la vista de calle del panel sigue al centro del mapa:
   * asi siempre hay algo que mirar, sin tener que seleccionar nada primero.
   */
  useEffect(() => {
    const m = mapa.current
    if (!m || !mapaListo || seleccionado) return
    const actualizar = () => {
      const c = m.getCenter()
      cb.current.onCentro(c.lng, c.lat)
      cb.current.onFotoCercana(fotoMasCercana(m, c.lng, c.lat, 150))
    }
    m.on('moveend', actualizar)
    m.on('idle', actualizar)
    actualizar()
    return () => {
      m.off('moveend', actualizar)
      m.off('idle', actualizar)
    }
  }, [seleccionado, mapaListo])

  // Selección
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('pois-halo')) return
      m.setFilter('pois-halo', ['==', ['get', 'id'], seleccionado?.id ?? ''])
      if (!seleccionado) return
      m.easeTo({
        center: [seleccionado.lon, seleccionado.lat],
        zoom: Math.max(m.getZoom(), 17),
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600,
      })
      // Las teselas traen el id de cada foto, y funcionan aunque la Graph API
      // no devuelva nada: de ahi sale la imagen que abre el visor del panel.
      m.once('idle', () => {
        cb.current.onFotoCercana(fotoMasCercana(m, seleccionado.lon, seleccionado.lat, 80))
      })
    })
  }, [seleccionado, mapaListo])

  return (
    <div
      ref={contenedor}
      className="h-full w-full"
      role="application"
      aria-label="Mapa del canton Riobamba con los puntos levantados. La tabla lateral contiene los mismos datos en forma navegable por teclado."
    />
  )
}
