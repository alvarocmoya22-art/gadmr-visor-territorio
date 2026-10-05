import { useEffect, useMemo, useRef, useState } from 'react'
import Mapa, { type CapasVisibles, type MapaCalor } from './components/Mapa'
import PanelKpis, { type Tarjeta } from './components/PanelKpis'
import CabeceraAmbito from './components/CabeceraAmbito'
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
import PanelEspacial, {
  ESPACIAL_INICIAL,
  type EstadoEspacial,
  type ResumenFlujos,
} from './components/PanelEspacial'
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
import { distanciaM } from './lib/geo'
import { calcularCobertura, elementosDe, serviciosDe, tiposDisponibles } from './lib/cobertura'
import { claveNivel, nivelDe, nivelInicial } from './lib/norma'
/*
 * Solo los tipos: `import type` no deja nada en el paquete, asi que el modulo
 * de isocronas y los dos megas de la red siguen cargandose con `import()` solo
 * cuando alguien abre el escenario.
 */
import type { Isocrona, Red } from './lib/isocronas'
import type { Campo } from './lib/isocronaSuperficie'
import { avancePorPlataforma, URBANO } from './lib/municipal'
import { VISTA_INICIAL } from './config/riobamba'
import { MAPA_BASE_INICIAL } from './config/mapasBase'
import { hayToken as hayTokenMapillary } from './lib/mapillary'
import { fecha, numero, porcentaje } from './lib/format'
import { useFotosCalle } from './hooks/useFotosCalle'
import { recargarDeVerdad, useVersionNueva } from './hooks/useVersion'
import type { Foto } from './lib/mapillary'
import type { Calle } from './lib/calles'

type Tema = 'claro' | 'oscuro' | 'sistema'

/** Secciones del panel lateral. */
type ClavePestana = 'filtros' | 'analisis' | 'espacial' | 'datos' | 'calle'

