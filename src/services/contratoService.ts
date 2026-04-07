import api from './api'
import { Contrato } from '../types'

// ── Lista contratos do consultor ──────────────────────────────────────────────
export async function listarContratos(): Promise<Contrato[]> {
    const response = await api.get<{ contratos: Contrato[] }>('/contratos')
    return response.data.contratos
}

// ── Exibe um contrato específico ──────────────────────────────────────────────
export async function buscarContrato(id: string): Promise<Contrato> {
    const response = await api.get<{ contrato: Contrato }>(`/contratos/${id}`)
    return response.data.contrato
}

// ── Propõe um novo contrato ───────────────────────────────────────────────────
export async function proporContrato(data: {
    fazendeiro_username: string
    fazenda_id: string
    start_date?: string
    end_date?: string
    value?: number
    scope_description?: string
}): Promise<Contrato> {
    const response = await api.post<{ contrato: Contrato }>('/contratos', data)
    return response.data.contrato
}

// ── Encerra um contrato ativo ─────────────────────────────────────────────────
export async function encerrarContrato(id: string): Promise<Contrato> {
    const response = await api.post<{ contrato: Contrato }>(`/contratos/${id}/encerrar`)
    return response.data.contrato
}