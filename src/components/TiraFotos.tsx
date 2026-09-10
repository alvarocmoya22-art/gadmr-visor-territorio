import { useEffect, useState } from 'react'
import { fecha } from '../lib/format'
import type { FotosCalle } from '../hooks/useFotosCalle'
import type { Foto } from '../lib/mapillary'

interface Props extends FotosCalle {
  radioM?: number
  /** Avisa que foto se esta viendo, para marcarla en el mapa. */
  onFotoActiva?: (foto: Foto | null) => void
  /** Foto concreta a mostrar, p. ej. la que se pincho en el mapa. */
  idPreferido?: string | null
}

/**
 * Vista de calle del panel.
 *
 * Por defecto muestra la fotografia como imagen fija, y el recorrido navegable
 * queda a un clic. Es deliberado: el «embed» de Mapillary carga sus controles
 * enseguida pero a veces deja el lienzo en negro varios segundos o no llega a
 * pintar, mientras que la imagen directa se ve siempre. Primero ver algo;
 * explorar, si hace falta.
 */
export default function TiraFotos({
  fotos,
  cargando,
  error,
  faltaToken,
  idRespaldo,
  radioM = 60,
  onFotoActiva,
  idPreferido,
}: Props) {
  const [elegida, setElegida] = useState<string | null>(null)
  const [explorando, setExplorando] = useState(false)

  // Al cambiar de punto se vuelve a la imagen fija y a la foto que toque: la
  // que se pincho en el mapa si la hay, y si no la mas cercana.
  useEffect(() => {
    const preferida = idPreferido && fotos.some((f) => f.id === idPreferido) ? idPreferido : null
    setElegida(preferida ?? fotos[0]?.id ?? null)
    setExplorando(false)
  }, [fotos, idPreferido])

  const activa = fotos.find((f) => f.id === elegida) ?? fotos[0] ?? null

  useEffect(() => {
    onFotoActiva?.(activa)
  }, [activa, onFotoActiva])
  // Sin datos de la Graph API todavia se puede mostrar el recorrido: las
  // teselas del mapa traen el id de la foto mas cercana.
  const idVisor = activa?.id ?? idRespaldo
  const soloRespaldo = !activa && !!idRespaldo
  // Sin imagen directa no queda mas remedio que ir al visor incrustado.
  const imagen = activa?.media ?? activa?.miniatura ?? null
  const mostrarVisor = explorando || (!imagen && !!idVisor)

  return (
    <div>
      <p className="gr-eyebrow mb-1.5">Vista de calle · Mapillary</p>

      {cargando && !faltaToken && (
        <p className="text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
          Consultando fotos a menos de {radioM} m…
        </p>
      )}

      {faltaToken && (
        <p className="gr-nota gr-nota--aviso">
          Falta <span className="gr-num">VITE_MAPILLARY_TOKEN</span> en{' '}
          <span className="gr-num">.env.local</span>. Es la fuente de fotografia del visor: sin ese
          token no hay vista de calle.
        </p>
      )}

      {!cargando && !faltaToken && !error && fotos.length === 0 && !idRespaldo && (
        <p className="gr-nota">
          Sin fotos a menos de {radioM} m. Acerque el mapa a una calle recorrida.
        </p>
      )}

      {error && !idRespaldo && (
        <p className="gr-nota gr-nota--alerta" role="alert">
          {error}
        </p>
      )}

      {soloRespaldo && (
        <p className="gr-nota gr-nota--aviso mb-1.5">
          Imagen tomada de las teselas del mapa. La Graph API de Mapillary no devolvio resultados:
          revise que la aplicacion tenga permiso de lectura.
        </p>
      )}

      {(imagen || idVisor) && (
        <figure className="m-0">
          <div
            className="relative overflow-hidden rounded"
            style={{ border: '1px solid var(--gr-linea-fuerte)', background: '#000' }}
          >
            {mostrarVisor && idVisor ? (
              <iframe
                key={idVisor}
                src={`https://www.mapillary.com/embed?image_key=${idVisor}&style=photo`}
                title="Recorrido fotografico de Mapillary junto al punto"
                width="100%"
                height={230}
                style={{ border: 0, display: 'block' }}
                allowFullScreen
              />
            ) : (
              <img
                src={imagen ?? undefined}
                alt={
                  activa
                    ? `Vista de calle a ${activa.distancia} metros del punto, tomada el ${fecha(activa.fecha)}`
                    : 'Vista de calle junto al punto'
                }
                width="100%"
                height={230}
                loading="lazy"
                style={{ display: 'block', height: 230, objectFit: 'cover', width: '100%' }}
              />
            )}
          </div>

          <figcaption
            className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]"
            style={{ color: 'var(--gr-tinta-3)' }}
          >
            {activa && (
              <span className="gr-num">
                a {activa.distancia} m · {fecha(activa.fecha)}
              </span>
            )}
            {imagen && idVisor && (
              <button
                type="button"
                onClick={() => setExplorando((v) => !v)}
                className="underline"
                style={{ color: 'var(--gr-info)' }}
              >
                {explorando ? 'Ver la foto fija' : 'Recorrer la calle'}
              </button>
            )}
            <a
              href={`https://www.mapillary.com/app/?pKey=${idVisor}&focus=photo`}
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: 'var(--gr-info)' }}
            >
              Abrir en Mapillary
            </a>
            <span>CC-BY-SA-4.0</span>
          </figcaption>
        </figure>
      )}

      {fotos.length > 1 && (
        <ul className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
          {fotos.map((f) => {
            const esActiva = f.id === activa?.id
            return (
              <li key={f.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setElegida(f.id)
                    setExplorando(false)
                  }}
                  aria-pressed={esActiva}
                  title={`A ${f.distancia} m · ${fecha(f.fecha)}`}
                  className="block rounded"
                  style={{
                    border: esActiva
                      ? '2px solid var(--gr-info)'
                      : '1px solid var(--gr-linea-fuerte)',
                    padding: 0,
                    lineHeight: 0,
                  }}
                >
                  <img
                    src={f.miniatura}
                    alt={`Fotografia a ${f.distancia} metros, del ${fecha(f.fecha)}`}
                    width={72}
                    height={54}
                    loading="lazy"
                    style={{ objectFit: 'cover', display: 'block', borderRadius: 2 }}
                  />
                </button>
                <span
                  className="gr-num mt-0.5 block text-center text-[10px]"
                  style={{ color: 'var(--gr-tinta-3)' }}
                >
                  {f.distancia} m
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
