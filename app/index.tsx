import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../src/store/authStore'
import { Colors } from '../src/constants'

export default function Index() {
    const { isLoggedIn, isLoading } = useAuthStore()

    useEffect(() => {
        if (isLoading) return

        if (isLoggedIn) {
            router.replace('/consultor/home')
        } else {
            router.replace('/auth/welcome')
        }
    }, [isLoggedIn, isLoading])

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
})