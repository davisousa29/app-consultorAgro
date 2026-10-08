import api from './api'

export interface SubscriptionStatus {
    status: 'trial' | 'active' | 'expired' | 'canceled' | 'lifetime' | 'none'
    is_active: boolean
    is_lifetime?: boolean
    plan: string | null
    expires_at: string | null
    days_remaining: number
    is_subscriber?: boolean
}

export interface Plan {
    plan: string      // slug: monthly, semiannual, annual
    name: string      // Mensal, Semestral, Anual
    price: number
    days: number
}

export interface PixData {
    pix_qr_code: string | null     // imagem base64
    pix_copy_paste: string | null  // código copia-e-cola
    pix_expiration: string | null
}

export interface CheckoutPayment {
    id: string
    plan: string
    days: number
    value: number
    status: 'pending' | 'received' | 'overdue' | 'refunded' | 'canceled'
    due_date: string | null
    paid_at: string | null
    invoice_url: string | null
    pix: PixData | null
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await api.get<SubscriptionStatus>('/subscription/status')
    return response.data
}

export async function getPlans(): Promise<Plan[]> {
    const response = await api.get<{ plans: Plan[] }>('/subscription/plans')
    return response.data.plans
}

// Timeout maior: o backend conversa com o Asaas (cliente + cobrança + QR)
export async function createCheckout(plan: string): Promise<CheckoutPayment> {
    const response = await api.post<{ payment: CheckoutPayment }>(
        '/subscription/checkout',
        { plan },
        { timeout: 30000 }
    )
    return response.data.payment
}

export async function getCheckout(id: string, withPix = false): Promise<CheckoutPayment> {
    const response = await api.get<{ payment: CheckoutPayment }>(
        `/subscription/checkout/${id}`,
        { params: withPix ? { pix: 1 } : undefined }
    )
    return response.data.payment
}