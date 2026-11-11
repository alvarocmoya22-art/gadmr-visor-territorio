/**
 * Dibuja un modelo de proyecto sobre el mapa, en su sitio y a su tamaño.
 *
 * MapLibre sabe extruir poligonos, que es lo que hace la capa de edificacion,
 * pero no sabe leer un modelo de arquitectura: una glorieta, un puente o una
 * cubierta no son un poligono con altura. Para eso existe la capa a medida:
 * MapLibre cede el contexto de dibujo y la matriz de la camara, y aqui dentro
 * se pinta con three.js sobre el mismo mapa, compartiendo profundidad, de modo
 * que un arbol del modelo tapa la calle que tiene detras y no al reves.
 *
 * EL MODELO NO SABE DONDE ESTA. Viene centrado en su propio origen y con el
 * suelo en cero; la posicion, el giro y la altura salen de `modelos3d.ts`,
 * puestos a mano. Aqui solo se aplican.
 *
 * SE PINTA SOLO CUANDO HACE FALTA. Mientras la capa esta apagada o el mapa va
 * por debajo del zoom minimo, `render` sale a la primera linea: no se pide
 * repintado y el mapa no paga nada. El .glb tampoco se descarga hasta que
 * alguien enciende el interruptor.
 */
import maplibregl, { type CustomLayerInterface, type Map as MapaLibre } from 'maplibre-gl'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Modelo3D } from '../config/modelos3d'

export interface CapaModelo extends CustomLayerInterface {
  /** Enciende o apaga el dibujo sin quitar la capa del estilo. */
  mostrar: (v: boolean) => void
  /** Reposiciona en caliente, para encajarlo sobre la ortofoto. */
  recolocar: (p: { lon?: number; lat?: number; rumbo?: number; altura?: number }) => void
  /** Lo que haya cargado: sirve para saber si ya esta y para medirlo. */
  estado: () => {
    cargado: boolean
    error: string | null
    /** Si MapLibre ya cedio el contexto y hay con que dibujar. */
    listoGL: boolean
    visible: boolean
    /** Triangulos que three dibujo en el ultimo cuadro. Cero = no llega nada. */
    triangulos: number
    lon: number
    lat: number
    rumbo: number
  }
}

export function capaModelo(cfg: Modelo3D, base: string): CapaModelo {
  const escena = new THREE.Scene()
  const camara = new THREE.Camera()
  let render: THREE.WebGLRenderer | null = null
  let mapa: MapaLibre | null = null
  let visible = false
  let cargado = false
  let error: string | null = null
  let triangulos = 0

  let { lon, lat, rumbo, altura } = cfg

  /*
   * Luz de dos piezas y ninguna sombra. El mapa ya trae su propio sombreado
   * en el fondo, y una sombra proyectada por three.js caeria sobre un suelo
   * que aqui no existe. Con un cielo y un sol basta para que se lean los
   * volumenes.
   */
  escena.add(new THREE.HemisphereLight(0xdfe9f3, 0x4a4a46, 2.2))
  const sol = new THREE.DirectionalLight(0xfff4e2, 2.4)
  sol.position.set(60, 140, 80)
  escena.add(sol)

  const raiz = new THREE.Group()
  escena.add(raiz)

  new GLTFLoader().load(
    base + cfg.archivo,
    (g) => {
      /*
       * Sin recorte por frustum. three decide que dibujar comparando la caja
       * de cada malla con la camara, pero aqui la matriz de proyeccion se la
       * damos hecha —la del mapa, multiplicada por la colocacion del modelo—
       * y su camara sigue estando en el origen mirando al frente. Con esa
       * discrepancia daba por fuera de pantalla el modelo entero: cero
       * triangulos dibujados con todo cargado y visible. Son 922 mallas en
       * catorce lotes de color: dibujarlas siempre no cuesta nada.
       */
      g.scene.traverse((o) => {
        o.frustumCulled = false
      })
      raiz.add(g.scene)
      cargado = true
      mapa?.triggerRepaint()
    },
    undefined,
    (e) => {
      error = String(e)
    },
  )

  const capa: CapaModelo = {
    id: `modelo-${cfg.clave}`,
    type: 'custom',
    renderingMode: '3d',

    onAdd(m, gl) {
      mapa = m
      render = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true })
      // MapLibre es el dueno del lienzo: si three.js lo limpiara, borraria el mapa.
      render.autoClear = false
    },

    onRemove() {
      render?.dispose()
      render = null
      mapa = null
    },

    render(_gl, opciones) {
      if (!visible || !cargado || !render || !mapa) return
      if (mapa.getZoom() < cfg.zoomMin) return

      const centro = maplibregl.MercatorCoordinate.fromLngLat([lon, lat], altura)
      const metro = centro.meterInMercatorCoordinateUnits()

      // Del modelo al mundo: girarlo sobre su eje vertical, tumbar el Y-arriba
      // del glTF al Z-arriba del mapa, pasar de metros a unidades Mercator
      // —con la Y invertida, porque en Mercator crece hacia el sur— y llevarlo
      // a su coordenada.
      const giro = new THREE.Matrix4().makeRotationY((-rumbo * Math.PI) / 180)
      const tumbar = new THREE.Matrix4().makeRotationX(Math.PI / 2)
      const colocar = new THREE.Matrix4()
        .makeTranslation(centro.x, centro.y, centro.z)
        .scale(new THREE.Vector3(metro, -metro, metro))
        .multiply(tumbar)
        .multiply(giro)

      /*
       * `defaultProjectionData.mainMatrix` y NO `modelViewProjectionMatrix`.
       * Las dos vienen en el mismo objeto y las dos son matrices de 4x4, pero
       * parten de espacios distintos: la segunda proyecta desde el espacio de
       * mundo de MapLibre —pixeles al zoom actual— y la primera desde el
       * cuadrado Mercator 0..1, que es donde `MercatorCoordinate` deja al
       * modelo. Con la equivocada el modelo se dibujaba entero —470.305
       * triangulos por cuadro— reducido a una mota en el origen del mundo:
       * invisible, y sin un solo error en consola.
       */
      const mvp = new THREE.Matrix4().fromArray(
        Array.from(opciones.defaultProjectionData.mainMatrix) as number[],
      )
      camara.projectionMatrix = mvp.multiply(colocar)

      render.resetState()
      render.render(escena, camara)
      triangulos = render.info.render.triangles
      mapa.triggerRepaint()
    },

    mostrar(v) {
      visible = v
      mapa?.triggerRepaint()
    },

    recolocar(p) {
      if (p.lon !== undefined) lon = p.lon
      if (p.lat !== undefined) lat = p.lat
      if (p.rumbo !== undefined) rumbo = p.rumbo
      if (p.altura !== undefined) altura = p.altura
      mapa?.triggerRepaint()
    },

    estado: () => ({ cargado, error, listoGL: !!render, visible, triangulos, lon, lat, rumbo }),
  }

  return capa
}
