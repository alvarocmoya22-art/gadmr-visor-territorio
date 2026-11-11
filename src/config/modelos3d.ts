/**
 * Dónde se para en el mundo cada modelo de proyecto.
 *
 * EL DATO NO SALE DEL ARCHIVO. Un IFC puede traer latitud y longitud, pero el
 * del Parque Guayaquil venía con las de Madrid: son las que Archicad pone por
 * defecto en la versión en español y nadie las cambió al exportar. Fiarse de
 * ese campo habría dejado el parque a diez mil kilómetros.
 *
 * Así que la ubicación se pone aquí, a mano, encajando el modelo sobre la
 * ortofoto, y se declara con qué precisión. Sobre un mapa la gente mide: un
 * modelo torcido o corrido veinte metros se convierte en un dato falso en
 * cuanto alguien le pregunte a qué distancia queda de una casa.
 *
 * `rumbo` son los grados que hay que girar el modelo en sentido horario para
 * que su norte coincida con el norte del mapa. `altura` lo sube o lo baja
 * respecto al suelo del mapa, que es plano: el terreno real del parque no lo
 * está, y el modelo apoya en su propia cota cero.
 */
export interface Modelo3D {
  clave: string
  rotulo: string
  /** El .glb, relativo a la base del sitio. */
  archivo: string
  /** La ficha que escribe `scripts/modelo_ifc.py` junto al modelo. */
  ficha: string
  lon: number
  lat: number
  /** Grados horarios desde el norte del mapa. */
  rumbo: number
  /** Metros sobre el suelo del mapa. */
  altura: number
  /** Con el cantón entero a la vista no se distingue: no se dibuja por debajo. */
  zoomMin: number
  /** Quién lo hizo y con qué precisión está puesto. Va a la leyenda. */
  procedencia: string
  ajuste: string
}

export const MODELOS_3D: Modelo3D[] = [
  {
    clave: 'parqueGuayaquil',
    rotulo: 'Parque Guayaquil · proyecto',
    archivo: 'datos/parque_guayaquil.glb',
    ficha: 'datos/parque_guayaquil.json',
    /*
     * Ubicación medida contra el polígono real de la laguna.
     *
     * El IFC no trae georreferencia válida —venía con las coordenadas que
     * Archicad pone por defecto, que apuntan a Madrid— y la ortofoto no
     * servía de referencia: en la imagen disponible el parque está excavado
     * y la laguna vaciada por la obra.
     *
     * La referencia es el polígono levantado de la laguna tal como está hoy
     * (5.158 m², UTM 17S). El ajuste se hizo rellenando los 1.428 triángulos
     * del agua del modelo y buscando el giro y el corrimiento que más
     * superficie comparten con él: 57,9 % de solape. La curva tiene un solo
     * máximo —52,5 % ocho grados antes, 53,4 % ocho grados después— y al
     * revés cae al 34,3 %, que es lo que resuelve hacia dónde mira.
     *
     * UN AJUSTE ANTERIOR, HECHO CONTRA LA LAGUNA DIBUJADA EN OPENSTREETMAP,
     * DABA −10,5°. Estaba diez grados torcido: la mancha de la tesela se
     * parece a la laguna pero no es un levantamiento. Con el polígono real
     * el óptimo es este y el solape sube del 44,9 % al 57,9 %.
     *
     * No llega más arriba porque el proyecto REFORMA la orilla: el agua
     * proyectada son 3.125 m² frente a los 5.158 m² que hay hoy. Es un
     * modelo de lo que se va a construir, encajado sobre lo que existe.
     *
     * Vale para situar y para comparar; no para replantear en obra.
     */
    lon: -78.659093,
    lat: -1.667365,
    rumbo: -0.5,
    altura: 0,
    zoomMin: 14,
    procedencia:
      'Rehabilitación de zonas internas del Parque Guayaquil · IFC 2x3 exportado de Archicad 28 el 10 nov 2026',
    ajuste:
      'encajado sobre el polígono levantado de la laguna, 57,9 % de solape: el IFC no trae georreferencia válida',
  },
]
