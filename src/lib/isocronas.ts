/**
 * Isócronas a pie sobre la red de calles.
 *
 * Hasta aquí el visor medía en línea recta, y por calle siempre se anda más:
 * una manzana cerrada, una quebrada o un muro convierten 400 m de radio en
 * 700 m de recorrido. Esto responde la pregunta de verdad: **hasta dónde se
 * llega andando** desde un equipamiento en N minutos.
 *
 * El grafo lo prepara `scripts/red_peatonal.py` a partir de OpenStreetMap y
 * vive en `public/datos/red.json`. Pesa unos dos megas, así que se carga la
 * primera vez que alguien pide una isócrona y se guarda en memoria.
 *
 * Lo que NO tiene en cuenta, y conviene saber:
 *
 *  - **La pendiente.** Riobamba está a 2.750 m y tiene cuestas; subir cuesta
 *    más que bajar y el grafo no lo sabe. Las isócronas cuesta arriba son
 *    optimistas.
 *  - **Los semáforos y los cruces.** No hay penalización por esperar.
 *  - **El estado de la acera.** Una calle sin vereda cuenta igual que un
 *    bulevar.
 */

/** Velocidad de caminata, en metros por minuto (4,5 km/h). */
export const VELOCIDAD_M_MIN = 75

/** Tramos que ofrece el control, en minutos. */
export const MINUTOS = [5, 10, 15]

/** Arista del grafo: los dos nodos que une, su longitud y su trazado. */
type Arista = [number, number, number, number[][]]

export interface Red {
  fuente: string
  nodos: [number, number][]
  aristas: Arista[]
  /** Vecinos de cada nodo: pares [otroNodo, indiceDeArista]. */
  vecinos: [number, number][][]
}

let cache: Red | null = null
let cargando: Promise<Red> | null = null

/** Carga el grafo una sola vez y lo deja preparado para recorrerlo. */
export function cargarRed(): Promise<Red> {
  if (cache) return Promise.resolve(cache)
  if (cargando) return cargando
  cargando = fetch(`${import.meta.env.BASE_URL}datos/red.json`, { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(`No se pudo cargar la red de calles (${r.status})`)
      return r.json() as Promise<Omit<Red, 'vecinos'>>
    })
    .then((d) => {
      const vecinos: [number, number][][] = Array.from({ length: d.nodos.length }, () => [])
      d.aristas.forEach(([a, b], i) => {
        vecinos[a].push([b, i])
        vecinos[b].push([a, i])
      })
      cache = { ...d, vecinos }
      return cache
    })
  return cargando
}

/** Rejilla de nodos para encontrar el más cercano a un punto sin recorrerlos todos. */
class IndiceNodos {
  private celdas = new Map<string, number[]>()
  /** Lado de la celda en grados; unos 200 m a esta latitud. */
  private lado = 0.002

  constructor(private nodos: [number, number][]) {
    nodos.forEach((n, i) => {
      const c = this.clave(n[0], n[1])
      const ya = this.celdas.get(c)
      if (ya) ya.push(i)
      else this.celdas.set(c, [i])
    })
  }

  private clave(lon: number, lat: number) {
    return `${Math.floor(lon / this.lado)},${Math.floor(lat / this.lado)}`
  }

  /** Nodo más cercano dentro de un radio razonable; -1 si no hay ninguno. */
  cercano(lon: number, lat: number): number {
    const cx = Math.floor(lon / this.lado)
    const cy = Math.floor(lat / this.lado)
    let mejor = -1
    let mejorD = Infinity
    // Se abre en anillos hasta encontrar algo: un equipamiento en el borde de
    // la ciudad puede tener su calle más cercana a varias celdas de distancia.
    for (let r = 0; r <= 3 && mejor === -1; r++) {
      for (let i = -r; i <= r; i++) {
        for (let j = -r; j <= r; j++) {
          if (r > 0 && Math.abs(i) !== r && Math.abs(j) !== r) continue
          for (const n of this.celdas.get(`${cx + i},${cy + j}`) ?? []) {
            const dx = this.nodos[n][0] - lon
            const dy = this.nodos[n][1] - lat
            const d = dx * dx + dy * dy
            if (d < mejorD) {
              mejorD = d
              mejor = n
            }
          }
        }
      }
    }
    return mejor
  }
}

let indice: IndiceNodos | null = null

