import { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import { menuItems } from '../../src/constants/menuItems'
import { getShortcuts, saveShortcuts, MIN, MAX } from '../../src/services/shortcutsService'
import BackHeader from '../../src/components/Header/BackHeader'

export default function EditarShortcuts() {
    const [selecionados, setSelecionados] = useState<string[]>([])

    useEffect(() => {
        getShortcuts().then(setSelecionados)
    }, [])

    function toggleItem(path: string) {
        setSelecionados((prev) => {
            if (prev.includes(path)) {
                if (prev.length <= MIN) {
                    Alert.alert('Atenção', `Você precisa ter pelo menos ${MIN} atalho.`)
                    return prev
                }
                return prev.filter((p) => p !== path)
            } else {
                if (prev.length >= MAX) {
                    Alert.alert('Atenção', `Você pode ter no máximo ${MAX} atalhos.`)
                    return prev
                }
                return [...prev, path]
            }
        })
    }

    async function handleSalvar() {
        await saveShortcuts(selecionados)
        router.back()
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView
                contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
                bounces={true}
                nestedScrollEnabled={true}
            >
                <BackHeader
                    title="Editar atalhos"
                    effectPhrase={
                        <Text style={styles.subtitle}>
                            Escolha entre {MIN} e {MAX} atalhos para exibir na home
                        </Text>
                    }
                    subtitle={
                        <Text style={styles.counter}>
                            {selecionados.length}/{MAX} selecionados
                        </Text>
                    }
                    showLogo={false}
                />

                <View style={styles.list}>
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const selected = selecionados.includes(item.path)

                        return (
                            <TouchableOpacity
                                key={item.path}
                                style={[styles.menuItem, selected && styles.menuItemSelected]}
                                onPress={() => toggleItem(item.path)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                                    <Icon size={20} color={selected ? Colors.white : Colors.primary} />
                                </View>

                                <Text style={[styles.menuLabel, selected && styles.menuLabelSelected]}>
                                    {item.label}
                                </Text>

                                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                    {selected && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>

            </ScrollView>

            {/* Botão salvar fixo no rodapé */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={globalStyles.buttonPrimary}
                    onPress={handleSalvar}
                    activeOpacity={0.8}
                >
                    <Text style={globalStyles.buttonPrimaryText}>Salvar atalhos</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: 120,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        marginBottom: Spacing.xs,
    },
    counter: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    list: {
        gap: Spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
    },
    menuItemSelected: {
        borderColor: Colors.primary,
        backgroundColor: '#F0FAF5',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerSelected: {
        backgroundColor: Colors.primary,
    },
    menuLabel: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.black,
    },
    menuLabelSelected: {
        fontWeight: '600',
        color: Colors.primary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.gray[300],
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkmark: {
        color: Colors.white,
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
    },
})