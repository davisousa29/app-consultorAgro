import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import { useNotificacaoStore } from '../../store/notificacaoStore'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants'
import { Icons } from '../../constants/icons'
import NotificationDropdown from './NotificationDropdown'
import { globalStyles } from '../../constants/globalStyles'
import ProfileDropdown from './ProfileDropdown'
import SideMenu from '../Menu/SideMenu'

export default function AppHeader() {
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
    const { naoLidas, atualizarNaoLidas } = useNotificacaoStore()
    const [notifVisible, setNotifVisible] = useState(false)

    useEffect(() => {
        atualizarNaoLidas()
    }, [])

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.white }}>
            <View style={styles.container}>
                {/* ESQUERDA */}
                <View style={styles.left}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Icons.menu size={20} color={Colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/consultor/home')}
                    >
                        <Text style={styles.title}>Colchete</Text>
                    </TouchableOpacity>

                </View>

                {/* DIREITA */}
                <View style={styles.right}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setNotifVisible(true)}>
                        <Icons.bell size={20} color={Colors.primary} />
                        {naoLidas > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {naoLidas > 9 ? '9+' : naoLidas}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                    >
                        <Icons.user size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <ProfileDropdown
                    visible={dropdownVisible}
                    onClose={() => setDropdownVisible(false)}
                />

                <NotificationDropdown
                    visible={notifVisible}
                    onClose={() => setNotifVisible(false)}
                />

                <SideMenu
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 60,
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },

    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.primary,
    },

    menuButton: {
        padding: 6,
    },

    iconButton: {
        padding: 6,
    },

    profileButton: {
        padding: 6,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },

    icon: {
        fontSize: 18,
    },

    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },

    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
})
