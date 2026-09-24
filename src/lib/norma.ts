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
 * visor, así que estas cifras no son una aproximación: son el criterio con el
 * que la ordenanza manda evaluar lo ya construido.
 *
 * Los niveles con `radio: null` son los que la tabla deja en «---». No es que
 * falte el dato: son equipamientos de alcance cantonal, que sirven a toda la
 * ciudad y por eso no tienen área de influencia local. Medir su cobertura con
 * un radio inventado daría un número sin respaldo, así que no se ofrecen.
 */

/** Una fila de la tabla 3, con lo que hace falta para medir cobertura. */
export interface NivelNorma {
  /** Simbología de la ordenanza: EE1, ES2, ED1… */
  simbolo: string
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
   * Subtipos del inventario municipal que pertenecen a este nivel. Cuando
   * está, solo esos equipamientos cuentan: el radio barrial de 400 m es de la
   * escuela, no de la universidad, y mezclarlos falsea la cobertura.
   */
  subtipos?: string[]
  /** Clases de OSM equivalentes, para cuando se cuenta también esa fuente. */
  clasesOsm?: string[]
}

/**
 * Niveles por tipo del inventario del GADM.
 *
 * El orden es el de la tabla: barrial, zonal, cantonal.
 */
export const NORMA: Record<string, NivelNorma[]> = {
  educativo: [
    {
      simbolo: 'EE1',
      tipologia: 'Barrial',
      radio: 400,
      m2hab: 0.8,
      pobBase: 1000,
      loteMin: 800,
      actividades: 'Escolar (nivel básico) y preescolar',
      subtipos: ['school', 'kindergarten'],
      clasesOsm: ['amenity=school', 'amenity=kindergarten'],
    },
    {
      simbolo: 'EE2',
      tipologia: 'Zonal',
      radio: 2000,
      m2hab: 1.0,
      pobBase: 10000,
      loteMin: 10000,
      actividades: 'Colegios secundarios, unidades educativas e institutos superiores',
      subtipos: ['college'],
      clasesOsm: ['amenity=college'],
    },
    {
      simbolo: 'EE3',
      tipologia: 'Cantonal',
      radio: null,
      m2hab: 1.0,
      pobBase: 50000,
      loteMin: 50000,
      actividades: 'Universidades y escuelas politécnicas',
      subtipos: ['university'],
      clasesOsm: ['amenity=university'],
    },
  ],
  salud: [
    {
      simbolo: 'ES1',
      tipologia: 'Barrial',
      radio: 800,
      m2hab: 0.15,
      pobBase: 2000,
      loteMin: 300,
      actividades: 'Subcentros de salud',
    },
    {
      simbolo: 'ES2',
      tipologia: 'Zonal',
      radio: 2000,
      m2hab: 0.125,
      pobBase: 20000,
      loteMin: 2500,
      actividades: 'Centros de salud, hospital del día y centros de rehabilitación',
    },
    {
      simbolo: 'ES3',
      tipologia: 'Cantonal',
      radio: null,
      m2hab: 0.2,
      pobBase: 50000,
      loteMin: 10000,
      actividades: 'Clínicas, consultorios y hospital regional',
    },
  ],
  recreativo: [
    {
      simbolo: 'ED1',
      tipologia: 'Barrial',
      radio: 400,
      m2hab: 0.3,
      pobBase: 1000,
      loteMin: 300,
      actividades: 'Parques infantiles, parque barrial y de recreación pasiva',
    },
    {
      simbolo: 'ED2',
      tipologia: 'Zonal',
      radio: 3000,
      m2hab: 0.5,
      pobBase: 20000,
      loteMin: 10000,
      actividades: 'Canchas deportivas, gimnasios, coliseos, piscinas y parque zonal',
    },
    {
      simbolo: 'ED3',
      tipologia: 'Cantonal',
      radio: null,
      m2hab: 1.0,
      pobBase: 50000,
      loteMin: 50000,
      actividades: 'Parque de ciudad, estadios y parques de diversión',
    },
  ],
  'religioso / cultura': [
    {
      simbolo: 'EC1',
      tipologia: 'Barrial',
      radio: 400,
      m2hab: 0.15,
      pobBase: 2000,
      loteMin: 300,
      actividades: 'Casas comunales y bibliotecas barriales',
    },
    {
      simbolo: 'ER2 / EC2',
      tipologia: 'Zonal',
      radio: 2000,
      m2hab: 0.2,
      pobBase: 10000,
      loteMin: 2000,
      actividades: 'Iglesias hasta 500 puestos, templos, teatros, museos y centros culturales',
    },
    {
      simbolo: 'ER3 / EC3',
      tipologia: 'Cantonal',
      radio: null,
      m2hab: 0.25,
      pobBase: 20000,
      loteMin: 5000,
      actividades: 'Catedral, conventos, casas de la cultura y cinematecas',
    },
  ],
  cultura: [
    {
      simbolo: 'EC1',
      tipologia: 'Barrial',
      radio: 400,
      m2hab: 0.15,
      pobBase: 2000,
      loteMin: 300,
      actividades: 'Casas comunales y bibliotecas barriales',
    },
    {
      simbolo: 'EC2',
      tipologia: 'Zonal',
      radio: 2000,
      m2hab: 0.2,
      pobBase: 10000,
      loteMin: 2000,
      actividades: 'Teatros, auditorios, cines, museos y centros culturales',
    },
  ],
  administrativo: [
    {
      simbolo: 'EG1',
      tipologia: 'Zonal',
      radio: 400,
      m2hab: 0.1,
      pobBase: 1000,
      loteMin: 100,
      actividades: 'Unidad de vigilancia de policía (UPC) y control ambiental',
    },
    {
      simbolo: 'EG1',
      tipologia: 'Zonal',
      radio: 2000,
      m2hab: 0.1,
      pobBase: 5000,
      loteMin: 500,
      actividades: 'Estación de bomberos',
    },
    {
      simbolo: 'EA1',
      tipologia: 'Zonal',
      radio: null,
      m2hab: 0.03,
      pobBase: 10000,
      loteMin: 300,
      actividades: 'Correos, agencias municipales y oficinas de servicios públicos',
    },
  ],
}

/** Los niveles de un tipo que tienen radio, que son los que se pueden medir. */
export function nivelesMedibles(tipo: string): NivelNorma[] {
  return (NORMA[tipo] ?? []).filter((n): n is NivelNorma & { radio: number } => n.radio !== null)
}

/** El nivel de partida de un tipo: el más exigente, que es el de proximidad. */
export function nivelInicial(tipo: string): NivelNorma | null {
  return nivelesMedibles(tipo)[0] ?? null
}

/** Busca un nivel por su rótulo único dentro del tipo. */
export function nivelDe(tipo: string, clave: string): NivelNorma | null {
  return (NORMA[tipo] ?? []).find((n) => claveNivel(n) === clave) ?? null
}

/** Identificador estable de un nivel; el símbolo se repite en administrativo. */
export const claveNivel = (n: NivelNorma) => `${n.simbolo}|${n.radio ?? 'x'}`

/** Cita de la norma, para que el número no viaje solo. */
export const CITA_NORMA =
  'Código Urbano de Riobamba, art. 178, tabla 3 · Registro Oficial E.E. 885, 23 may 2023'
