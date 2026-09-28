/**
 * Radios de influencia del Código Urbano de Riobamba.
 *
 * Fuente: Ordenanza del Código Urbano del cantón Riobamba, Registro Oficial
 * Edición Especial N.º 885 del 23 de mayo de 2023, **artículo 178, tabla 3**
 * («Equipamientos de servicios sociales» y «Equipamientos de servicios
 * públicos»), páginas 151 a 160.
 *
 * La propia tabla dice para qué sirve el radio: es «el referente urbano de
 * implantación de los equipamientos en urbanización nueva y **evaluatorio en
 * las áreas urbanas consolidadas**». Lo segundo es exactamente lo que hace el
 * visor.
 *
 * Desde el levantamiento del entorno, el emparejamiento con la tabla ya no se
 * deduce: la capa trae `tipo_eleme` con los mismos doce usos de la ordenanza y
 * `tipologia` con el nivel —Barrial, Zonal o Cantonal—, que es justo la
 * columna que fija el radio. Cada nivel de aquí se casa con su tipología por
 * nombre, y los equipamientos de otra tipología no entran en esa medición.
 *
 * Los niveles con `radio: null` son los que la tabla deja en «---». No falta
 * el dato: son equipamientos que sirven a toda la ciudad y no tienen área de
 * influencia local, así que no se ofrecen para medir cobertura.
 */

/** Una fila de la tabla 3, con lo que hace falta para medir cobertura. */
export interface NivelNorma {
  /** Simbología de la ordenanza: EE1, ES2, ED1… */
  simbolo: string
  /** Debe coincidir con el campo `tipologia` del levantamiento. */
  tipologia: 'Barrial' | 'Zonal' | 'Cantonal'
  /** Radio de influencia en metros; null cuando la tabla pone «---». */
  radio: number | null
  /** Norma de dotación en m² por habitante; null cuando la tabla pone «---». */
  m2hab: number | null
  /** Población base a la que sirve, en habitantes. */
  pobBase: number | null
  /** Lote mínimo en m². */
  loteMin: number | null
  /** Qué actividades cubre, resumido de la columna ACTIVIDADES. */
  actividades: string
  /**
   * Clases de OSM que corresponden a este nivel, cuando se cuenta también esa
   * fuente. OSM no conoce la tipología de la ordenanza, pero sus etiquetas sí
   * distinguen escuela de universidad, que es lo que separa el nivel barrial
   * del cantonal en educación. Donde no hay equivalencia fiable se deja sin
   * poner y entra toda la categoría.
   */
  clasesOsm?: string[]
}

/**
 * Niveles por uso, con los nombres tal como llegan del levantamiento.
 *
 * Si un uso trae varias filas con la misma tipología —Seguridad tiene la UPC a
 * 400 m y la estación de bomberos a 2.000, las dos zonales—, se ofrecen las
 * dos y el usuario elige cuál está evaluando.
 */
