/**
 * Edificación recién traída de OpenStreetMap, para la capa en tres dimensiones.
 *
 * El archivo `public/datos/edificios.geojson` es una foto del día en que se
 * corrió `scripts/edificios_osm.py`, y el levantamiento en campo añade
 * edificación todas las semanas: entre la extracción y hoy ya hay dos mil
 * edificios de diferencia. Así que al encender la capa se pide la versión viva.
 *
 * **La foto se dibuja primero y la consulta va por detrás.** Son cinco megas y
 * unos segundos; hacer esperar a quien enciende la capa para enseñarle casi lo
 * mismo sería un mal cambio. Cuando llega lo nuevo, se sustituye sin que nadie
 * tenga que pedir nada.
 *
 * Se guarda en memoria mientras dure la sesión y no en `localStorage`: el
 * GeoJSON ronda los dos megas y competiría con la caché de los registros por
 * una cuota que no da para los dos. Apagar y encender la capa no vuelve a
 * descargar; recargar la página, sí, y eso es justo lo que se quiere.
 */
import { ESPEJOS_OVERPASS } from "../config/riobamba";
import { enPoligono, type Anillo } from "./geo";

/** Altura de un piso, en metros. La planta corriente en Riobamba. */
const METROS_POR_PISO = 3;

/**
 * Altura de un edificio sin dato.
 *
 * El mínimo creíble a propósito: así lo que no se sabe se ve raso y no compite
 * con lo que sí está medido.
 */
const ALTURA_SIN_DATO = 3;

export interface EdificacionViva {
  geo: GeoJSON.FeatureCollection;
  /** Momento en que OpenStreetMap cerró la base que respondió. */
  selloOsm: string;
  total: number;
  /** Cuántos traen altura o pisos declarados. */
  medidos: number;
}

/** Mientras dure la sesión; recargar la página vuelve a preguntar. */
let enMemoria: EdificacionViva | null = null;
let enCurso: Promise<EdificacionViva | null> | null = null;

interface ElementoOsm {
  type: string;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

/** Metros de alto declarados, y si son medida o relleno. */
function alturaDe(tags: Record<string, string>): {
  altura: number;
  medido: boolean;
} {
  const bruto = (tags.height ?? "").trim().replace(",", ".");
  if (bruto) {
    // «12 m» y «12» son los dos corrientes; lo demás no se adivina.
    const n = Number.parseFloat(bruto);
    if (Number.isFinite(n) && n >= 1 && n <= 200) {
      return { altura: Math.round(n * 10) / 10, medido: true };
    }
  }
  const pisos = Number.parseFloat(
    (tags["building:levels"] ?? "").trim().replace(",", "."),
  );
  if (Number.isFinite(pisos) && pisos >= 1 && pisos <= 60) {
    return {
      altura: Math.round(pisos * METROS_POR_PISO * 10) / 10,
      medido: true,
    };
  }
  return { altura: ALTURA_SIN_DATO, medido: false };
}

/**
 * Pregunta a Overpass por la edificación del área urbana.
 *
 * `piezas` son los polígonos del urbano: la consulta va por caja envolvente,
 * que es lo único que Overpass entiende barato, y el recorte fino se hace aquí
 * con el centro de cada huella. Lo que cae entre la caja y las plataformas es
 * suelo rural que esta capa no dibuja.
 */
async function consultar(piezas: Anillo[][]): Promise<EdificacionViva | null> {
  let oeste = Infinity;
  let sur = Infinity;
  let este = -Infinity;
  let norte = -Infinity;
  for (const poly of piezas) {
    for (const [x, y] of poly[0] ?? []) {
      if (x < oeste) oeste = x;
      if (x > este) este = x;
      if (y < sur) sur = y;
      if (y > norte) norte = y;
    }
  }
  if (!Number.isFinite(oeste)) return null;

  const caja = `${sur.toFixed(5)},${oeste.toFixed(5)},${norte.toFixed(5)},${este.toFixed(5)}`;
  const consulta = `[out:json][timeout:180];way["building"](${caja});out geom;`;

  /*
   * Dos vueltas por los espejos, con una pausa entre medias. Un 504 de Overpass
   * es corriente y pasajero —el servidor estaba ocupado, no roto— y rendirse al
   * primero deja la capa con la foto vieja por nada.
   */
  for (const vuelta of [0, 1]) {
    if (vuelta > 0) await new Promise((r) => setTimeout(r, 4000));
    for (const espejo of ESPEJOS_OVERPASS) {
      try {
        const resp = await fetch(espejo, { method: "POST", body: consulta });
        if (!resp.ok) continue;
        const datos = (await resp.json()) as {
          elements?: ElementoOsm[];
          osm3s?: { timestamp_osm_base?: string };
        };
        const rasgos: GeoJSON.Feature[] = [];
        let medidos = 0;
        for (const e of datos.elements ?? []) {
          const puntos = e.geometry;
          if (!puntos || puntos.length < 4) continue;
          const anillo = puntos.map((p) => [p.lon, p.lat] as [number, number]);
          if (
            anillo[0][0] !== anillo[anillo.length - 1][0] ||
            anillo[0][1] !== anillo[anillo.length - 1][1]
          ) {
            anillo.push(anillo[0]);
          }
          const cx =
            anillo.slice(0, -1).reduce((s, p) => s + p[0], 0) /
            (anillo.length - 1);
          const cy =
            anillo.slice(0, -1).reduce((s, p) => s + p[1], 0) /
            (anillo.length - 1);
          if (!piezas.some((poly) => enPoligono(cx, cy, poly))) continue;

          const { altura, medido } = alturaDe(e.tags ?? {});
          if (medido) medidos++;
          rasgos.push({
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [anillo] },
            properties: { altura, medido, clase: e.tags?.building ?? "yes" },
          });
        }
        if (rasgos.length === 0) continue;
        return {
          geo: { type: "FeatureCollection", features: rasgos },
          selloOsm: datos.osm3s?.timestamp_osm_base ?? "",
          total: rasgos.length,
          medidos,
        };
      } catch {
        // Espejo caido o sin respuesta: se prueba el siguiente.
      }
    }
  }
  return null;
}

/**
 * La edificación viva, o null si ningún espejo responde.
 *
 * Que devuelva null no es un problema que haya que anunciar: la capa ya está
 * dibujada con la foto del repositorio, que sigue siendo buena.
 */
export function edificacionViva(
  piezas: Anillo[][],
): Promise<EdificacionViva | null> {
  if (enMemoria) return Promise.resolve(enMemoria);
  if (enCurso) return enCurso;
  enCurso = consultar(piezas)
    .then((r) => {
      if (r) enMemoria = r;
      return r;
    })
    .finally(() => {
      enCurso = null;
    });
  return enCurso;
}
