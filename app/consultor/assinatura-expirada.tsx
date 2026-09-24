import { useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { LockKeyhole } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import { getSubscriptionStatus } from '../../src/services/subscriptionService'
import { logout } from '../../src/services/authService'
import { useAuthStore } from '../../src/store/authStore'

export default function AssinaturaExpirada() {
    const { clearUser } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<string>('')

    useFocusEffect(
        useCallback(() => {
            verificar()
        }, [])
    )

    async function verificar() {
        setLoading(true)
        try {
            const s = await getSubscriptionStatus()
            // Se por acaso a assinatura voltou a ficar ativa, manda pra home
            if (s.is_active) {
                router.replace('/consultor/home')
                return
            }
            setStatus(s.status)
        } catch {
            // silencioso
        } finally {
            setLoading(false)
        }
    }

    async function handleSair() {
        await logout()
        clearUser()
        router.replace('/auth/welcome')
    }

    if (loading) {
        return (
            <View style={[globalStyles.screen, globalStyles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    return (
        <View style={[globalStyles.screen, styles.container]}>
            <View style={styles.icone}>
                <LockKeyhole size={40} color={Colors.error} />
            </View>

            <Text style={styles.titulo}>Sua assinatura expirou</Text>

            <Text style={styles.descricao}>
                Para continuar usando o Colchete, escolha um plano e retome o acesso a
                todas as funcionalidades.
            </Text>

            <View style={styles.avisoDados}>
                <Text style={styles.avisoTexto}>
                    Seus dados estão protegidos e serão mantidos por um período. Assine
                    para não perder nenhuma informação.
                </Text>
            </View>

            <TouchableOpacity
                style={[globalStyles.buttonPrimary, styles.botaoPlanos]}
                onPress={() => router.push('/consultor/planos' as any)}
                activeOpacity={0.8}
            >
                <Text style={globalStyles.buttonPrimaryText}>Ver planos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSair} onPress={handleSair} activeOpacity={0.7}>
                <Text style={styles.botaoSairTexto}>Sair da conta</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    icone: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FDE8E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    titulo: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    descricao: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    avisoDados: {
        backgroundColor: '#FFF9DB',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.xl,
    },
    avisoTexto: {
        fontSize: FontSize.sm,
        color: '#8D6E15',
        textAlign: 'center',
        lineHeight: 20,
    },
    botaoPlanos: {
        width: '100%',
        marginBottom: Spacing.md,
    },
    botaoSair: {
        paddingVertical: Spacing.sm,
    },
    botaoSairTexto: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        fontWeight: '600',
    },
})