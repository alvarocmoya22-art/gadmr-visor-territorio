/**
 * `@mapbox/shp-write` no trae tipos. Se declara solo lo que se usa aquí,
 * comprobado contra `node_modules/@mapbox/shp-write/src/zip.js`.
 */
declare module '@mapbox/shp-write' {
  interface OpcionesZip {
    /** Carpeta dentro del ZIP. */
    folder?: string
    /** Contenido del .prj; por defecto WGS84. */
    prj?: string
    /** Nombre del archivo por tipo de geometría: { point: 'puntos' }. */
    types?: Record<string, string>
    /** 'blob', 'base64', 'uint8array'… (tipos de JSZip). */
    outputType?: string
    compression?: string
  }

  export function zip(
    gj: GeoJSON.FeatureCollection,
    options?: OpcionesZip,
  ): Promise<Blob | string | Uint8Array>
}
