import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types'

// ── Formato do store ──────────────────────────────────────────────────────────
interface AuthState {
    user: User | null
    token: string | null
    isLoggedIn: boolean
    isLoading: boolean

    // Ações
    setUser: (user: User, token: string) => void
    clearUser: () => void
    loadFromStorage: () => Promise<void>
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: true,

    // Salva o usuário no store após login ou registro
    setUser: (user, token) => {
        set({ user, token, isLoggedIn: true, isLoading: false })
    },

    // Limpa o store após logout
    clearUser: () => {
        set({ user: null, token: null, isLoggedIn: false, isLoading: false })
    },

    // Carrega os dados do AsyncStorage quando o app abre
    loadFromStorage: async () => {
        try {
            const token = await AsyncStorage.getItem('@agro:token')
            const userJson = await AsyncStorage.getItem('@agro:user')

            if (token && userJson) {
                const user = JSON.parse(userJson) as User
                set({ user, token, isLoggedIn: true, isLoading: false })
            } else {
                set({ isLoading: false })
            }
        } catch {
            set({ isLoading: false })
        }
    },
}))