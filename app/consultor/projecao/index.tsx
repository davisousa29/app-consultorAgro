import { useState, useCallback, useMemo } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { TrendingUp, ChevronRight } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import { Icons } from '../../../src/constants/icons'
import SearchBar from '../../../src/components/SearchBar'
import FilterModal, { FilterGroup } from '../../../src/components/FilterModal'
import BackButton from '../../../src/components/Header/BackButton'
import { FilterChip } from '../../../src/components/FilterChips'
import api from '../../../src/services/api'

interface Projecao {
    id: string
    nome: string
    modalidade: string
    total_animais: number
    valor_total: string
    contrato_id: string | null
    created_at: string
    contrato: {
        fazenda: { name: string } | null
        fazendeiro: { username: string } | null
    } | null
}

const MODALIDADE_LABEL: Record<string, string> = {
    arroba: 'Arroba (@)',
    kg:     'Kg vivo',
    cabeca: 'Cabeça',
}

const MODALIDADE_CHIPS: FilterChip[] = [
    { label: 'Todos',      value: 'todos' },
    { label: 'Arroba (@)', value: 'arroba' },
    { label: 'Kg vivo',    value: 'kg' },
    { label: 'Cabeça',     value: 'cabeca' },
]

const VINCULO_CHIPS: FilterChip[] = [
    { label: 'Todos',        value: 'todos' },
    { label: 'Com contrato', value: 'com_contrato',  cor: Colors.primary },
    { label: 'Sem contrato', value: 'sem_contrato',  cor: '#6C757D' },
]

const ORDEM_CHIPS: FilterChip[] = [
    { label: 'Mais recentes', value: 'recentes' },
    { label: 'Mais antigos',  value: 'antigos' },
    { label: 'Maior valor',   value: 'maior_valor' },
    { label: 'Menor valor',   value: 'menor_valor' },
]

export default function ProjecoesScreen() {
    const [projecoes, setProjecoes] = useState<Projecao[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [modalidadeFiltro, setModalidadeFiltro] = useState('todos')
    const [vinculoFiltro, setVinculoFiltro] = useState('todos')
    const [ordem, setOrdem] = useState('recentes')

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

    const projecoesFiltradas = useMemo(() => {
        let resultado = [...projecoes]

        if (busca.trim()) {
            const termo = busca.toLowerCase()
            resultado = resultado.filter(p => p.nome.toLowerCase().includes(termo))
        }

        if (modalidadeFiltro !== 'todos') {
            resultado = resultado.filter(p => p.modalidade === modalidadeFiltro)
        }

        if (vinculoFiltro === 'com_contrato') {
            resultado = resultado.filter(p => p.contrato_id !== null)
        } else if (vinculoFiltro === 'sem_contrato') {
            resultado = resultado.filter(p => p.contrato_id === null)
        }

        resultado.sort((a, b) => {
            if (ordem === 'recentes') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            if (ordem === 'antigos')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            if (ordem === 'maior_valor') return Number(b.valor_total) - Number(a.valor_total)
            if (ordem === 'menor_valor') return Number(a.valor_total) - Number(b.valor_total)
            return 0
        })

        return resultado
    }, [projecoes, busca, modalidadeFiltro, vinculoFiltro, ordem])

    function formatarData(data: string): string {
        return new Date(data).toLocaleDateString('pt-BR')
    }

    function renderProjecao({ item }: { item: Projecao }) {
        return (
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
                        {item.total_animais} anim{item.total_animais !== 1 ? 'ais' : 'al'} · {MODALIDADE_LABEL[item.modalidade] ?? item.modalidade}
                    </Text>
                    <View style={styles.cardRodape}>
                        <Text style={styles.cardValor}>
                            R$ {Number(item.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                        <Text style={styles.cardData}>{formatarData(item.created_at)}</Text>
                    </View>
                    {item.contrato && (
                        <Text style={styles.cardContrato} numberOfLines={1}>
                            {item.contrato.fazenda?.name ?? '—'} · @{item.contrato.fazendeiro?.username ?? '—'}
                        </Text>
                    )}
                </View>
                <ChevronRight size={18} color={Colors.gray[400]} />
            </TouchableOpacity>
        )
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
                data={projecoesFiltradas}
                keyExtractor={item => item.id}
                renderItem={renderProjecao}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View style={styles.header}>
                        <BackButton />

                        <Text style={globalStyles.pageTitle}>Projeções de Venda</Text>
                        <Text style={globalStyles.pageSubtitle}>
                            {projecoesFiltradas.length} projeção{projecoesFiltradas.length !== 1 ? 'ões' : ''} encontrada{projecoesFiltradas.length !== 1 ? 's' : ''}
                        </Text>

                        <View style={styles.filtrosRow}>
                            <SearchBar
                                value={busca}
                                onChange={setBusca}
                                placeholder="Buscar por nome da projeção..."
                            />
                            <FilterModal
                                grupos={[
                                    {
                                        label: 'Modalidade',
                                        chips: MODALIDADE_CHIPS,
                                        valor: modalidadeFiltro,
                                        onChange: setModalidadeFiltro,
                                    },
                                    {
                                        label: 'Vínculo',
                                        chips: VINCULO_CHIPS,
                                        valor: vinculoFiltro,
                                        onChange: setVinculoFiltro,
                                    },
                                    {
                                        label: 'Ordenar por',
                                        chips: ORDEM_CHIPS,
                                        valor: ordem,
                                        onChange: setOrdem,
                                    },
                                ] as FilterGroup[]}
                                onLimpar={() => {
                                    setModalidadeFiltro('todos')
                                    setVinculoFiltro('todos')
                                    setOrdem('recentes')
                                }}
                            />
                        </View>

                        <TouchableOpacity
                            style={[globalStyles.buttonPrimary, { marginTop: Spacing.md }]}
                            onPress={() => router.push('/consultor/projecao/nova' as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={globalStyles.buttonPrimaryText}>+ Nova projeção</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.vazio}>
                        <Icons.trendingUp size={40} color={Colors.gray[400]} />
                        <Text style={styles.vazioTexto}>
                            {busca || modalidadeFiltro !== 'todos' || vinculoFiltro !== 'todos'
                                ? 'Nenhuma projeção encontrada'
                                : 'Nenhuma projeção ainda'}
                        </Text>
                        <Text style={styles.vazioSubtexto}>
                            {busca || modalidadeFiltro !== 'todos' || vinculoFiltro !== 'todos'
                                ? 'Tente outros filtros'
                                : 'Crie sua primeira projeção de venda'}
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    filtrosRow: {
        gap: Spacing.sm,
        marginTop: Spacing.md,
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
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
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