import { useCallback, useEffect, useMemo, useState } from 'react'
import { obtenerPuntos, type Punto, type Resultado } from '../lib/overpass'
import type { ClaveCategoria } from '../lib/categorias'
import {
  barrioDe,
  cargarCapas,
  cotejarInventario,
  plataformaDe,
  type CapasMunicipales,
  type EquipamientoMunicipal,
} from '../lib/municipal'

export type EstadoCarga = 'cargando' | 'listo' | 'error'

export interface Filtros {
  categorias: Set<ClaveCategoria>
  /** 'todas' | 'pendientes' — pendientes = sin verificar o verificacion vencida. */
  frescura: 'todas' | 'pendientes'
  /** Solo fichas a las que les falta algun campo clave. */
  soloIncompletos: boolean
  /** Clave de plataforma, o null para todo el cantón. */
  plataforma: string | null
  /** Nombre de barrio, o null para no filtrar por barrio. */
  barrio: string | null
  texto: string
}

export const FILTROS_INICIALES: Filtros = {
  categorias: new Set(),
  frescura: 'todas',
  soloIncompletos: false,
  plataforma: null,
  barrio: null,
  texto: '',
}

export interface Resumen {
  total: number
  verificados: number
  pendientes: number
  sinNombre: number
  incompletos: number
  completitudMedia: number
  porCategoria: { clave: ClaveCategoria; total: number; verificados: number }[]
}

/**
 * Carga OSM y las capas municipales, y las cruza: cada punto de OSM recibe su
 * plataforma y cada equipamiento municipal su cotejo contra OSM.
 */
export function useTerritorio() {
  const [datos, setDatos] = useState<Resultado | null>(null)
  const [capas, setCapas] = useState<CapasMunicipales | null>(null)
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [error, setError] = useState<string | null>(null)
  const [errorCapas, setErrorCapas] = useState<string | null>(null)

  const cargar = useCallback(async (forzar = false) => {
    setEstado('cargando')
    setError(null)
    try {
      setDatos(await obtenerPuntos(forzar))
      setEstado('listo')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setEstado('error')
    }
  }, [])

  useEffect(() => {
    void cargar(false)
  }, [cargar])

  useEffect(() => {
    cargarCapas()
      .then(setCapas)
      .catch((e: unknown) => setErrorCapas(e instanceof Error ? e.message : String(e)))
  }, [])

  // Cada punto de OSM recibe la plataforma que lo contiene.
  const puntos = useMemo(() => {
    const crudos = datos?.puntos ?? []
    if (!capas) return crudos
    return crudos.map((p) => ({
      ...p,
      plataforma: plataformaDe(p.lon, p.lat, capas.plataformas),
      barrio: barrioDe(p.lon, p.lat, capas.barriosLista),
    }))
  }, [datos, capas])

  // El inventario municipal se contrasta contra los puntos ya cargados.
  const equipamientos = useMemo<EquipamientoMunicipal[]>(() => {
    if (!capas) return []
    if (puntos.length === 0) return capas.equipamientos
    return cotejarInventario(capas.equipamientos, puntos)
  }, [capas, puntos])

  return {
    datos,
    puntos,
    capas,
    equipamientos,
    estado,
    error,
    errorCapas,
    recargar: () => cargar(true),
  }
}

export function aplicarFiltros(puntos: Punto[], f: Filtros): Punto[] {
  const texto = f.texto.trim().toLowerCase()
  return puntos.filter((p) => {
    if (f.plataforma && p.plataforma !== f.plataforma) return false
    if (f.barrio && p.barrio !== f.barrio) return false
    if (f.categorias.size > 0 && !f.categorias.has(p.categoria)) return false
    if (f.frescura === 'pendientes' && p.frescura !== 'sin_verificar' && p.frescura !== 'vencido')
      return false
    if (f.soloIncompletos && p.faltantes.length === 0) return false
    if (texto) {
      const heno = `${p.nombre ?? ''} ${p.clase} ${p.tags['addr:street'] ?? ''}`.toLowerCase()
      if (!heno.includes(texto)) return false
    }
    return true
  })
}

export function filtrarEquipamientos(
  equipamientos: EquipamientoMunicipal[],
  f: Filtros,
): EquipamientoMunicipal[] {
  const texto = f.texto.trim().toLowerCase()
  return equipamientos.filter((e) => {
    if (f.plataforma && e.plataforma !== f.plataforma) return false
    if (f.barrio && e.barrioLimite !== f.barrio) return false
    if (texto && !`${e.nombre} ${e.tipo} ${e.barrio ?? ''}`.toLowerCase().includes(texto))
      return false
    return true
  })
}

export function useResumen(puntos: Punto[]): Resumen {
  return useMemo(() => {
    const total = puntos.length
    let verificados = 0
    let sinNombre = 0
    let incompletos = 0
    let sumaCompletitud = 0
    const conteo = new Map<ClaveCategoria, { total: number; verificados: number }>()

    for (const p of puntos) {
      const vigente = p.frescura === 'vigente'
      if (vigente) verificados++
      if (!p.nombre) sinNombre++
      if (p.faltantes.length > 0) incompletos++
      sumaCompletitud += p.completitud
      const c = conteo.get(p.categoria) ?? { total: 0, verificados: 0 }
      c.total++
      if (vigente) c.verificados++
      conteo.set(p.categoria, c)
    }

    return {
      total,
      verificados,
      pendientes: total - verificados,
      sinNombre,
      incompletos,
      completitudMedia: total ? (sumaCompletitud / total) * 100 : 0,
      porCategoria: [...conteo.entries()]
        .map(([clave, v]) => ({ clave, ...v }))
        .sort((a, b) => b.total - a.total),
    }
  }, [puntos])
}
