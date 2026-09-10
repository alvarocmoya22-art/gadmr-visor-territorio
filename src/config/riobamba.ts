/**
 * Parámetros del territorio. Todo lo que dependa del cantón vive aquí:
 * cambiar de cantón debería ser cambiar este archivo y nada más.
 *
 * Valores verificados contra Nominatim el 2026-09-09.
 */

/** Relación OSM del límite administrativo del cantón Riobamba. */
export const RELACION_CANTON = 108867

/** Relación OSM del área urbana (parroquias urbanas). */
export const RELACION_URBANO = 3728588

/** Id de área de Overpass = 3.600.000.000 + id de relación. */
export const AREA_OVERPASS = 3600000000 + RELACION_CANTON

/** Envolvente del cantón [oeste, sur, este, norte] — Nominatim. */
export const BBOX_CANTON: [number, number, number, number] = [
  -78.8971487, -1.9521577, -78.3975713, -1.4625377,
]

/** Encuadre inicial del mapa: centro histórico de Riobamba. */
export const VISTA_INICIAL = {
  centro: [-78.6483, -1.6711] as [number, number],
  zoom: 13.4,
}

/** Espejos de Overpass, en orden de preferencia; se rota ante fallo o 429. */
export const ESPEJOS_OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
]

/** Umbrales de frescura del dato, en meses desde `check_date`. */
export const FRESCURA = {
  vigenteMeses: 12,
  porVencerMeses: 36,
}
