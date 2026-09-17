import { numero } from '../lib/format'

export interface Pestana<T extends string> {
  clave: T
  rotulo: string
  /** Cifra al lado del rótulo, cuando la pestaña tiene algo que contar. */
  cuenta?: number
  /** Texto del title, para explicar qué hay dentro antes de entrar. */
  nota?: string
}

interface Props<T extends string> {
  pestanas: Pestana<T>[]
  activa: T
  onCambiar: (clave: T) => void
}

/**
 * Pestañas del panel lateral.
 *
 * El visor creció hasta tener filtros, análisis, tablas y fotografía en una
 * sola columna, y todo lo de abajo dejaba de existir para quien no llegaba
 * hasta ahí. Separarlo en pestañas no quita nada de la pantalla: lo pone
 * donde se puede encontrar.
 */
export default function Pestanas<T extends string>({ pestanas, activa, onCambiar }: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del panel"
      className="flex shrink-0 overflow-x-auto"
      style={{ borderBottom: '1px solid var(--gr-linea)' }}
    >
      {pestanas.map((p) => {
        const esta = p.clave === activa
        return (
          <button
            key={p.clave}
            type="button"
            role="tab"
            aria-selected={esta}
            title={p.nota}
            onClick={() => onCambiar(p.clave)}
            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[13px]"
            style={{
              // El subrayado marca la activa; el color solo no basta para
              // quien no distingue bien el azul del gris.
              borderBottom: `2px solid ${esta ? 'var(--gr-info)' : 'transparent'}`,
              color: esta ? 'var(--gr-tinta)' : 'var(--gr-tinta-3)',
              fontWeight: esta ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {p.rotulo}
            {p.cuenta !== undefined && (
              <span
                className="gr-num rounded px-1 text-[11px]"
                style={{
                  background: esta ? 'var(--gr-info)' : 'var(--gr-linea)',
                  color: esta ? '#ffffff' : 'var(--gr-tinta-3)',
                }}
              >
                {numero(p.cuenta)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
