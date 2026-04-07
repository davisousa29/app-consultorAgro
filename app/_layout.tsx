import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '../src/store/authStore'

export default function RootLayout() {
    const { loadFromStorage } = useAuthStore()

    useEffect(() => {
        loadFromStorage()
    }, [])

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}