import { numero, porcentaje } from '../lib/format'
import type { Resumen } from '../hooks/usePuntos'

interface Props {
  resumen: Resumen
  totalCanton: number
  equipamientos: number
  equipPorVerificar: number
  /** Territorio del que hablan las cifras, p. ej. «Plataforma D». */
  ambito: string
  /** Segunda linea del ambito: superficie, barrios, lo que lo sitúe. */
  ambitoDetalle: string
  /** Vuelve al ambito de partida; null cuando ya se esta en el. */
  onQuitarFiltro: (() => void) | null
}

function Kpi({
  valor,
  rotulo,
  pie,
  tono,
}: {
  valor: string
  rotulo: string
  pie?: string
  tono?: 'ok' | 'aviso' | 'error'
}) {
  const color =
    tono === 'ok'
      ? 'var(--gr-ok)'
      : tono === 'aviso'
        ? 'var(--gr-aviso)'
        : tono === 'error'
          ? 'var(--gr-error)'
          : undefined
  return (
    <div className="gr-kpi">
      <div className="gr-kpi__valor" style={color ? { color } : undefined}>
        {valor}
      </div>
      <div className="gr-kpi__rotulo">{rotulo}</div>
      {pie && <div className="gr-kpi__pie">{pie}</div>}
    </div>
  )
}

export default function PanelKpis({
  resumen,
  totalCanton,
  equipamientos,
  equipPorVerificar,
  ambito,
  ambitoDetalle,
  onQuitarFiltro,
}: Props) {
  const pctVerificado = resumen.total ? (resumen.verificados / resumen.total) * 100 : 0
  const filtrado = resumen.total !== totalCanton

  return (
    <section aria-label="Indicadores del levantamiento">
      {/* Cinco cifras sin decir de donde son se leen como si fueran del canton
          entero. El titulo del ambito va aqui arriba, pegado a ellas, no solo
          dentro del panel de filtros donde hay que ir a buscarlo. */}
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[15px] font-bold" style={{ color: 'var(--gr-tinta)' }}>
          {ambito}
        </h2>
        <p className="gr-num text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
          {ambitoDetalle}
        </p>
        {onQuitarFiltro && (
          <button
            type="button"
            className="text-[12px] underline"
            style={{ color: 'var(--gr-info)' }}
            onClick={onQuitarFiltro}
          >
            Quitar el filtro
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <Kpi
          valor={numero(resumen.total)}
          rotulo="Registros en vista"
          pie={
            filtrado
              ? `ya en OpenStreetMap · de ${numero(totalCanton)} en el canton`
              : 'ya en OpenStreetMap · todo el canton'
          }
        />
        <Kpi
          valor={numero(resumen.verificados)}
          rotulo="Levantados en campo"
          pie={`${porcentaje(pctVerificado)} de los registros · con check_date de 12 meses o menos`}
          tono={pctVerificado >= 60 ? 'ok' : pctVerificado >= 25 ? 'aviso' : 'error'}
        />
        <Kpi
          valor={numero(resumen.pendientes)}
          rotulo="Faltan por levantar"
          pie="de los registros en vista, sin check_date o vencido"
          tono={resumen.pendientes > 0 ? 'aviso' : 'ok'}
        />
        <Kpi
          valor={porcentaje(resumen.completitudMedia)}
          rotulo="Completitud de ficha"
          pie={`${numero(resumen.incompletos)} fichas con campos clave vacios`}
        />
        <Kpi
          valor={numero(equipPorVerificar)}
          rotulo="Equipamientos por verificar"
          pie={`de ${numero(equipamientos)} del inventario del GADM`}
          tono={equipPorVerificar > 0 ? 'aviso' : 'ok'}
        />
      </div>
    </section>
  )
}
