import { Stack } from 'expo-router'
import AppHeader from '../../src/components/Header/AppHeader'

export default function AppLayout() {
    return (
        <>
            <AppHeader />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}