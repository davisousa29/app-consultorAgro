import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants'
import { Icons } from '../../constants/icons'
import { globalStyles } from '../../constants/globalStyles'
import ProfileDropdown from './ProfileDropdown'
import SideMenu from '../Menu/SideMenu'

export default function AppHeader() {
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)

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
                        <Text style={styles.title}>AgroSystem</Text>
                    </TouchableOpacity>

                </View>

                {/* DIREITA */}
                <View style={styles.right}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Icons.bell size={20} color={Colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                    >
                        <Icons.user size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* DROPDOWN */}
                <ProfileDropdown
                    visible={dropdownVisible}
                    onClose={() => setDropdownVisible(false)}
                />

                {/* MENU LATERAL */}
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
})