export const NORMA: Record<string, NivelNorma[]> = {
  'Educación': [
    { simbolo: 'EE1', tipologia: 'Barrial', radio: 400, m2hab: 0.8, pobBase: 1000, loteMin: 800,
      actividades: 'Escolar (nivel básico) y preescolar',
      clasesOsm: ['amenity=school', 'amenity=kindergarten'] },
    { simbolo: 'EE2', tipologia: 'Zonal', radio: 2000, m2hab: 1.0, pobBase: 10000, loteMin: 10000,
      actividades: 'Colegios secundarios, unidades educativas e institutos superiores',
      clasesOsm: ['amenity=college'] },
    { simbolo: 'EE3', tipologia: 'Cantonal', radio: null, m2hab: 1.0, pobBase: 50000, loteMin: 50000,
      actividades: 'Universidades y escuelas politécnicas',
      clasesOsm: ['amenity=university'] },
  ],
  'Cultural': [
    { simbolo: 'EC1', tipologia: 'Barrial', radio: 400, m2hab: 0.15, pobBase: 2000, loteMin: 300,
      actividades: 'Casas comunales y bibliotecas barriales' },
    { simbolo: 'EC2', tipologia: 'Zonal', radio: 2000, m2hab: 0.2, pobBase: 10000, loteMin: 2000,
      actividades: 'Teatros, auditorios, cines, museos y centros culturales' },
    { simbolo: 'EC3', tipologia: 'Cantonal', radio: null, m2hab: 0.25, pobBase: 20000, loteMin: 5000,
      actividades: 'Casas de la cultura, cinematecas y hemerotecas' },
  ],
  'Salud': [
    { simbolo: 'ES1', tipologia: 'Barrial', radio: 800, m2hab: 0.15, pobBase: 2000, loteMin: 300,
      actividades: 'Subcentros de salud' },
    { simbolo: 'ES2', tipologia: 'Zonal', radio: 2000, m2hab: 0.125, pobBase: 20000, loteMin: 2500,
      actividades: 'Centros de salud, hospital del día y centros de rehabilitación' },
    { simbolo: 'ES3', tipologia: 'Cantonal', radio: null, m2hab: 0.2, pobBase: 50000, loteMin: 10000,
      actividades: 'Clínicas, consultorios y hospital regional' },
  ],
  'Bienestar Social': [
    { simbolo: 'EB1', tipologia: 'Barrial', radio: 400, m2hab: 0.3, pobBase: 1000, loteMin: 300,
      actividades: 'Centros infantiles, casas cuna, guarderías y estimulación temprana' },
    { simbolo: 'EB2', tipologia: 'Zonal', radio: 2000, m2hab: 0.1, pobBase: 20000, loteMin: 2000,
      actividades: 'Centros de reposo y albergues de asistencia social' },
    { simbolo: 'EB3', tipologia: 'Cantonal', radio: null, m2hab: 0.1, pobBase: 50000, loteMin: 5000,
      actividades: 'Centros correccionales y de protección de menores' },
  ],
  'Recreativo y Deporte': [
    { simbolo: 'ED1', tipologia: 'Barrial', radio: 400, m2hab: 0.3, pobBase: 1000, loteMin: 300,
      actividades: 'Parques infantiles, parque barrial y de recreación pasiva' },
    { simbolo: 'ED2', tipologia: 'Zonal', radio: 3000, m2hab: 0.5, pobBase: 20000, loteMin: 10000,
      actividades: 'Canchas deportivas, gimnasios, coliseos, piscinas y parque zonal' },
    { simbolo: 'ED3', tipologia: 'Cantonal', radio: null, m2hab: 1.0, pobBase: 50000, loteMin: 50000,
      actividades: 'Parque de ciudad, estadios y parques de diversión' },
  ],
  'Religioso': [
    { simbolo: 'ER1', tipologia: 'Barrial', radio: null, m2hab: null, pobBase: 1000, loteMin: 800,
      actividades: 'Centros de culto hasta 200 puestos y capillas' },
    { simbolo: 'ER2', tipologia: 'Zonal', radio: 2000, m2hab: null, pobBase: 5000, loteMin: 5000,
      actividades: 'Iglesias hasta 500 puestos y templos' },
    { simbolo: 'ER3', tipologia: 'Cantonal', radio: null, m2hab: null, pobBase: 50000, loteMin: 10000,
      actividades: 'Catedral, conventos y monasterios' },
  ],
  'Seguridad': [
    { simbolo: 'EG1', tipologia: 'Zonal', radio: 400, m2hab: 0.1, pobBase: 1000, loteMin: 100,
      actividades: 'Unidad de vigilancia de policía (UPC) y control del medio ambiente' },
    { simbolo: 'EG1', tipologia: 'Zonal', radio: 2000, m2hab: 0.1, pobBase: 5000, loteMin: 500,
      actividades: 'Estación de bomberos' },
    { simbolo: 'EG2', tipologia: 'Cantonal', radio: null, m2hab: null, pobBase: 50000, loteMin: null,
      actividades: 'Instalaciones militares, cuarteles, centros de rehabilitación social' },
  ],
  'Administración Pública': [
    { simbolo: 'EA1', tipologia: 'Zonal', radio: null, m2hab: 0.03, pobBase: 10000, loteMin: 300,
      actividades: 'Correos, agencias municipales y oficinas de servicios públicos' },
    { simbolo: 'EA2', tipologia: 'Cantonal', radio: null, m2hab: 0.4, pobBase: 50000, loteMin: null,
      actividades: 'Oficinas gubernamentales y sedes de entidades públicas' },
  ],
  'Servicios Funerarios': [
    { simbolo: 'EF1', tipologia: 'Barrial', radio: 2000, m2hab: 0.06, pobBase: 10000, loteMin: 600,
      actividades: 'Funerarias y salas de velación sin crematorio' },
    { simbolo: 'EF2', tipologia: 'Zonal', radio: 3000, m2hab: 1.0, pobBase: 10000, loteMin: 20000,
      actividades: 'Cementerios parroquiales o zonales' },
    { simbolo: 'EF3', tipologia: 'Cantonal', radio: null, m2hab: 1.0, pobBase: 50000, loteMin: 50000,
      actividades: 'Parques cementerio o camposantos' },
  ],
  'Transporte': [
    { simbolo: 'ET1', tipologia: 'Zonal', radio: 3000, m2hab: 0.03, pobBase: 10000, loteMin: 300,
      actividades: 'Estacionamientos de buses urbanos y parqueaderos públicos' },
    { simbolo: 'ET2', tipologia: 'Cantonal', radio: null, m2hab: 1.0, pobBase: 50000, loteMin: 50000,
      actividades: 'Aeropuertos, estaciones de ferrocarril y terminal terrestre' },
  ],
  'Infraestructura': [
    { simbolo: 'EI1', tipologia: 'Barrial', radio: 500, m2hab: 0.2, pobBase: 1000, loteMin: 200,
      actividades: 'Baterías sanitarias y lavanderías públicas' },
    { simbolo: 'EI2', tipologia: 'Zonal', radio: null, m2hab: null, pobBase: 5000, loteMin: null,
      actividades: 'Estaciones de bombeo, tanques, subestaciones eléctricas y mercados' },
    { simbolo: 'EI3', tipologia: 'Cantonal', radio: null, m2hab: null, pobBase: 50000, loteMin: null,
      actividades: 'Plantas potabilizadoras, tratamiento de energía y camal' },
  ],
  'Especial': [
    { simbolo: 'EPZ', tipologia: 'Zonal', radio: null, m2hab: null, pobBase: 20000, loteMin: null,
      actividades: 'Talleres de maquinaria pesada, hospitales veterinarios y bodegaje' },
    { simbolo: 'EPC', tipologia: 'Cantonal', radio: null, m2hab: null, pobBase: 50000, loteMin: null,
      actividades: 'Tratamiento de desechos sólidos y líquidos, rellenos sanitarios' },
  ],
}

/** Los niveles de un uso que tienen radio, que son los que se pueden medir. */
export function nivelesMedibles(tipo: string): NivelNorma[] {
  return (NORMA[tipo] ?? []).filter((n): n is NivelNorma & { radio: number } => n.radio !== null)
}

/** El nivel de partida de un uso: el más exigente, que es el de proximidad. */
export function nivelInicial(tipo: string): NivelNorma | null {
  return nivelesMedibles(tipo)[0] ?? null
}

/** Busca un nivel por su rótulo único dentro del uso. */
export function nivelDe(tipo: string, clave: string): NivelNorma | null {
  return (NORMA[tipo] ?? []).find((n) => claveNivel(n) === clave) ?? null
}

/** Identificador estable de un nivel; el símbolo se repite en Seguridad. */
export const claveNivel = (n: NivelNorma) => `${n.simbolo}|${n.radio ?? 'x'}`

/** Cita de la norma, para que el número no viaje solo. */
export const CITA_NORMA =
  'Código Urbano de Riobamba, art. 178, tabla 3 · Registro Oficial E.E. 885, 23 may 2023'
