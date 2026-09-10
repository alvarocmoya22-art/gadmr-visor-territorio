import { coordenada, fecha, mesesDesde } from '../lib/format'
import { POR_CLAVE, colorSerie } from '../lib/categorias'
import type { Punto } from '../lib/overpass'

interface Props {
  punto: Punto
  onCerrar: () => void
}

const ROTULO_FRESCURA: Record<Punto['frescura'], { texto: string; clase: string }> = {
  vigente: { texto: 'Verificado', clase: 'gr-chip--ok' },
  por_vencer: { texto: 'Por vencer', clase: 'gr-chip--aviso' },
  vencido: { texto: 'Vencido', clase: 'gr-chip--error' },
  sin_verificar: { texto: 'Sin verificar', clase: 'gr-chip--neutro' },
}

/** Etiquetas que ya se muestran arriba y no se repiten en el volcado de tags. */
const YA_MOSTRADAS = new Set(['name', 'check_date', 'survey:date'])

export default function Ficha({ punto, onCerrar }: Props) {

  const cat = POR_CLAVE.get(punto.categoria)
  const estado = ROTULO_FRESCURA[punto.frescura]
  const meses = mesesDesde(punto.checkDate)
  const urlOsm = `https://www.openstreetmap.org/${punto.tipo}/${punto.osmId}`

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
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: colorSerie(punto.categoria) }}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold" style={{ color: 'var(--gr-tinta)' }}>
            {punto.nombre ?? 'Sin nombre registrado'}
          </h2>
          <p className="gr-num text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
            {cat?.rotulo} · {punto.clase}
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

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`gr-chip ${estado.clase}`}>{estado.texto}</span>
        <span className="gr-num text-[12px]" style={{ color: 'var(--gr-tinta-3)' }}>
          {punto.checkDate
            ? `check_date ${fecha(punto.checkDate)}${meses !== null ? ` · ${meses} meses` : ''}`
            : 'sin check_date en OSM'}
        </span>
      </div>

      {punto.faltantes.length > 0 && (
        <p className="gr-nota gr-nota--aviso">
          Faltan campos clave de esta categoria:{' '}
          <span className="gr-num">{punto.faltantes.join(', ')}</span>. Son los que Every Door
          pedira al tecnico en campo.
        </p>
      )}

      <dl className="gr-ficha">
        <dt>Coordenadas (WGS 84)</dt>
        <dd className="gr-num">
          {coordenada(punto.lat)} , {coordenada(punto.lon)}
        </dd>
        {Object.entries(punto.tags)
          .filter(([k]) => !YA_MOSTRADAS.has(k))
          .map(([k, v]) => (
            <div key={k}>
              <dt className="gr-num">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <a className="gr-btn gr-btn--secundario" href={urlOsm} target="_blank" rel="noreferrer noopener">
          Ver en OpenStreetMap
        </a>
        <a
          className="gr-btn gr-btn--secundario"
          href={`geo:${punto.lat},${punto.lon}?z=20`}
          title="Abre el punto en la app de mapas del telefono. En Android, Every Door aparece entre las opciones si esta instalado. Validar en dispositivo."
        >
          Abrir en el telefono
        </a>
      </div>
    </article>
  )
}
