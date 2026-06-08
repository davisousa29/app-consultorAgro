import { useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { TrendingUp, ChevronRight, Plus } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import { Icons } from '../../../src/constants/icons'
import api from '../../../src/services/api'

const MODALIDADE_LABEL: Record<string, string> = {
    arroba: 'Arroba (@)',
    kg:     'Kg vivo',
    cabeca: 'Cabeça',
}

export default function ProjecoesScreen() {
    const [projecoes, setProjecoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            carregarProjecoes()
        }, [])
    )

    async function carregarProjecoes() {
        setLoading(true)
        try {
            const response = await api.get('/projecoes')
            setProjecoes(response.data.projecoes)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    function formatarData(data: string): string {
        return new Date(data).toLocaleDateString('pt-BR')
    }

    if (loading) {
        return (
            <View style={[globalStyles.screen, globalStyles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    return (
        <View style={globalStyles.screen}>
            <FlatList
                data={projecoes}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={globalStyles.pageTitle}>Projeções de Venda</Text>
                        <Text style={globalStyles.pageSubtitle}>
                            {projecoes.length} projeção{projecoes.length !== 1 ? 'ões' : ''} encontrada{projecoes.length !== 1 ? 's' : ''}
                        </Text>
                        <TouchableOpacity
                            style={[globalStyles.buttonPrimary, { marginTop: Spacing.md }]}
                            onPress={() => router.push('/consultor/projecao/nova' as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={globalStyles.buttonPrimaryText}>+ Nova projeção</Text>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push(`/consultor/projecao/${item.id}` as any)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardIcone}>
                            <TrendingUp size={22} color={Colors.primary} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
                            <Text style={styles.cardDetalhe}>
                                {item.total_animais} animal{item.total_animais !== 1 ? 'is' : ''} · {MODALIDADE_LABEL[item.modalidade] ?? item.modalidade}
                            </Text>
                            <View style={styles.cardRodape}>
                                <Text style={styles.cardValor}>
                                    R$ {Number(item.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                                <Text style={styles.cardData}>{formatarData(item.created_at)}</Text>
                            </View>
                            {item.contrato && (
                                <Text style={styles.cardContrato}>
                                    <Icons.clipBoard size={25} color={Colors.primary} />
                                     {item.contrato.fazenda?.name ?? '—'}
                                </Text>
                            )}
                        </View>
                        <ChevronRight size={18} color={Colors.gray[400]} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.vazio}>
                        <Icons.graphic size={25} color={Colors.primary} />
                        <Text style={styles.vazioTexto}>Nenhuma projeção ainda</Text>
                        <Text style={styles.vazioSubtexto}>
                            Crie sua primeira projeção de venda
                        </Text>
                        <TouchableOpacity
                            style={[globalStyles.buttonPrimary, { marginTop: Spacing.lg }]}
                            onPress={() => router.push('/consultor/projecao/nova' as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={globalStyles.buttonPrimaryText}>+ Nova projeção</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    lista: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardIcone: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        gap: 3,
    },
    cardNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    cardDetalhe: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
    },
    cardRodape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardValor: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.primary,
    },
    cardData: {
        fontSize: FontSize.xs,
        color: Colors.gray[400],
    },
    cardContrato: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    vazio: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.sm,
    },
    vazioEmoji: { fontSize: 48 },
    vazioTexto: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.gray[700],
    },
    vazioSubtexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
        textAlign: 'center',
    },
})