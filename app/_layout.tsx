import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '../src/store/authStore'
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message'

export default function RootLayout() {
    const { loadFromStorage } = useAuthStore()

    const toastConfig = {
        success: (props: any) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: '#40C057' }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                text1Style={{ fontSize: 15, fontWeight: 'bold' }}
                text2Style={{ fontSize: 13 }}
                text2NumberOfLines={3}
            />
        ),
        error: (props: any) => (
            <ErrorToast
                {...props}
                style={{ borderLeftColor: '#FA5252' }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                text1Style={{ fontSize: 15, fontWeight: 'bold' }}
                text2Style={{ fontSize: 13 }}
                text2NumberOfLines={3}
            />
        ),
        info: (props: any) => (
            <InfoToast
                {...props}
                style={{ borderLeftColor: '#FAB005' }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                text1Style={{ fontSize: 15, fontWeight: 'bold' }}
                text2Style={{ fontSize: 13 }}
                text2NumberOfLines={3}
            />
        ),
    }


    useEffect(() => {
        loadFromStorage()
    }, [])

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
        </>
    )
}