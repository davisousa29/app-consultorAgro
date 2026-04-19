import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useEffect } from 'react'
import { useAuthStore } from '../../src/store/authStore'
import api from '../../src/services/api'
import { Colors, FontSize, Spacing } from '../../src/constants'

export default function Home() {

    const { user, profile, setProfile } = useAuthStore()

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get('/perfil')
                setProfile(response.data.perfil)
            } catch (error) {
                console.log('Erro ao carregar perfil', error)
            }
        }

        if (user && !profile) {
            loadProfile()
        }
    }, [user])

    // useEffect(() => {
    //     console.log('USER =>', user)
    //     console.log('PROFILE =>', profile)
    // }, [user, profile])

    return (
        <View style={styles.container}>
            <View style={styles.cardUserDescrible}>

                <Image
                    source={require('../../assets/png-files/box-initial.png')}
                    style={styles.image}
                />

                <View style={styles.content}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Especialista em {profile?.specialization}</Text>
                    </View>

                    <Text style={styles.title}>
                        Seja bem vindo,{' '}
                        <Text style={styles.highlight}>{user?.name}</Text>
                    </Text>

                    <Text style={styles.subtitle}>
                        {profile?.bio}.
                    </Text>
                </View>

            </View>

            <View style={styles.cardQuickShortcuts}>
                <Text style={styles.title}>Menus rápidos</Text>

                <View style={styles.subCardQuickShortcuts}>
                    <TouchableOpacity style={styles.ItemShortcuts}>

                    </TouchableOpacity>

                    <TouchableOpacity style={styles.ItemShortcuts}>

                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.lg,
    },

    cardUserDescrible: {
        width: '100%',
        height: 260,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 20,
    },

    cardQuickShortcuts: {
        width: '100%',
        height: 260,
        marginTop: 20,
    },

    subCardQuickShortcuts: {
        width: '100%',
        height: '100%',
        justifyContent: "space-between",
        gap: 5,
    },

    ItemShortcuts: {
        width: '50%',
        height: 50,
        borderRadius: 10,
        backgroundColor: Colors.primary,
    },

    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-end',
    },

    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#A7F3D0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        marginBottom: 10,
    },

    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#065F46',
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 6,
    },

    highlight: {
        color: Colors.primary,
    },

    subtitle: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
})