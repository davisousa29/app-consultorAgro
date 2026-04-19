import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types'
import { Profile } from '../types'

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
    clearUser: () => void
    loadFromStorage: () => Promise<void>
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    profile: null,
    isLoggedIn: false,
    isLoading: true,

    setUser: async (user, token) => {
        await AsyncStorage.setItem('@agro:user', JSON.stringify(user))
        await AsyncStorage.setItem('@agro:token', token)

        set({ user, token, isLoggedIn: true, isLoading: false })
    },

    setProfile: async (profile) => {
        await AsyncStorage.setItem('@agro:profile', JSON.stringify(profile))
        set({ profile })
    },

    clearUser: async () => {
        await AsyncStorage.multiRemove([
            '@agro:user',
            '@agro:token',
            '@agro:profile',
        ])

        set({
            user: null,
            token: null,
            profile: null,
            isLoggedIn: false,
            isLoading: false
        })
    },

    loadFromStorage: async () => {
        try {
            const token = await AsyncStorage.getItem('@agro:token')
            const userJson = await AsyncStorage.getItem('@agro:user')
            const profileJson = await AsyncStorage.getItem('@agro:profile')

            if (token && userJson) {
                const user = JSON.parse(userJson) as User
                const profile = profileJson ? JSON.parse(profileJson) : null

                set({
                    user,
                    token,
                    profile,
                    isLoggedIn: true,
                    isLoading: false
                })
            } else {
                set({ isLoading: false })
            }
        } catch {
            set({ isLoading: false })
        }
    },
}))