export interface Origen {
  lon: number
  lat: number
}

export interface Isocrona {
  /** Minutos de caminata hasta cada nodo; Infinity si no se alcanza. */
  minutos: Float64Array
  /** Índices de las aristas alcanzables, con el tiempo del extremo peor. */
  alcanzables: { arista: number; minutos: number }[]
  /** Metros de calle dentro de cada tramo de tiempo. */
  metrosPorTramo: Map<number, number>
  /** Orígenes que sí engancharon con la red. */
  origenes: number
  /** Orígenes que no tenían ninguna calle cerca. */
  sueltos: number
}

/**
 * Hasta dónde se llega andando desde un conjunto de equipamientos.
 *
 * Es un Dijkstra con todos los orígenes a la vez, no uno por equipamiento: lo
 * que interesa es el tiempo al **más cercano**, que es la pregunta de
 * accesibilidad, y así el coste no crece con el número de equipamientos.
 */
export function calcularIsocrona(red: Red, origenes: Origen[], minutosMax: number): Isocrona {
  if (!indice) indice = new IndiceNodos(red.nodos)

  const n = red.nodos.length
  const minutos = new Float64Array(n).fill(Infinity)
  const cola: [number, number][] = [] // [minutos, nodo]

  let enganchados = 0
  let sueltos = 0
  for (const o of origenes) {
    const nodo = indice.cercano(o.lon, o.lat)
    if (nodo < 0) {
      sueltos++
      continue
    }
    enganchados++
    if (minutos[nodo] > 0) {
      minutos[nodo] = 0
      cola.push([0, nodo])
    }
  }

  /*
   * Cola de prioridad mínima. Con doce mil nodos un montículo binario escrito
   * a mano basta y sobra; traer una dependencia por esto sería desproporcionado.
   */
  const subir = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1
      if (cola[p][0] <= cola[i][0]) break
      ;[cola[p], cola[i]] = [cola[i], cola[p]]
      i = p
    }
  }
  const bajar = (i: number) => {
    for (;;) {
      const izq = 2 * i + 1
      const der = izq + 1
      let m = i
      if (izq < cola.length && cola[izq][0] < cola[m][0]) m = izq
      if (der < cola.length && cola[der][0] < cola[m][0]) m = der
      if (m === i) break
      ;[cola[m], cola[i]] = [cola[i], cola[m]]
      i = m
    }
  }
  for (let i = cola.length - 1; i >= 0; i--) bajar(i)

  while (cola.length) {
    const [t, u] = cola[0]
    cola[0] = cola[cola.length - 1]
    cola.pop()
    if (cola.length) bajar(0)
    if (t > minutos[u]) continue
    if (t >= minutosMax) continue
    for (const [v, ia] of red.vecinos[u]) {
      const nuevo = t + red.aristas[ia][2] / VELOCIDAD_M_MIN
      if (nuevo < minutos[v] && nuevo <= minutosMax) {
        minutos[v] = nuevo
        cola.push([nuevo, v])
        subir(cola.length - 1)
      }
    }
  }

  // Una arista se considera alcanzable cuando sus dos extremos lo son; con uno
  // solo, el tramo se recorre a medias y pintarlo entero exageraría el alcance.
  const alcanzables: { arista: number; minutos: number }[] = []
  const metrosPorTramo = new Map<number, number>()
  red.aristas.forEach(([a, b, largo], i) => {
    const peor = Math.max(minutos[a], minutos[b])
    if (!Number.isFinite(peor)) return
    alcanzables.push({ arista: i, minutos: peor })
    const tramo = MINUTOS.find((m) => peor <= m) ?? minutosMax
    metrosPorTramo.set(tramo, (metrosPorTramo.get(tramo) ?? 0) + largo)
  })

  return { minutos, alcanzables, metrosPorTramo, origenes: enganchados, sueltos }
}

/**
 * Minutos de caminata desde un punto cualquiera hasta el origen más cercano.
 *
 * Sirve para llevar la isócrona a la cobertura por barrio: cada punto de la
 * rejilla se engancha a su calle más próxima y hereda su tiempo.
 */
export function minutosEn(red: Red, iso: Isocrona, lon: number, lat: number): number {
  if (!indice) indice = new IndiceNodos(red.nodos)
  const nodo = indice.cercano(lon, lat)
  return nodo < 0 ? Infinity : iso.minutos[nodo]
}
