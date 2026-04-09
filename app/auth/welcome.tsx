import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'

import Logo from '../../src/components/Logo';
import AuthBottomSheet from '../../src/components/AuthBottomSheet'

export default function Welcome() {
    return (
        <>
            <View style={styles.container}>

                <View style={styles.header}>
                    <Logo size={100} />
                    <Text style={styles.title}>AgroSystem</Text>
                    <Text style={styles.subtitle}>Consultor Agropecuário</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.description}>
                        Gerencie seus serviços, acompanhe fazendas e mantenha seus clientes informados em tempo real.
                    </Text>
                </View>

            </View>

            <AuthBottomSheet />
        </>
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