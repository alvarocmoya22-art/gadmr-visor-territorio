import { useEffect, useMemo, useRef, useState } from 'react'
import { buscarCalles, cargarCalles, type Calle } from '../lib/calles'
import { numero } from '../lib/format'

interface Props {
  /** Calle elegida; el mapa la encuadra y la marca. */
  elegida: Calle | null
  onElegir: (calle: Calle | null) => void
  /** Filtra el tablero por una de las plataformas de la calle. */
  onIrAPlataforma: (clave: string) => void
}

/**
 * Buscador de calles: al escribir un nombre dice por qué plataformas pasa.
 *
 * Muchas calles cruzan varias, así que se listan todas en vez de elegir una:
 * decir que la Primera Constituyente «es de la K» seria falso, pasa por cinco.
 */
export default function BuscadorCalles({ elegida, onElegir, onIrAPlataforma }: Props) {
  const [calles, setCalles] = useState<Calle[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(0)
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    cargarCalles(ctrl.signal)
      .then((i) => setCalles(i.calles))
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : String(e))
      })
    return () => ctrl.abort()
  }, [])

  // Cerrar las sugerencias al pulsar fuera
  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  const sugerencias = useMemo(
    () => (calles ? buscarCalles(calles, texto) : []),
    [calles, texto],
  )

  const elegir = (c: Calle) => {
    onElegir(c)
    setTexto(c.nombre)
    setAbierto(false)
  }

  const teclado = (e: React.KeyboardEvent) => {
    if (!abierto || sugerencias.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setResaltado((r) => (r + 1) % sugerencias.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setResaltado((r) => (r - 1 + sugerencias.length) % sugerencias.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      elegir(sugerencias[resaltado] ?? sugerencias[0])
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  const campo = {
    background: 'var(--gr-superficie)',
    borderColor: 'var(--gr-linea-fuerte)',
    color: 'var(--gr-tinta)',
  }

  return (
    <div ref={contenedor} className="relative">
      <label htmlFor="buscar-calle" className="gr-eyebrow mb-1.5">
        Buscar calle
      </label>
      <input
        id="buscar-calle"
        type="search"
        value={texto}
        disabled={!calles && !error}
        onChange={(e) => {
          setTexto(e.target.value)
          setAbierto(true)
          setResaltado(0)
          if (!e.target.value) onElegir(null)
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={teclado}
        placeholder={calles ? 'Nombre de la calle…' : 'Cargando calles…'}
        className="w-full rounded border px-2 py-1.5 text-sm"
        style={campo}
        role="combobox"
        aria-expanded={abierto && sugerencias.length > 0}
        aria-controls="lista-calles"
        autoComplete="off"
      />

      {error && (
        <p className="gr-nota gr-nota--alerta mt-1.5" role="alert">
          {error}
        </p>
      )}

      {abierto && sugerencias.length > 0 && (
        <ul
          id="lista-calles"
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded shadow-lg"
          style={{ background: 'var(--gr-superficie)', border: '1px solid var(--gr-linea-fuerte)' }}
        >
          {sugerencias.map((c, i) => (
            <li key={c.nombre} role="option" aria-selected={i === resaltado}>
              <button
                type="button"
                onMouseEnter={() => setResaltado(i)}
                onClick={() => elegir(c)}
                className="block w-full px-2 py-1.5 text-left text-[13px]"
                style={{ background: i === resaltado ? 'var(--gr-azul-100)' : 'transparent' }}
              >
                <span className="block truncate" style={{ color: 'var(--gr-tinta)' }}>
                  {c.nombre}
                </span>
                <span className="gr-num block text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                  {c.plataformas.length > 0
                    ? `plataforma${c.plataformas.length > 1 ? 's' : ''} ${c.plataformas.join(', ')}`
                    : 'fuera de plataforma'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {elegida && (
        <div
          className="mt-2 rounded p-2"
          style={{ background: 'var(--gr-superficie)', border: '1px solid var(--gr-linea-fuerte)' }}
        >
          <p className="text-[13px] font-semibold" style={{ color: 'var(--gr-tinta)' }}>
            {elegida.nombre}
          </p>

          {elegida.plataformas.length > 0 ? (
            <>
              <p className="mt-1 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
                {elegida.plataformas.length > 1
                  ? `Cruza ${numero(elegida.plataformas.length)} plataformas. Pulse una para filtrar:`
                  : 'Pertenece a la plataforma:'}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {elegida.plataformas.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onIrAPlataforma(p)}
                    className="gr-btn gr-btn--secundario"
                    style={{ minHeight: 26, padding: '0.1rem 0.5rem' }}
                    title={`Filtrar el tablero por la plataforma ${p}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="gr-nota mt-1">
              Esta calle queda fuera de las plataformas: las 18 cubren el área urbana, no el
              territorio rural del cantón.
            </p>
          )}

          {elegida.barrios.length > 0 && (
            <p className="mt-1.5 text-[11px]" style={{ color: 'var(--gr-tinta-3)' }}>
              Barrios: {elegida.barrios.slice(0, 4).join(', ')}
              {elegida.barrios.length > 4 ? ` y ${elegida.barrios.length - 4} más` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
