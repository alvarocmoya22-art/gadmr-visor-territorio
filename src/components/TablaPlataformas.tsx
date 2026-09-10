import { numero, porcentaje } from '../lib/format'
import type { AvancePlataforma } from '../lib/municipal'

interface Props {
  avance: AvancePlataforma[]
  activa: string | null
  onElegir: (clave: string | null) => void
}

/**
 * Avance por plataforma: la unidad con la que se reparte el trabajo de campo.
 * Ordena por lo que falta, no por el nombre del sector.
 */
export default function TablaPlataformas({ avance, activa, onElegir }: Props) {
  const orden = [...avance].sort(
    (a, b) => b.puntosOsm - b.verificados - (a.puntosOsm - a.verificados),
  )
  const maxPendiente = Math.max(1, ...orden.map((a) => a.puntosOsm - a.verificados))

  return (
    <div className="overflow-x-auto" style={{ background: 'var(--gr-superficie)' }}>
      <table className="gr-tabla">
        <caption className="sr-only">
          Avance del levantamiento por plataforma, de mayor a menor carga pendiente
        </caption>
        <thead>
          <tr>
            <th scope="col">Plat.</th>
            <th scope="col">Pendiente</th>
            <th scope="col">Verif.</th>
            <th scope="col">Equip.</th>
          </tr>
        </thead>
        <tbody>
          {orden.map((a) => {
            const pendiente = a.puntosOsm - a.verificados
            const esActiva = a.clave === activa
            const pct = a.puntosOsm ? (a.verificados / a.puntosOsm) * 100 : 0
            return (
              <tr key={a.clave} style={esActiva ? { background: 'var(--gr-azul-100)' } : undefined}>
                <td>
                  <button
                    type="button"
                    onClick={() => onElegir(esActiva ? null : a.clave)}
                    aria-pressed={esActiva}
                    title={`${a.areaHa.toFixed(1)} ha · ${porcentaje(pct)} verificado`}
                    className="gr-num font-semibold"
                    style={{ color: 'var(--gr-info)' }}
                  >
                    {a.clave}
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {/* La barra codifica la carga real, no decora */}
                    <span
                      aria-hidden
                      className="h-1.5 rounded-sm"
                      style={{
                        width: `${Math.round((pendiente / maxPendiente) * 46)}px`,
                        minWidth: pendiente > 0 ? '2px' : '0',
                        background: 'var(--gr-s1)',
                      }}
                    />
                    <span className="gr-num">{numero(pendiente)}</span>
                  </div>
                </td>
                <td className="gr-num">{numero(a.verificados)}</td>
                <td className="gr-num">
                  {a.porVerificar > 0 ? (
                    <span className="gr-chip gr-chip--aviso">{numero(a.porVerificar)}</span>
                  ) : (
                    <span style={{ color: 'var(--gr-tinta-3)' }}>{numero(a.equipamientos)}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="px-2 py-1.5 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
        «Equip.» resalta en ámbar los equipamientos municipales aún no confirmados en OSM.
      </p>
    </div>
  )
}
