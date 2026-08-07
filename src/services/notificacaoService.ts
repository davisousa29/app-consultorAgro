import api from './api'

export interface Notificacao {
    id: string
    tipo: string
    titulo: string
    mensagem: string
    dados: { rota?: string; id?: string } | null
    lida: boolean
    lida_em: string | null
    created_at: string
}

interface RespostaPaginada {
    data: Notificacao[]
    current_page: number
    last_page: number
    total: number
}

// ── Lista paginada (tela "ver todas") ─────────────────────────────────────────
export async function listarNotificacoes(params: {
    page?: number
    lida?: boolean
    ordem?: 'recentes' | 'antigos'
}): Promise<RespostaPaginada> {
    const response = await api.get<RespostaPaginada>('/notificacoes', {
        params: {
            page: params.page ?? 1,
            lida: params.lida,
            ordem: params.ordem ?? 'recentes',
        },
    })
    return response.data
}

// ── Últimas 3 (dropdown do sino) ──────────────────────────────────────────────
export async function ultimasNotificacoes(): Promise<Notificacao[]> {
    const response = await api.get<{ notificacoes: Notificacao[] }>('/notificacoes/ultimas')
    return response.data.notificacoes
}

// ── Contagem de não-lidas (badge) ─────────────────────────────────────────────
export async function contarNaoLidas(): Promise<number> {
    const response = await api.get<{ nao_lidas: number }>('/notificacoes/nao-lidas')
    return response.data.nao_lidas
}

// ── Marca uma como lida ───────────────────────────────────────────────────────
export async function marcarLida(id: string): Promise<void> {
    await api.patch(`/notificacoes/${id}/lida`)
}

// ── Marca todas como lidas ────────────────────────────────────────────────────
export async function marcarTodasLidas(): Promise<void> {
    await api.patch('/notificacoes/todas/lidas')
}