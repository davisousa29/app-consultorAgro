import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Clock, ChevronRight } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../constants'
import { SubscriptionStatus } from '../services/subscriptionService'

interface Props {
    subscription: SubscriptionStatus | null
}

// Assinante pago passa a ver o aviso quando faltam até X dias
const DIAS_AVISO_RENOVACAO = 7

function textoDias(dias: number) {
    return `${dias} dia${dias !== 1 ? 's' : ''}`
}

export default function TrialBanner({ subscription }: Props) {
    if (!subscription) return null
    if (subscription.is_lifetime) return null

    const dias = subscription.days_remaining
    let titulo: string
    let subtitulo: string

    if (subscription.status === 'trial') {
        titulo = dias > 0 ? `Seu teste grátis termina em ${textoDias(dias)}` : 'Seu teste grátis termina hoje'
        subtitulo = 'Assine um plano para continuar usando'
    } else if (subscription.status === 'active' && dias <= DIAS_AVISO_RENOVACAO) {
        titulo = dias > 0 ? `Sua assinatura vence em ${textoDias(dias)}` : 'Sua assinatura vence hoje'
        subtitulo = 'Renove agora: os dias que faltam não são perdidos'
    } else {
        return null
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push('/assinatura/planos' as any)}
            activeOpacity={0.85}
        >
            <View style={styles.icone}>
                <Clock size={20} color="#B7791F" />
            </View>
            <View style={styles.conteudo}>
                <Text style={styles.titulo}>{titulo}</Text>
                <Text style={styles.subtitulo}>{subtitulo}</Text>
            </View>
            <ChevronRight size={18} color="#B7791F" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: '#FFF9DB',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#FFE066',
    },
    icone: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3BF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    conteudo: {
        flex: 1,
        gap: 2,
    },
    titulo: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: '#8D6E15',
    },
    subtitulo: {
        fontSize: FontSize.xs,
        color: '#A67C1A',
    },
})