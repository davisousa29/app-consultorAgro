import api from './api'
import { useAuthStore } from '@/src/store/authStore'
import { AuthResponse, User } from '@/src/types'

// A sessão (token, usuário) é gravada só pelo authStore.
// Este arquivo apenas conversa com a API.

// ── Registro ──────────────────────────────────────────────────────────────────
export async function register(data: {
    name: string
    email: string
    cpf: string
    phone: string
    username: string
    whatsapp: string
    password: string
    password_confirmation: string
}): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
        ...data,
        role: 'consultor',
    })
    return response.data
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<any> {
    const response = await api.post<any>('/auth/login', { email, password })
    return response.data
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    try {
        await api.post('/auth/logout')
    } catch {
        // Ignora erro do servidor (ex: token já inválido) — o importante é limpar a sessão local
    } finally {
        await useAuthStore.getState().clearUser()
    }
}

// ── Usuário autenticado ───────────────────────────────────────────────────────
export async function me(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me')
    return response.data.user
}

// ── Recuperação de senha ──────────────────────────────────────────────────────
export async function solicitarCodigoRecuperacao(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/recuperar-senha', { email })
    return response.data
}

export async function redefinirSenha(data: {
    email: string
    codigo: string
    password: string
    password_confirmation: string
}): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/redefinir-senha', data)
    return response.data
}

// ── Login com Google ──────────────────────────────────────────────────────────
export async function loginComGoogle(accessToken: string): Promise<AuthResponse & { cadastro_completo: boolean }> {
    const response = await api.post<AuthResponse & { cadastro_completo: boolean }>('/auth/google', {
        access_token: accessToken,
    })
    return response.data
}