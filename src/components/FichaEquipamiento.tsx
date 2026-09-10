import { coordenada } from '../lib/format'
import { RADIO_COTEJO_M, UMBRAL_NOMBRE, type Cotejo, type EquipamientoMunicipal } from '../lib/municipal'

interface Props {
  equipamiento: EquipamientoMunicipal
  onCerrar: () => void
  onVerEnOsm: (osmId: string) => void
}

const ESTADO: Record<Cotejo['estado'], { texto: string; clase: string }> = {
  confirmado: { texto: 'Confirmado en OSM', clase: 'gr-chip--ok' },
  dudoso: { texto: 'Por verificar', clase: 'gr-chip--aviso' },
  ausente: { texto: 'Ausente de OSM', clase: 'gr-chip--error' },
  sin_nombre: { texto: 'Sin nombre municipal', clase: 'gr-chip--neutro' },
}

function explicar(c: Cotejo): string {
  switch (c.estado) {
    case 'confirmado':
      return `Coincide con «${c.osmNombre}» a ${c.distancia} m (parecido ${c.parecido.toFixed(2)}).`
    case 'dudoso':
      return c.osmNombre
        ? `Hay «${c.osmNombre}» a ${c.distancia} m, pero el nombre solo se parece ${c.parecido.toFixed(2)} (hace falta ${UMBRAL_NOMBRE}). Puede ser otro sitio, o el mismo con distinto nombre.`
        : `Hay un punto sin nombre a ${c.distancia} m. No se puede dar por confirmado.`
    case 'ausente':
      return `No hay ningun punto de OSM a menos de ${RADIO_COTEJO_M} m. Candidato claro para levantar con Every Door.`
    case 'sin_nombre':
      return 'El registro municipal no trae nombre, asi que no se puede cotejar por nombre.'
  }
}

export default function FichaEquipamiento({ equipamiento: e, onCerrar, onVerEnOsm }: Props) {
  const estado = ESTADO[e.cotejo.estado]

  return (
    <article
      className="space-y-3"
      aria-live="polite"
      style={{
        background: 'var(--gr-superficie)',
        border: '1px solid var(--gr-linea-fuerte)',
        borderRadius: 6,
        padding: '0.875rem',
      }}
    >
      <header className="flex items-start gap-2">
        <span
          aria-hidden
          className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
          style={{
            border: `2.5px solid ${
              e.cotejo.estado === 'confirmado'
                ? 'var(--gr-ok)'
                : e.cotejo.estado === 'dudoso'
                  ? 'var(--gr-aviso)'
                  : e.cotejo.estado === 'ausente'
                    ? 'var(--gr-error)'
                    : 'var(--gr-tinta-3)'
            }`,
          }}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--gr-tinta)' }}>
            {e.nombre || 'Equipamiento sin nombre'}
          </h2>
          <p className="text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
            Inventario del GADM · {e.tipo}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar la ficha"
          className="shrink-0 rounded px-1.5 text-lg leading-none"
          style={{ color: 'var(--gr-tinta-3)' }}
        >
          ×
        </button>
      </header>

      <div>
        <span className={`gr-chip ${estado.clase}`}>{estado.texto}</span>
      </div>

      <p className="gr-nota">{explicar(e.cotejo)}</p>

      <dl className="gr-ficha">
        {e.subtipo && (
          <>
            <dt>Subtipo</dt>
            <dd className="gr-num">{e.subtipo}</dd>
          </>
        )}
        <dt>Barrio</dt>
        <dd>{e.barrio ?? '—'}</dd>
        <dt>Plataforma</dt>
        <dd className="gr-num">{e.plataforma ?? 'fuera de plataforma'}</dd>
        <dt>Coordenadas (WGS 84)</dt>
        <dd className="gr-num">
          {coordenada(e.lat)} , {coordenada(e.lon)}
        </dd>
      </dl>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {e.cotejo.osmId && (
          <button
            type="button"
            className="gr-btn gr-btn--secundario"
            onClick={() => onVerEnOsm(e.cotejo.osmId as string)}
          >
            Ver el punto OSM cercano
          </button>
        )}
        <a
          className="gr-btn gr-btn--secundario"
          href={`https://www.openstreetmap.org/?mlat=${e.lat}&mlon=${e.lon}#map=19/${e.lat}/${e.lon}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Abrir esta coordenada en OSM
        </a>
        <a
          className="gr-btn gr-btn--secundario"
          href={`geo:${e.lat},${e.lon}?z=20`}
          title="Abre el punto en la app de mapas del telefono. Validar en dispositivo."
        >
          Abrir en el telefono
        </a>
      </div>
    </article>
  )
}
