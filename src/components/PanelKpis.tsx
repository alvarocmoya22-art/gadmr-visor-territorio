import { numero, porcentaje } from '../lib/format'
import type { Resumen } from '../hooks/usePuntos'

/** Una tarjeta de la franja, tal como la arma quien la pide. */
export interface Tarjeta {
  valor: string
  rotulo: string
  pie?: string
  tono?: 'ok' | 'aviso' | 'error'
}

interface Props {
  resumen: Resumen
  totalCanton: number
  equipamientos: number
  equipPorVerificar: number
  /**
   * Cifras de lo que se este mirando ahora. Cuando llegan, mandan ellas y el
   * estado del levantamiento se reduce a una tarjeta al final.
   */
  tarjetas?: Tarjeta[]
  /** Que se esta midiendo, para rotular la franja. */
  titulo?: string
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
  tarjetas,
  titulo,
}: Props) {
  const pctVerificado = resumen.total ? (resumen.verificados / resumen.total) * 100 : 0
  const filtrado = resumen.total !== totalCanton

  /*
   * Con un analisis abierto, la franja habla de ese analisis. Pero la ultima
   * tarjeta sigue siendo la del levantamiento, y no por simetria: todas las
   * demas cifras se calculan sobre esos registros. Un 19 % de cobertura
   * significa una cosa si el dato esta verificado al 80 % y otra muy distinta
   * si lo esta al 16 %, y quien lee la franja tiene que ver las dos a la vez.
   */
  if (tarjetas && tarjetas.length > 0) {
    return (
      <section aria-label={titulo ? `Resultados: ${titulo}` : 'Resultados del analisis'}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {tarjetas.slice(0, 4).map((t) => (
            <Kpi key={t.rotulo} valor={t.valor} rotulo={t.rotulo} pie={t.pie} tono={t.tono} />
          ))}
          {/*
            Sin registros de OpenStreetMap, un «0,0 %» no dice que el dato este
            mal verificado: dice que no hay dato. Son dos cosas distintas y la
            tarjeta no debe confundirlas, menos aun cuando los espejos de
            Overpass fallan, que pasa.
          */}
          {resumen.total === 0 ? (
            <Kpi
              valor="—"
              rotulo="Dato verificado en campo"
              pie="sin registros de OpenStreetMap cargados"
            />
          ) : (
            <Kpi
              valor={porcentaje(pctVerificado)}
              rotulo="Dato verificado en campo"
              pie={`de ${numero(resumen.total)} registros en vista · de aqui sale todo lo demas`}
              tono={pctVerificado >= 60 ? 'ok' : pctVerificado >= 25 ? 'aviso' : 'error'}
            />
          )}
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Indicadores del levantamiento">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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
