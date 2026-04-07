import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'

export default function Welcome() {
    return (
        <View style={styles.container}>

            {/* Logo e título */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>🌱</Text>
                </View>
                <Text style={styles.title}>AgroSystem</Text>
                <Text style={styles.subtitle}>Consultor Agropecuário</Text>
            </View>

            {/* Descrição */}
            <View style={styles.content}>
                <Text style={styles.description}>
                    Gerencie seus serviços, acompanhe fazendas e mantenha seus clientes informados em tempo real.
                </Text>
            </View>

            {/* Botões */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={styles.buttonPrimaryText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => router.push('/auth/register')}
                >
                    <Text style={styles.buttonSecondaryText}>Criar conta</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg,
        paddingTop: 80,
        paddingBottom: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoText: {
        fontSize: 48,
    },
    title: {
        fontSize: FontSize.xxxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.lg,
        color: Colors.gray[600],
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        fontSize: FontSize.md,
        color: Colors.gray[700],
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        gap: Spacing.sm,
    },
    buttonPrimary: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        backgroundColor: Colors.white,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    buttonSecondaryText: {
        color: Colors.primary,
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
})