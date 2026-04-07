import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { AuthResponse, User } from '../types'

// ── Registro ──────────────────────────────────────────────────────────────────
export async function register(data: {
    name: string
    email: string
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
    await salvarSessao(response.data)
    return response.data
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    await salvarSessao(response.data)
    return response.data
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    try {
        await api.post('/auth/logout')
    } finally {
        await limparSessao()
    }
}

// ── Usuário autenticado ───────────────────────────────────────────────────────
export async function me(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me')
    return response.data.user
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function salvarSessao(data: AuthResponse): Promise<void> {
    await AsyncStorage.setItem('@agro:token', data.token)
    await AsyncStorage.setItem('@agro:user', JSON.stringify(data.user))
}

async function limparSessao(): Promise<void> {
    await AsyncStorage.removeItem('@agro:token')
    await AsyncStorage.removeItem('@agro:user')
}

export async function getUsuarioLocal(): Promise<User | null> {
    const user = await AsyncStorage.getItem('@agro:user')
    return user ? JSON.parse(user) : null
}

export async function getTokenLocal(): Promise<string | null> {
    return AsyncStorage.getItem('@agro:token')
}