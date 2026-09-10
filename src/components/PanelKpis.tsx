import { numero, porcentaje } from '../lib/format'
import type { Resumen } from '../hooks/usePuntos'

interface Props {
  resumen: Resumen
  totalCanton: number
  equipamientos: number
  equipPorVerificar: number
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
}: Props) {
  const pctVerificado = resumen.total ? (resumen.verificados / resumen.total) * 100 : 0
  const filtrado = resumen.total !== totalCanton

  return (
    <section aria-label="Indicadores del levantamiento">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <Kpi
          valor={numero(resumen.total)}
          rotulo="Puntos en vista"
          pie={filtrado ? `de ${numero(totalCanton)} en el canton` : 'todo el canton'}
        />
        <Kpi
          valor={porcentaje(pctVerificado)}
          rotulo="Verificados en campo"
          pie={`${numero(resumen.verificados)} con check_date de 12 meses o menos`}
          tono={pctVerificado >= 60 ? 'ok' : pctVerificado >= 25 ? 'aviso' : 'error'}
        />
        <Kpi
          valor={numero(resumen.pendientes)}
          rotulo="Cola de campo"
          pie="sin verificar o verificacion vencida"
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
