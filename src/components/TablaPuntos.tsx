import { useMemo, useState } from 'react'
import { colorSerie, POR_CLAVE } from '../lib/categorias'
import { fecha, numero } from '../lib/format'
import type { Punto } from '../lib/overpass'

interface Props {
  puntos: Punto[]
  seleccionadoId: string | null
  onSeleccionar: (id: string) => void
}

const PAGINA = 60

/**
 * Alternativa textual real del mapa: los mismos puntos, navegables por teclado.
 * Ordena primero lo que falta por levantar, que es el uso de gestion.
 */
export default function TablaPuntos({ puntos, seleccionadoId, onSeleccionar }: Props) {
  const [visibles, setVisibles] = useState(PAGINA)

  const ordenados = useMemo(() => {
    const peso: Record<Punto['frescura'], number> = {
      sin_verificar: 0,
      vencido: 1,
      por_vencer: 2,
      vigente: 3,
    }
    return [...puntos].sort(
      (a, b) =>
        peso[a.frescura] - peso[b.frescura] ||
        b.faltantes.length - a.faltantes.length ||
        (a.nombre ?? '￿').localeCompare(b.nombre ?? '￿', 'es-EC'),
    )
  }, [puntos])

  if (puntos.length === 0) {
    return (
      <p className="gr-nota">
        Ningun punto cumple los filtros aplicados. Quite alguna condicion para volver a ver datos.
      </p>
    )
  }

  return (
    <div>
      <div className="max-h-[46vh] overflow-auto" style={{ background: 'var(--gr-superficie)' }}>
        <table className="gr-tabla">
          <caption className="sr-only">
            Puntos levantados, ordenados por prioridad de trabajo de campo
          </caption>
          <thead>
            <tr>
              <th scope="col">Punto</th>
              <th scope="col">Estado</th>
              <th scope="col">Verificado</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.slice(0, visibles).map((p) => {
              const activo = p.id === seleccionadoId
              return (
                <tr key={p.id} style={activo ? { background: 'var(--gr-azul-100)' } : undefined}>
                  <td>
                    <button
                      type="button"
                      onClick={() => onSeleccionar(p.id)}
                      className="flex w-full items-start gap-1.5 text-left"
                      aria-current={activo ? 'true' : undefined}
                    >
                      <span
                        aria-hidden
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: colorSerie(p.categoria) }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate" style={{ color: 'var(--gr-tinta)' }}>
                          {p.nombre ?? 'Sin nombre'}
                        </span>
                        <span className="gr-num block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                          {POR_CLAVE.get(p.categoria)?.rotulo} · {p.clase}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td>
                    {p.faltantes.length > 0 ? (
                      <span className="gr-chip gr-chip--aviso">
                        faltan {numero(p.faltantes.length)}
                      </span>
                    ) : (
                      <span className="gr-chip gr-chip--ok">completa</span>
                    )}
                  </td>
                  <td className="gr-num whitespace-nowrap">{fecha(p.checkDate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {visibles < ordenados.length && (
        <button
          type="button"
          className="gr-btn gr-btn--secundario mt-2 w-full"
          onClick={() => setVisibles((v) => v + PAGINA)}
        >
          Ver {numero(Math.min(PAGINA, ordenados.length - visibles))} mas · quedan{' '}
          {numero(ordenados.length - visibles)}
        </button>
      )}
    </div>
  )
}
