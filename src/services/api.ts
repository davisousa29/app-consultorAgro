import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
    // baseURL: 'http://localhost/api',
    baseURL: 'http://192.168.1.51/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// ── Interceptor de requisição — adiciona o token automaticamente ──────────────
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@agro:token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ── Interceptor de resposta — trata erros globalmente ────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Assinatura expirada — redireciona para a tela de bloqueio
        if (error.response?.status === 402 && error.response?.data?.subscription === 'inactive') {
            const { router } = require('expo-router')
            router.replace('/consultor/assinatura-expirada')
        }
        return Promise.reject(error)
    }
)

export default api