import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    SafeAreaView,
} from 'react-native'
import { SlidersHorizontal, X } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../constants'
import FilterChips, { FilterChip } from './FilterChips'

export interface FilterGroup {
    label: string
    chips: FilterChip[]
    valor: string
    onChange: (value: string) => void
}

interface Props {
    grupos: FilterGroup[]
    onLimpar: () => void
}

function contarAtivos(grupos: FilterGroup[]): number {
    return grupos.filter(g => g.valor !== 'todos' && g.valor !== g.chips[0]?.value).length
}

export default function FilterModal({ grupos, onLimpar }: Props) {
    const [visivel, setVisivel] = useState(false)
    const ativos = contarAtivos(grupos)

    function handleLimpar() {
        onLimpar()
        setVisivel(false)
    }

    return (
        <>
            {/* Botão de filtro */}
            <TouchableOpacity
                style={[styles.botaoFiltro, ativos > 0 && styles.botaoFiltroAtivo]}
                onPress={() => setVisivel(true)}
                activeOpacity={0.8}
            >
                <SlidersHorizontal
                    size={18}
                    color={ativos > 0 ? Colors.white : Colors.primary}
                />
                <Text style={[styles.botaoFiltroTexto, ativos > 0 && styles.botaoFiltroTextoAtivo]}>
                    Filtros
                </Text>
                {ativos > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeTexto}>{ativos}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Modal de filtros */}
            <Modal
                visible={visivel}
                animationType="slide"
                transparent
                statusBarTranslucent
                onRequestClose={() => setVisivel(false)}
            >
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={styles.overlayFundo}
                        onPress={() => setVisivel(false)}
                        activeOpacity={1}
                    />

                    <SafeAreaView style={styles.sheet}>
                        {/* Header */}
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitulo}>Filtros</Text>
                            <TouchableOpacity
                                onPress={() => setVisivel(false)}
                                style={styles.fecharBotao}
                            >
                                <X size={20} color={Colors.gray[600]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.indicador} />

                        {/* Grupos de filtro */}
                        <ScrollView
                            contentContainerStyle={styles.grupos}
                            showsVerticalScrollIndicator={false}
                        >
                            {grupos.map((grupo, index) => (
                                <View key={index} style={styles.grupo}>
                                    <Text style={styles.grupoLabel}>{grupo.label}</Text>
                                    <FilterChips
                                        chips={grupo.chips}
                                        selecionado={grupo.valor}
                                        onChange={grupo.onChange}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        {/* Rodapé */}
                        <View style={styles.rodape}>
                            <TouchableOpacity
                                style={styles.botaoLimpar}
                                onPress={handleLimpar}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.botaoLimparTexto}>Limpar tudo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.botaoAplicar}
                                onPress={() => setVisivel(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.botaoAplicarTexto}>
                                    {ativos > 0 ? `Aplicar (${ativos})` : 'Fechar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    botaoFiltro: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
        alignSelf: 'flex-start',
    },
    botaoFiltroAtivo: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    botaoFiltroTexto: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.primary,
    },
    botaoFiltroTextoAtivo: {
        color: Colors.white,
    },
    badge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeTexto: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlayFundo: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    sheetTitulo: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.black,
    },
    fecharBotao: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicador: {
        width: 40,
        height: 4,
        backgroundColor: Colors.gray[300],
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    grupos: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
        gap: Spacing.lg,
    },
    grupo: {
        gap: Spacing.sm,
    },
    grupoLabel: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    rodape: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
    },
    botaoLimpar: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        alignItems: 'center',
    },
    botaoLimparTexto: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.gray[600],
    },
    botaoAplicar: {
        flex: 2,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    botaoAplicarTexto: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.white,
    },
})