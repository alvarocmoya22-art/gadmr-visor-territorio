interface Props {
  /** Territorio en vista, p. ej. «Plataforma D». */
  ambito: string
  /** Lo que lo sitúa: superficie, barrios, habitantes. */
  detalle: string
  /** Vuelve al ámbito de partida; null cuando ya se está en él. */
  onQuitarFiltro: (() => void) | null
}

/**
 * Qué territorio se está mirando, encima del mapa.
 *
 * Va arriba y no con las cifras porque es lo primero que hay que saber para
 * leer cualquier cosa de la pantalla: el mapa, las tarjetas y el panel hablan
 * todos de este recorte. Ocupa una línea, que es lo que cuesta no equivocarse.
 */
export default function CabeceraAmbito({ ambito, detalle, onQuitarFiltro }: Props) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--gr-tinta)' }}>
        {ambito}
      </h2>
      <p className="gr-num text-[13px]" style={{ color: 'var(--gr-tinta-3)' }}>
        {detalle}
      </p>
      {onQuitarFiltro && (
        <button
          type="button"
          className="text-[13px] underline"
          style={{ color: 'var(--gr-info)' }}
          onClick={onQuitarFiltro}
        >
          Quitar el filtro
        </button>
      )}
    </div>
  )
}
