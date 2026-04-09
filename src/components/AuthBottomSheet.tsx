import { useEffect, useRef, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
} from 'react-native'
import { router, usePathname } from 'expo-router'
import { Colors, FontSize, Spacing, BorderRadius } from '../constants'
import { useAuthStore } from '../store/authStore';
import { globalStyles } from '../../src/constants/globalStyles'

export default function AuthBottomSheet() {
    const { isLoggedIn, isLoading } = useAuthStore()
    const pathname = usePathname()
    const translateY = useRef(new Animated.Value(300)).current

    const shouldShow = !isLoggedIn && !isLoading && pathname === '/auth/welcome'

    useEffect(() => {
        if (shouldShow) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start()
        } else {
            translateY.setValue(300)
        }
    }, [shouldShow])

    if (!shouldShow) return null

    return (
        <Modal
            visible={shouldShow}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY }] }]}
                >
                    <View style={styles.indicator} />
                    <Text style={globalStyles.modalTitle}>Bem-vindo ao AgroSystem</Text>
                    <Text style={globalStyles.modalSubtitle}>
                        Entre ou crie sua conta para continuar
                    </Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={globalStyles.buttonPrimary}
                            onPress={() => router.push('/auth/login')}
                        >
                            <Text style={globalStyles.buttonPrimaryText}>Entrar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={globalStyles.buttonSecondary}
                            onPress={() => router.push('/auth/register')}
                        >
                            <Text style={globalStyles.buttonSecondaryText}>Criar conta</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: Colors.gray[300],
        borderRadius: BorderRadius.full,
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    buttons: {
        gap: Spacing.sm,
    },
})