const CAPAS_INICIALES: CapasVisibles = {
  osm: true,
  mapillary: hayTokenMapillary,
  plataformas: true,
  parroquias: false,
  barrios: false,
  equipamientos: true,
  // Apagada al entrar: son dos megas que solo se descargan si se enciende.
  edificios: false,
  proyectos: false,
  // Catorce megas: igual que la edificacion, solo si se pide.
  catastro: false,
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
  const [colorEquip, setColorEquip] = useState<'cotejo' | 'uso'>('cotejo')
  const [analisis, setAnalisis] = useState<EstadoAnalisis>(ANALISIS_INICIAL)
  const [espacial, setEspacial] = useState<EstadoEspacial>(ESPACIAL_INICIAL)
  const [tema, setTema] = useState<Tema>('sistema')
  const [pestana, setPestana] = useState<ClavePestana>('filtros')
  const hayVersionNueva = useVersionNueva()
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

  /*
   * Los equipamientos de todo el urbano, al margen de la plataforma o el barrio
   * elegidos. No es lo mismo que `equipAmbito` y la diferencia importa: la
   * escuela que esta cien metros fuera del limite de la plataforma sigue
   * sirviendo a quien vive dentro. Las isocronas salen de aqui y se recortan
   * despues al ambito; medir solo con los de dentro inventaria vacios de
   * cobertura que en la calle no existen.
   */
  const equipUrbano = useMemo(
    () =>
      filtrarEquipamientos(equipamientos, {
        ...filtros,
        barrio: null,
        // Si el ambito es todo el canton se queda como esta; si es una
        // plataforma concreta, se abre al urbano entero.
        plataforma: filtros.plataforma ? URBANO : null,
      }),
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

  /**
   * Los puntos que prestan el servicio elegido. Los comparten la capa de
   * distancia y la de cobertura: si cada una eligiera por su cuenta, el mapa
   * podria decir a la vez que un barrio esta lejos y que esta cubierto.
   *
   * En la capa de distancia no hay nivel, asi que cuentan todos los del tipo;
   * en cobertura, el nivel puede acotarlos ademas por subtipo.
   */
  const nivelActivo = useMemo(
    () => nivelDe(analisis.tipo, analisis.nivel) ?? nivelInicial(analisis.tipo),
    [analisis.tipo, analisis.nivel],
  )

  const servicios = useMemo(
    () =>
      serviciosDe(
        {
          tipo: analisis.tipo,
          elemento: analisis.elemento,
          nivel: analisis.activo === 'cobertura' ? nivelActivo : null,
          fuente: analisis.fuente,
          gestion: analisis.gestion,
        },
        equipAmbito,
        ambitoPlataforma,
      ),
    [
      analisis.tipo,
      analisis.elemento,
      analisis.activo,
      analisis.fuente,
      analisis.gestion,
      nivelActivo,
      equipAmbito,
      ambitoPlataforma,
    ],
  )

  // Solo se calcula con la capa encendida: no hay por que recorrer los barrios
  // mientras nadie la mire.
  const deficit = useMemo(
    () =>
      analisis.activo === 'distancia' && capasMun
        ? calcularDeficit(barriosAmbito, servicios.servicios, ambitoPlataforma)
        : null,
    [analisis.activo, capasMun, barriosAmbito, servicios, ambitoPlataforma],
  )

  /**
   * Cobertura por radio de servicio. Los tipos salen del inventario completo,
   * no del ambito: si en la plataforma elegida no hay ningun centro de salud,
   * el tipo tiene que seguir en la lista para poder ver justo eso.
   */
  const tipos = useMemo(() => tiposDisponibles(equipamientos), [equipamientos])

  /**
   * Los usos del inventario en el ambito, para la leyenda de equipamientos.
   * Se calculan sin el filtro de usos, igual que la leyenda de categorias: si
   * no, elegir uno dejaria los demas en cero y la lista dejaria de servir para
   * saber que mas hay en el sector.
   */
  const usosEquip = useMemo(
    () => tiposDisponibles(filtrarEquipamientos(equipamientos, { ...filtros, usos: new Set() })),
    [equipamientos, filtros],
  )

  /** Las actividades del uso elegido, para el segundo nivel del selector. */
  const elementos = useMemo(
    () => elementosDe(equipamientos, analisis.tipo),
    [equipamientos, analisis.tipo],
  )

  const cobertura = useMemo(() => {
    if (analisis.activo !== 'cobertura' || !capasMun) return null
    const nivel = nivelActivo
    // Sin nivel con radio no hay nada que medir: la ordenanza no se lo fija.
    if (!nivel || nivel.radio === null) return null
    return calcularCobertura(barriosAmbito, equipAmbito, ambitoPlataforma, {
      tipo: analisis.tipo,
      elemento: analisis.elemento,
      nivel: nivel as typeof nivel & { radio: number },
      fuente: analisis.fuente,
      gestion: analisis.gestion,
    })
  }, [
      analisis.activo,
      analisis.tipo,
      analisis.elemento,
      nivelActivo,
      analisis.fuente,
      analisis.gestion,
      capasMun,
      barriosAmbito,
      equipAmbito,
      ambitoPlataforma,
  ])

  const cruce = useMemo(
    () =>
      analisis.activo === 'cruce' ? cruzar(ambito, analisis.a, analisis.b, analisis.umbral) : null,
    [analisis.activo, analisis.a, analisis.b, analisis.umbral, ambito],
  )

  const hallazgos = useMemo(
    () =>
      analisis.activo === 'inventario'
        ? sinInventariar(ambito, equipAmbito, analisis.hallazgos)
        : [],
    [analisis.activo, ambito, equipAmbito, analisis.hallazgos],
  )

  /**
   * Como se llama y que es el territorio en vista. El titulo va sobre los KPI
   * y el detalle lo situa: sin la superficie, «Plataforma D» no dice si son
   * doscientas hectareas o dos mil.
   */
  const plataformaSel = capasMun?.plataformas.find((p) => p.clave === filtros.plataforma) ?? null
  const barrioSel = barriosAmbito.find((b) => b.nombre === filtros.barrio) ?? null

  /**
   * El ambito al que se recorta la isocrona: sus piezas y sus barrios.
   *
   * El calculo se hace con todo el urbano y se recorta aqui, nunca al reves.
   * Los barrios van en el mismo sitio que las piezas porque son las dos caras
   * de lo mismo: si el recorte dice una cosa y el denominador de poblacion
   * dice otra, el porcentaje de habitantes servidos sale falso.
   */
  const recorte = useMemo(() => {
    if (barrioSel) return { piezas: barrioSel.poligonos, barrios: [barrioSel] }
    if (plataformaSel) return { piezas: plataformaSel.poligonos, barrios: barriosAmbito }
    if (filtros.plataforma === URBANO) {
      return {
        piezas: (capasMun?.plataformas ?? []).flatMap((p) => p.poligonos),
        barrios: barriosAmbito,
      }
    }
    // Todo el canton: no hay limite dibujado al que recortar.
    return { piezas: [], barrios: barriosAmbito }
  }, [barrioSel, plataformaSel, filtros.plataforma, capasMun, barriosAmbito])

  const zonaTitulo =
    filtros.plataforma === URBANO
      ? 'Riobamba urbano'
      : plataformaSel
        ? `Plataforma ${plataformaSel.clave}`
        : 'Todo el cantón'
  const ambitoTitulo = barrioSel ? `${zonaTitulo} · ${barrioSel.nombre}` : zonaTitulo

  const ha = (n: number) => `${numero(Math.round(n))} ha`
  // Los habitantes del ambito, del Censo 2022. Cero mientras no cargue.
  const pobAmbito = barrioSel
    ? barrioSel.pob
    : barriosAmbito.reduce((suma, b) => suma + b.pob, 0)
  const hab = pobAmbito > 0 ? ` · ${numero(pobAmbito)} hab` : ''
  const ambitoDetalle = barrioSel
    ? // La plataforma solo se nombra si el titulo no la lleva ya delante.
      plataformaSel
      ? `${ha(barrioSel.areaHa)}${hab}`
      : `${ha(barrioSel.areaHa)}${hab} · ${
          barrioSel.plataforma ? `plataforma ${barrioSel.plataforma}` : 'fuera de plataforma'
        }`
    : plataformaSel
      ? `${ha(plataformaSel.areaHa)} · ${numero(barriosAmbito.length)} barrios${hab}`
      : filtros.plataforma === URBANO
        ? `${numero(capasMun?.plataformas.length ?? 0)} plataformas · ${numero(barriosAmbito.length)} barrios${hab}`
        : `urbano y rural · ${numero(barriosAmbito.length)} barrios${hab}`

  /*
   * Los escenarios avanzados solo existen mientras la pestana esta abierta:
   * deck.gl no se descarga hasta entonces y sus cifras no se calculan antes.
   */
  const verEspacial = pestana === 'espacial'

  const [flujos, setFlujos] = useState<{ resumen: ResumenFlujos; arcos: number } | null>(null)

  useEffect(() => {
    if (!verEspacial || espacial.escenario !== 'flujos') {
      setFlujos(null)
      return
    }
    let vivo = true
    void import('./lib/deck/escenarios').then((m) => {
      if (!vivo) return
      const arcos = m.asignar(barriosAmbito, equipAmbito, espacial.tipoEquipamiento)
      setFlujos({ resumen: m.resumenFlujos(arcos), arcos: arcos.length })
    })
    return () => {
      vivo = false
    }
  }, [verEspacial, espacial.escenario, espacial.tipoEquipamiento, barriosAmbito, equipAmbito])

  /**
   * Los barrios ordenados por gente mal servida: poblacion por lo lejos que le
   * queda el equipamiento. Es la tabla que acompana a la vista en tres
   * dimensiones, donde «alto y oscuro» es lo que hay que mirar.
   */
  const prioridades = useMemo(() => {
    if (!verEspacial || espacial.escenario !== 'barrios') return []
    const destino = equipAmbito.filter((e) => e.tipo === espacial.tipoEquipamiento)
    return barriosAmbito
      .filter((b) => b.pob > 0)
      .map((b) => {
        let distancia: number | null = null
        for (const e of destino) {
          const d = distanciaM(b.centro[0], b.centro[1], e.lon, e.lat)
          if (distancia === null || d < distancia) distancia = d
        }
        return { nombre: b.nombre, pob: b.pob, distancia }
      })
      .sort((a, b) => b.pob * (b.distancia ?? 5000) - a.pob * (a.distancia ?? 5000))
  }, [verEspacial, espacial.escenario, espacial.tipoEquipamiento, barriosAmbito, equipAmbito])

  /**
   * Isocrona a pie desde los equipamientos elegidos.
   *
   * La red de calles pesa dos megas, asi que se carga la primera vez que
   * alguien pide una isocrona y se queda en memoria. El calculo es un Dijkstra
   * con todos los equipamientos como origen a la vez: lo que interesa es el
   * tiempo al mas cercano, no a cada uno.
   */
  const [isocrona, setIsocrona] = useState<{
    red: { aristas: [number, number, number, number[][]][] }
    alcanzables: { arista: number; minutos: number }[]
    tramos: number[]
    metrosPorTramo: Map<number, number>
    /** La mancha en el suelo: lo que se dibuja y lo que se mide. */
    bandas: { minutos: number; piezas: [number, number][][][]; hectareas: number }[]
    /** Habitantes del ambito y cuantos caen dentro de cada banda. */
    poblacion: number
    poblacionPorTramo: Map<number, number>
    origenes: number
    sueltos: number
    /** Proyectos de 2026 que crean alcance de este uso. */
    proyectos: number
    /** Habitantes y hectareas que suma el plan; null si no hay con que sumar. */
    aporteHabitantes: number | null
    aporteHectareas: number | null
  } | null>(null)

  /**
   * El analisis del casco urbano, tal cual, sin recortar.
   *
   * Es la pieza cara —Dijkstra sobre doce mil nodos y seiscientos kilometros de
   * calle convertidos en campo de minutos— y **no depende del ambito**: solo de
   * que equipamiento se mira, de que gestion y de cuantos minutos. Guardarla
   * aqui es lo que permite que cambiar de plataforma o de barrio sea solo un
   * recorte y no un analisis nuevo.
   */
  const analisisUrbano = useRef(new Map<string, { red: Red; iso: Isocrona; campo: Campo }>())

  useEffect(() => {
    if (!verEspacial || espacial.escenario !== 'isocronas') {
      setIsocrona(null)
      return
    }
    let vivo = true
    setIsocrona(null)
    void (async () => {
      const iso = await import('./lib/isocronas')
      const sup = await import('./lib/isocronaSuperficie')
      if (!vivo) return
      const tramos = iso.MINUTOS.filter((m) => m <= espacial.minutos)

      const construidos = equipUrbano
        .filter(
          (e) =>
            e.tipo === espacial.tipoEquipamiento &&
            (espacial.gestion === 'todas' || e.gestion === espacial.gestion),
        )
        .map((e) => ({ id: e.id, lon: e.lon, lat: e.lat }))

      /*
       * Los proyectos de 2026 que de verdad crean alcance de este uso. Un
       * adoquinado o una consultoria no entran: eso lo decide el script que
       * trae la tabla, no esta pantalla.
       */
      const delPlan = (capasMun?.proyectos ?? [])
        .filter((p) => p.aporta && p.uso === espacial.tipoEquipamiento)
        .map((p) => ({ id: `proyecto:${p.item}`, lon: p.lon, lat: p.lat }))

      /**
       * El analisis del casco urbano para una lista de origenes, guardado.
       *
       * La clave no lleva el ambito a proposito —el mismo analisis sirve para
       * la ciudad, para una plataforma y para un barrio— pero si lleva la lista
       * de origenes: con solo el tipo y la gestion, un filtro de uso o una
       * busqueda por texto cambiarian los origenes sin cambiar la clave y se
       * reutilizaria un analisis que ya no corresponde.
       */
      const analizar = async (origenes: { id: string; lon: number; lat: number }[]) => {
        const clave = [espacial.minutos, origenes.map((o) => o.id).join(',')].join('|')
        const ya = analisisUrbano.current.get(clave)
        if (ya) return ya
        const red = await iso.cargarRed()
        const r = iso.calcularIsocrona(red, origenes, espacial.minutos)
        /*
         * La isocrona se calcula sobre las calles, pero se lee como superficie:
         * el campo de minutos convierte lo uno en lo otro y de el salen las
         * cifras —contorno, hectareas y habitantes—, para que todas digan lo
         * mismo.
         */
        const campo = sup.campoDeTiempos(red, r, espacial.minutos)
        if (!campo) return null
        const hecho = { red, iso: r, campo }
        analisisUrbano.current.set(clave, hecho)
        return hecho
      }

      /** Recorta el analisis al ambito y saca de ahi todas las cifras. */
      const medir = (g: { red: Red; iso: Isocrona; campo: Campo }) => {
        // El recorte trabaja sobre una copia: el analisis del urbano se guarda
        // entero para poder recortarlo otra vez por otro ambito.
        const campo = { ...g.campo, minutos: Float32Array.from(g.campo.minutos) }
        // Primero el recorte y despues todo lo demas: el contorno, las
        // hectareas y los habitantes salen del mismo campo ya recortado y no
        // pueden contradecirse entre si.
        sup.recortarCampo(campo, recorte.piezas)
        const bandas = sup.bandasDe(campo, tramos)
        // Las calles tambien se recortan: si no, la columna de kilometros
        // hablaria del urbano entero mientras las otras dos hablan del ambito.
        const calles = sup.recortarCalles(g.red, g.iso, campo)
        const gente = sup.poblacionPorBanda(recorte.barrios, campo, tramos)
        return { bandas, calles, gente }
      }

      const base = await analizar(construidos)
      if (!vivo || !base) {
        if (vivo) setIsocrona(null)
        return
      }
      const hoy = medir(base)

      /*
       * Lo construido y lo construido mas el plan se miden siempre los dos,
       * aunque en pantalla se vea uno: la pregunta no es cuanto alcance habra,
       * es **cuanto suma el plan**, y eso es una resta que necesita las dos
       * cifras. Como las dos quedan guardadas, el interruptor no recalcula.
       */
      const conPlan = delPlan.length > 0 ? await analizar([...construidos, ...delPlan]) : null
      if (!vivo) return
      const futuro = conPlan ? medir(conPlan) : null

      const elegido = espacial.conProyectos && conPlan && futuro ? futuro : hoy
      const fuente = espacial.conProyectos && conPlan ? conPlan : base

      setIsocrona({
        red: fuente.red as unknown as { aristas: [number, number, number, number[][]][] },
        alcanzables: elegido.calles.alcanzables,
        tramos,
        metrosPorTramo: elegido.calles.metrosPorTramo,
        bandas: elegido.bandas,
        poblacion: elegido.gente.poblacion,
        poblacionPorTramo: elegido.gente.porTramo,
        origenes: fuente.iso.origenes,
        sueltos: fuente.iso.sueltos,
        proyectos: delPlan.length,
        aporteHabitantes: futuro
          ? (futuro.gente.porTramo.get(espacial.minutos) ?? 0) -
            (hoy.gente.porTramo.get(espacial.minutos) ?? 0)
          : null,
        aporteHectareas: futuro
          ? (futuro.bandas.find((b) => b.minutos === espacial.minutos)?.hectareas ?? 0) -
            (hoy.bandas.find((b) => b.minutos === espacial.minutos)?.hectareas ?? 0)
          : null,
      })
    })()
    return () => {
      vivo = false
    }
  }, [
    verEspacial,
    espacial.escenario,
    espacial.tipoEquipamiento,
    espacial.gestion,
    espacial.minutos,
    espacial.conProyectos,
    equipUrbano,
    capasMun,
    recorte,
  ])

  const porCategoriaEspacial = useMemo(
    () => resumen.porCategoria.map((c) => ({ clave: c.clave as string, n: c.total })),
    [resumen],
  )

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

  /**
   * Lo que dice la franja de indicadores segun la pestana abierta.
   *
   * Hasta aqui la franja decia siempre lo mismo —el estado del levantamiento—
   * aunque en pantalla se estuviera midiendo otra cosa, y es el sitio mas
   * visible del visor. Con un analisis abierto pasa a encabezarlo el, y sus
   * cifras se mudan del panel lateral, que es estrecho, al ancho de la franja.
   * No se duplican: se mudan.
   *
   * Sin nada elegido vuelve al levantamiento, que es la respuesta correcta a
   * «como esta el dato».
   */
  const franja = useMemo((): { titulo: string; tarjetas: Tarjeta[] } | null => {
    if (pestana === 'analisis') {
      if (deficit) {
        return {
          titulo: 'Distancia al equipamiento',
          tarjetas: [
            { valor: numero(deficit.filas.length), rotulo: 'Barrios medidos', pie: ambitoRotulo },
            {
              valor: numero(deficit.sinNada),
              rotulo: 'Sin ningun equipamiento',
              pie: `de ${numero(deficit.filas.length)} barrios del ambito`,
              tono: deficit.sinNada > 0 ? 'aviso' : 'ok',
            },
            {
              valor: deficit.mediana === null ? '—' : `${numero(deficit.mediana)} m`,
              rotulo: 'Distancia mediana',
              pie: 'en linea recta, no por calle',
            },
          ],
        }
      }
      if (cobertura) {
        const conPoblacion = cobertura.poblacion > 0
        const pct = conPoblacion ? (cobertura.poblacionCubierta / cobertura.poblacion) * 100 : 0
        return {
          titulo: `Cobertura · ${analisis.tipo}`,
          tarjetas: [
            conPoblacion
              ? {
                  valor: porcentaje(pct),
                  rotulo: 'De la poblacion cubierta',
                  pie: `${numero(Math.round(cobertura.poblacionCubierta))} de ${numero(cobertura.poblacion)} habitantes`,
                  tono: pct >= 80 ? 'ok' : pct >= 50 ? 'aviso' : 'error',
                }
              : {
                  valor: porcentaje(cobertura.total * 100),
                  rotulo: 'Del area cubierta',
                  pie: 'sin datos de poblacion en el ambito',
                },
            {
              valor: numero(Math.round(cobertura.poblacion - cobertura.poblacionCubierta)),
              rotulo: 'Personas fuera de alcance',
              pie: `radio de ${numero(cobertura.radio)} m segun el Codigo Urbano`,
              tono: 'aviso',
            },
            {
              valor: numero(cobertura.sinNada),
              rotulo: 'Barrios sin nada',
              pie: 'ni un equipamiento dentro del radio',
              tono: cobertura.sinNada > 0 ? 'aviso' : 'ok',
            },
            {
              valor: numero(cobertura.servicios),
              rotulo: 'Equipamientos contados',
              pie: `${numero(cobertura.deGadm)} del inventario · ${numero(cobertura.deOsm)} de OSM`,
            },
          ],
        }
      }
      if (cruce) {
        const pct = cruce.nA ? (cruce.cubiertos / cruce.nA) * 100 : 0
        return {
          titulo: 'Cruce de categorias',
          tarjetas: [
            {
              valor: porcentaje(pct),
              rotulo: `A menos de ${numero(cruce.umbral)} m`,
              pie: `${numero(cruce.cubiertos)} de ${numero(cruce.nA)} registros`,
              tono: pct >= 80 ? 'ok' : pct >= 50 ? 'aviso' : 'error',
            },
            {
              valor: cruce.mediana === null ? '—' : `${numero(cruce.mediana)} m`,
              rotulo: 'Distancia mediana',
              pie: 'al mas cercano de la otra categoria',
            },
            {
              valor: numero(cruce.desatendidos.length),
              rotulo: 'Quedan fuera',
              pie: 'resaltados en el mapa',
              tono: cruce.desatendidos.length > 0 ? 'aviso' : 'ok',
            },
          ],
        }
      }
      if (analisis.activo === 'inventario') {
        return {
          titulo: 'Sin inventariar',
          tarjetas: [
            {
              valor: numero(hallazgos.length),
              rotulo: 'Posibles equipamientos',
              pie: 'estan en OpenStreetMap y no en el inventario del GADM',
              tono: hallazgos.length > 0 ? 'aviso' : 'ok',
            },
            { valor: numero(equipAmbito.length), rotulo: 'En el inventario', pie: ambitoRotulo },
          ],
        }
      }
      return null
    }

    if (pestana === 'espacial' && espacial.escenario === 'isocronas' && isocrona) {
      const dentro = isocrona.poblacionPorTramo.get(espacial.minutos) ?? 0
      const pct = isocrona.poblacion ? (dentro / isocrona.poblacion) * 100 : 0
      const ha = isocrona.bandas.find((b) => b.minutos === espacial.minutos)?.hectareas ?? 0
      return {
        titulo: `Isocrona · ${espacial.tipoEquipamiento}`,
        tarjetas: [
          {
            valor: numero(Math.round(dentro)),
            rotulo: `Habitantes a ${numero(espacial.minutos)} min andando`,
            pie: `de ${numero(Math.round(isocrona.poblacion))} en ${ambitoRotulo}`,
            tono: pct >= 80 ? 'ok' : pct >= 50 ? 'aviso' : 'error',
          },
          { valor: porcentaje(pct), rotulo: 'Del ambito', pie: 'por calle, no en linea recta' },
          { valor: `${numero(Math.round(ha))} ha`, rotulo: 'Superficie al alcance' },
          {
            valor: numero(isocrona.origenes),
            rotulo: 'Equipamientos de partida',
            pie: 'de todo el urbano, no solo del ambito',
          },
        ],
      }
    }

    if (pestana === 'espacial' && espacial.escenario === 'barrios' && barriosAmbito.length > 0) {
      const habitantes = barriosAmbito.reduce((s, b) => s + b.pob, 0)
      const peor = prioridades[0] ?? null
      return {
        titulo: `Barrios en 3D · ${espacial.tipoEquipamiento}`,
        tarjetas: [
          { valor: numero(barriosAmbito.length), rotulo: 'Barrios en vista', pie: ambitoRotulo },
          {
            valor: numero(habitantes),
            rotulo: 'Habitantes',
            pie: 'Censo 2022 repartido por edificios',
          },
          {
            valor: peor && peor.distancia !== null ? `${numero(peor.distancia)} m` : '—',
            rotulo: 'El peor servido',
            // La altura es la gente y el color la distancia: la prioridad sale
            // de las dos juntas, no de ninguna por separado.
            pie: peor ? `${peor.nombre} · ${numero(peor.pob)} hab` : undefined,
            tono: 'aviso',
          },
          {
            valor: numero(Math.max(0, ...barriosAmbito.map((b) => b.pob))),
            rotulo: 'El mas poblado',
            pie: 'habitantes del barrio mayor',
          },
        ],
      }
    }

    if (pestana === 'espacial' && espacial.escenario === 'flujos' && flujos) {
      return {
        titulo: 'Asignacion barrio → equipamiento',
        tarjetas: [
          {
            valor: numero(Math.round(flujos.resumen.poblacion)),
            rotulo: 'Habitantes asignados',
            pie: `${numero(flujos.arcos)} barrios enlazados`,
          },
          {
            valor: numero(Math.round(flujos.resumen.poblacionLejos)),
            rotulo: 'A mas de un kilometro',
            pie: `en ${numero(flujos.resumen.lejos)} barrios`,
            tono: flujos.resumen.lejos > 0 ? 'aviso' : 'ok',
          },
          {
            valor: flujos.resumen.mediana === null ? '—' : `${numero(flujos.resumen.mediana)} m`,
            rotulo: 'Distancia mediana',
          },
        ],
      }
    }

    return null
  }, [
    pestana,
    deficit,
    cobertura,
    cruce,
    hallazgos,
    analisis.activo,
    analisis.tipo,
    equipAmbito,
    espacial,
    isocrona,
    flujos,
    barriosAmbito,
    prioridades,
    ambitoRotulo,
  ])

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

  /*
   * Cambiar de tipo trae consigo el nivel de partida de ese tipo: los niveles
   * son filas distintas de la tabla de la ordenanza y el del tipo anterior no
   * existe aqui. Se elige el primero medible, que es el de proximidad.
   */
  const cambiarAnalisis = (a: EstadoAnalisis) => {
    if (a.tipo === analisis.tipo) return setAnalisis(a)
    const inicial = nivelInicial(a.tipo)
    // El elemento pertenece al uso anterior y no existe en el nuevo: se suelta.
    setAnalisis({ ...a, elemento: '', nivel: inicial ? claveNivel(inicial) : a.nivel })
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
      clave: 'espacial',
      rotulo: 'Espacial',
      nota: 'Escenarios en deck.gl: puntos, densidad 3D y asignación barrio–equipamiento',
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

      {/* El ambito va arriba, pegado al mapa: es lo primero que hay que saber
          para leer todo lo demas. Las cifras, en cambio, bajaron debajo del
          mapa, que es lo que se mira. */}
      <div className="px-4 pt-3">
        <CabeceraAmbito
          ambito={ambitoTitulo}
          detalle={ambitoDetalle}
          // Se vuelve al ambito de partida, no a todo el canton: el visor abre
          // en el urbano y ahi es donde se espera regresar.
          onQuitarFiltro={
            filtros.plataforma === URBANO && !filtros.barrio
              ? null
              : () => cambiarFiltros({ ...filtros, plataforma: URBANO, barrio: null })
          }
        />
      </div>

      {/* GitHub Pages cachea el index.html diez minutos y no deja cambiarlo.
          Sin este aviso, quien abra el visor justo después de publicar algo ve
          la versión anterior y cree que el cambio no se hizo. */}
      {hayVersionNueva && (
        <div className="px-4 pt-3">
          <p className="gr-nota gr-nota--novedad flex flex-wrap items-center gap-3">
            <span>Hay una versión más nueva del visor publicada.</span>
            <button type="button" className="gr-btn" onClick={recargarDeVerdad}>
              Actualizar ahora
            </button>
          </p>
        </div>
      )}

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
            {fecha(datos.selloOsm ?? undefined)}). El espejo que va al día responde de forma
            intermitente y esta vez no contestó, así que se usó el menos atrasado de los que sí.
            Lo levantado en campo estos días puede no aparecer todavía: pulse{' '}
            <b>Actualizar desde OSM</b>, que suele bastar con reintentar.
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
        {/* El mapa manda y las cifras van debajo. Arriba ocupaban una franja
            fija que el mapa no recuperaba nunca, y es el mapa lo que se mira. */}
        <div className="flex flex-col gap-3 lg:min-h-0">
        <section
          className="relative h-[60vh] min-h-[340px] overflow-hidden rounded lg:h-auto lg:flex-1"
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
            cobertura={cobertura?.geo ?? null}
            alcance={cobertura?.alcance ?? null}
            cruce={
              cruce ? { a: cruce.a, b: cruce.b, desatendidos: cruce.desatendidos } : null
            }
            onElegirBarrio={elegirBarrio}
            colorEquip={colorEquip}
            espacial={
              verEspacial
                ? {
                    escenario: espacial.escenario,
                    colorPor: espacial.colorPor,
                    radio: espacial.radio,
                    peso: espacial.peso,
                    extruido: espacial.extruido,
                    tipoEquipamiento: espacial.tipoEquipamiento,
                    altura: espacial.altura,
                    colorBarrio: espacial.colorBarrio,
                    barrios: barriosAmbito,
                    isocrona: isocrona
                      ? {
                          red: isocrona.red,
                          alcanzables: isocrona.alcanzables,
                          tramos: isocrona.tramos,
                          bandas: isocrona.bandas,
                        }
                      : null,
                    verCalles: espacial.verCalles,
                  }
                : null
            }
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

          <PanelKpis
            resumen={resumen}
            totalCanton={todos.length}
            equipamientos={equipFiltrados.length}
            equipPorVerificar={porVerificar.length}
            tarjetas={franja?.tarjetas}
            titulo={franja?.titulo}
          />
        </div>

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
                  usosEquip={usosEquip}
                  colorEquip={colorEquip}
                  onColorEquip={setColorEquip}
                  onCambio={cambiarFiltros}
                  onCapas={setCapas}
                />
              </>
            )}

            {pestana === 'analisis' && (
              <PanelAnalisis
                analisis={analisis}
                onAnalisis={cambiarAnalisis}
                deficit={deficit}
                cobertura={cobertura}
                tipos={tipos}
                elementos={elementos}
                servicios={servicios}
                cruce={cruce}
                hallazgos={hallazgos}
                ambito={ambitoRotulo}
                onElegirBarrio={elegirBarrio}
                onElegirPunto={elegirPunto}
                onDescargarHallazgos={descargarHallazgos}
              />
            )}

            {pestana === 'espacial' && (
              <PanelEspacial
                estado={espacial}
                onEstado={setEspacial}
                tipos={tipos}
                totalPuntos={filtrados.length}
                porCategoria={porCategoriaEspacial}
                pendientes={resumen.pendientes}
                totalEquipamientos={equipFiltrados.length}
                barrios={barriosAmbito}
                prioridades={prioridades}
                isocrona={isocrona}
                flujos={flujos?.resumen ?? null}
                arcos={flujos?.arcos ?? 0}
                ambito={ambitoRotulo}
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
