import { create } from 'zustand'
import { contarNaoLidas } from '../services/notificacaoService'

interface NotificacaoState {
    naoLidas: number
    atualizarNaoLidas: () => Promise<void>
    zerarBadge: () => void
}

export const useNotificacaoStore = create<NotificacaoState>((set) => ({
    naoLidas: 0,

    atualizarNaoLidas: async () => {
        try {
            const total = await contarNaoLidas()
            set({ naoLidas: total })
        } catch {
            // silencioso — badge não é crítico
        }
    },

    zerarBadge: () => set({ naoLidas: 0 }),
}))