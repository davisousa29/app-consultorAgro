import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
    baseURL: 'http://localhost/api',
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
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('@agro:token')
            await AsyncStorage.removeItem('@agro:user')
        }
        return Promise.reject(error)
    }
)

export default api