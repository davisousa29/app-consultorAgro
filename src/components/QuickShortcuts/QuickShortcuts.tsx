import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants'
import { menuItems } from '../../constants/menuItems'
import { getShortcuts } from '../../services/shortcutsService'

const { width } = Dimensions.get('window')
const PADDING = Spacing.lg * 2
const GAP = Spacing.sm
const ITEM_WIDTH = (width - PADDING - GAP) / 2

export default function QuickShortcuts() {
    const [shortcuts, setShortcuts] = useState<typeof menuItems>([])

    useFocusEffect(
        useCallback(() => {
            loadShortcuts()
        }, [])
    )

    async function loadShortcuts() {
        const paths = await getShortcuts()
        const items = paths
            .map((path) => menuItems.find((m) => m.path === path))
            .filter(Boolean) as typeof menuItems
        setShortcuts(items)
    }

    return (
        <View style={styles.container}>

            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.title}>Menus rápidos</Text>
                <TouchableOpacity
                    onPress={() => router.push('/consultor/editarShortcuts' as any)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.editLink}>Editar</Text>
                </TouchableOpacity>
            </View>

            {/* Grade de atalhos */}
            <View style={styles.grid}>
                {shortcuts.map((item) => {
                    const Icon = item.icon
                    return (
                        <TouchableOpacity
                            key={item.path}
                            style={styles.item}
                            onPress={() => router.push(item.path as any)}
                            activeOpacity={0.8}
                        >
                            <Icon size={22} color={Colors.white} />
                            <Text style={styles.itemText}>{item.label}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
    },
    editLink: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    item: {
        width: ITEM_WIDTH,
        height: 80,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    itemText: {
        color: Colors.white,
        fontSize: FontSize.xs,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
})