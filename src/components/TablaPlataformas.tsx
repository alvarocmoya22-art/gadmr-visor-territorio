import { numero, porcentaje } from '../lib/format'
import type { AvancePlataforma } from '../lib/municipal'

interface Props {
  avance: AvancePlataforma[]
  activa: string | null
  onElegir: (clave: string | null) => void
}

/**
 * Cuántos registros hay por plataforma y cuántos faltan por verificar.
 *
 * La primera columna es el total registrado, a propósito: sin ella la tabla
 * solo enseñaba lo pendiente y se leía al revés, como si esas cifras fueran
 * todo lo que hay en el sector.
 */
export default function TablaPlataformas({ avance, activa, onElegir }: Props) {
  const orden = [...avance].sort(
    (a, b) => b.puntosOsm - b.verificados - (a.puntosOsm - a.verificados),
  )
  const maxPendiente = Math.max(1, ...orden.map((a) => a.puntosOsm - a.verificados))
  const totales = orden.reduce(
    (t, a) => ({
      registros: t.registros + a.puntosOsm,
      verificados: t.verificados + a.verificados,
      porVerificar: t.porVerificar + a.porVerificar,
    }),
    { registros: 0, verificados: 0, porVerificar: 0 },
  )

  return (
    <div className="overflow-x-auto" style={{ background: 'var(--gr-superficie)' }}>
      <table className="gr-tabla">
        <caption className="sr-only">
          Registros por plataforma y cuántos quedan pendientes de verificar en campo
        </caption>
        <thead>
          <tr>
            <th scope="col">Plat.</th>
            <th scope="col">Registros</th>
            <th scope="col">Levantados</th>
            <th scope="col">Faltan</th>
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
                    title={`${a.areaHa.toFixed(1)} ha · ${numero(a.verificados)} verificados de ${numero(a.puntosOsm)} (${porcentaje(pct)})`}
                    className="gr-num font-semibold"
                    style={{ color: 'var(--gr-info)' }}
                  >
                    {a.clave}
                  </button>
                </td>
                <td className="gr-num font-semibold" style={{ color: 'var(--gr-tinta)' }}>
                  {numero(a.puntosOsm)}
                </td>
                <td
                  className="gr-num"
                  style={{ color: a.verificados > 0 ? 'var(--gr-ok)' : 'var(--gr-tinta-3)' }}
                >
                  {numero(a.verificados)}
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {/* La barra codifica la carga real, no decora */}
                    <span
                      aria-hidden
                      className="h-1.5 rounded-sm"
                      style={{
                        width: `${Math.round((pendiente / maxPendiente) * 40)}px`,
                        minWidth: pendiente > 0 ? '2px' : '0',
                        background: 'var(--gr-s1)',
                      }}
                    />
                    <span className="gr-num">{numero(pendiente)}</span>
                  </div>
                </td>
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
        <tfoot>
          <tr>
            <th scope="row" style={{ position: 'static' }}>
              Total
            </th>
            <td className="gr-num font-semibold" style={{ color: 'var(--gr-tinta)' }}>
              {numero(totales.registros)}
            </td>
            <td
              className="gr-num"
              style={{ color: totales.verificados > 0 ? 'var(--gr-ok)' : 'var(--gr-tinta-3)' }}
            >
              {numero(totales.verificados)}
            </td>
            <td className="gr-num">{numero(totales.registros - totales.verificados)}</td>
            <td className="gr-num">{numero(totales.porVerificar)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="px-2 py-1.5 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
        <b>Registros</b>: lo que ya existe en OpenStreetMap dentro de la plataforma.{' '}
        <b>Levantados</b>: de esos, los confirmados en campo con Every Door (llevan{' '}
        <span className="gr-num">check_date</span>). <b>Faltan</b>: el resto. <b>Equip.</b>: en
        ámbar, equipamientos del inventario del GADM aún sin confirmar.
      </p>
    </div>
  )
}
