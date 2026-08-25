import api from './api'

export interface StatusDoisFatores {
    ativo: boolean
    metodo: string | null
}

export interface DadosAtivacao {
    qr_code_url: string
    chave_manual: string
}

// ── Consulta o status atual do 2FA ────────────────────────────────────────────
export async function status2fa(): Promise<StatusDoisFatores> {
    const response = await api.get<StatusDoisFatores>('/2fa/status')
    return response.data
}

// ── Gera o segredo, QR code e chave manual ────────────────────────────────────
export async function gerar2fa(): Promise<DadosAtivacao> {
    const response = await api.post<DadosAtivacao>('/2fa/gerar')
    return response.data
}

// ── Confirma a ativação com um código do autenticador ─────────────────────────
export async function confirmar2fa(codigo: string): Promise<{ codigos_recuperacao: string[] }> {
    const response = await api.post<{ codigos_recuperacao: string[] }>('/2fa/confirmar', { codigo })
    return response.data
}

// ── Desativa o 2FA (exige senha) ──────────────────────────────────────────────
export async function desativar2fa(password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/2fa/desativar', { password })
    return response.data
}