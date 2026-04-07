import api from './api'
import { FazendeiroPublico, PaginatedResponse } from '../types'

// ── Busca fazendeiros com filtros opcionais ───────────────────────────────────
export async function buscarFazendeiros(filtros?: {
    username?: string
    estado?: string
    cidade?: string
    page?: number
}): Promise<PaginatedResponse<FazendeiroPublico>> {
    const response = await api.get<PaginatedResponse<FazendeiroPublico>>(
        '/busca/fazendeiros',
        { params: filtros }
    )
    return response.data
}

// ── Busca perfil público de um fazendeiro pelo username ───────────────────────
export async function buscarPerfilFazendeiro(
    username: string
): Promise<FazendeiroPublico> {
    const response = await api.get<{ data: FazendeiroPublico }>(
        `/busca/fazendeiros/${username}`
    )
    return response.data.data
}