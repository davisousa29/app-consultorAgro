import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Clock, ChevronRight } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../constants'
import { SubscriptionStatus } from '../services/subscriptionService'

interface Props {
    subscription: SubscriptionStatus | null
}

export default function TrialBanner({ subscription }: Props) {
    // Não mostra nada se: sem dados, vitalício, ou já é assinante ativo pagante
    if (!subscription) return null
    if (subscription.is_lifetime) return null
    if (subscription.status === 'active') return null

    // Só mostra durante o trial
    if (subscription.status !== 'trial') return null

    const dias = subscription.days_remaining

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push('/consultor/planos' as any)}
            activeOpacity={0.85}
        >
            <View style={styles.icone}>
                <Clock size={20} color="#B7791F" />
            </View>
            <View style={styles.conteudo}>
                <Text style={styles.titulo}>
                    {dias > 0
                        ? `Seu teste grátis termina em ${dias} dia${dias !== 1 ? 's' : ''}`
                        : 'Seu teste grátis termina hoje'}
                </Text>
                <Text style={styles.subtitulo}>Assine um plano para continuar usando</Text>
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