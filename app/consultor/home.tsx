import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { logout } from '../../src/services/authService'
import { Colors, FontSize, Spacing } from '../../src/constants'

export default function Home() {
    const { user, clearUser } = useAuthStore()

    async function handleLogout() {
        await logout()
        clearUser()
        router.replace('/auth/welcome')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Olá, {user?.name}!</Text>
            <Text style={styles.subtitle}>Bem-vindo ao AgroSystem</Text>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        marginBottom: Spacing.xl,
    },
    button: {
        backgroundColor: Colors.error,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: 10,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
})