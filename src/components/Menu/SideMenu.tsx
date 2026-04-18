import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    Dimensions,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Spacing, FontSize } from '../../constants'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../services/authService'

const MENU_WIDTH = Dimensions.get('window').width * 0.75

interface Props {
    visible: boolean
    onClose: () => void
}

export default function SideMenu({ visible, onClose }: Props) {
    const insets = useSafeAreaInsets()
    const { user, clearUser } = useAuthStore()
    const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current
    const overlayOpacity = useRef(new Animated.Value(0)).current
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        if (visible) {
            setModalVisible(true)
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 280,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -MENU_WIDTH,
                    duration: 220,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) setModalVisible(false)
            })
        }
    }, [visible])

    async function handleLogout() {
        onClose()
        await logout()
        clearUser()
        router.replace('/auth/welcome')
    }

    function handleNavigate(path: string) {
        onClose()
        router.push(path as any)
    }

    const menuItems = [
        { icon: '🏠', label: 'Home', path: '/consultor/home' },
        { icon: '👤', label: 'Meu perfil', path: '/consultor/perfil' },
        { icon: '🤝', label: 'Contratos', path: '/consultor/contratos' },
        { icon: '🔍', label: 'Buscar fazendeiros', path: '/consultor/busca' },
    ]

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <View style={styles.root}>

                <Animated.View
                    style={[
                        styles.menu,
                        {
                            width: MENU_WIDTH,
                            paddingTop: insets.top + Spacing.lg,
                            paddingBottom: insets.bottom + Spacing.lg,
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <View style={styles.profileSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.profileName} numberOfLines={1}>
                                {user?.name}
                            </Text>
                            <Text style={styles.profileUsername} numberOfLines={1}>
                                @{user?.username}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.navItems}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.path}
                                style={styles.navItem}
                                onPress={() => handleNavigate(item.path)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.navIcon}>{item.icon}</Text>
                                <Text style={styles.navLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutLabel}>Sair</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={[styles.overlay, { opacity: overlayOpacity }]}
                    pointerEvents={visible ? 'auto' : 'none'}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </Animated.View>

            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
    },
    menu: {
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 12,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontSize: FontSize.xl,
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
        maxWidth: 160,
    },
    profileUsername: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray[200],
        marginVertical: Spacing.md,
    },
    navItems: {
        gap: Spacing.xs,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: 8,
    },
    navIcon: {
        fontSize: 18,
        width: 24,
        textAlign: 'center',
    },
    navLabel: {
        fontSize: FontSize.md,
        color: Colors.black,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: 8,
    },
    logoutIcon: {
        fontSize: 18,
        width: 24,
        textAlign: 'center',
    },
    logoutLabel: {
        fontSize: FontSize.md,
        color: Colors.error,
        fontWeight: 'bold',
    },
})