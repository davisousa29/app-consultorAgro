import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '@/src/types'
import { Profile } from '@/src/types'

const KEYS = {
    user: '@agro:user',
    token: '@agro:token',
    profile: '@agro:profile',
} as const

// ── Formato do store ──────────────────────────────────────────────────────────
interface AuthState {
    user: User | null
    token: string | null
    profile: Profile | null
    isLoggedIn: boolean
    isLoading: boolean

    // Ações
    setUser: (user: User, token: string) => Promise<void>
    setProfile: (profile: Profile) => Promise<void>
    clearUser: () => Promise<void>
    loadFromStorage: () => Promise<void>
}

// ── Store ─────────────────────────────────────────────────────────────────────
// Único dono da sessão: memória (para o app) + AsyncStorage (para reabrir o app).
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    profile: null,
    isLoggedIn: false,
    isLoading: true,

    setUser: async (user, token) => {
        // Memória primeiro: a próxima requisição já sai com o token novo,
        // mesmo que a tela navegue antes de o storage terminar de gravar
        set({ user, token, isLoggedIn: true, isLoading: false })

        await AsyncStorage.multiSet([
            [KEYS.user, JSON.stringify(user)],
            [KEYS.token, token],
        ])
    },

    setProfile: async (profile) => {
        set({ profile })
        await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile))
    },

    clearUser: async () => {
        set({
            user: null,
            token: null,
            profile: null,
            isLoggedIn: false,
            isLoading: false,
        })

        await AsyncStorage.multiRemove([KEYS.user, KEYS.token, KEYS.profile])
    },

    loadFromStorage: async () => {
        try {
            const [[, token], [, userJson], [, profileJson]] = await AsyncStorage.multiGet([
                KEYS.token,
                KEYS.user,
                KEYS.profile,
            ])

            if (token && userJson) {
                set({
                    user: JSON.parse(userJson) as User,
                    token,
                    profile: profileJson ? JSON.parse(profileJson) : null,
                    isLoggedIn: true,
                    isLoading: false,
                })
            } else {
                set({ isLoading: false })
            }
        } catch {
            set({ isLoading: false })
        }
    },
}))