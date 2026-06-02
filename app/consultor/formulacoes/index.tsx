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
import { ChevronRight, FlaskConical } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import { Icons } from '../../../src/constants/icons'
import SearchBar from '../../../src/components/SearchBar'
import FilterChips, { FilterChip } from '../../../src/components/FilterChips'
import FilterModal, { FilterGroup } from '../../../src/components/FilterModal'
import api from '../../../src/services/api'

interface ProgramaRacao {
    id: string
    nome: string
    status: string
    contrato_id: string | null
    custo_animal_dia: string | null
    quantidade_animais: number
    tipo_aplicacao: string
    created_at: string
    especie: { nome: string } | null
    raca: { nome: string } | null
    categoria: { nome: string } | null
    sistema: { nome: string } | null
    contrato: {
        fazenda: { name: string } | null
        fazendeiro: { username: string } | null
    } | null
}

const STATUS_CHIPS: FilterChip[] = [
    { label: 'Todos',     value: 'todos' },
    { label: 'Ativo',     value: 'ativo',     cor: '#40C057' },
    { label: 'Rascunho',  value: 'rascunho',  cor: '#FAB005' },
    { label: 'Encerrado', value: 'encerrado', cor: '#6C757D' },
]

const VINCULO_CHIPS: FilterChip[] = [
    { label: 'Todos',          value: 'todos' },
    { label: 'Com contrato',   value: 'com_contrato',  cor: Colors.primary },
    { label: 'Sem contrato',   value: 'sem_contrato',  cor: '#6C757D' },
]

const ORDEM_CHIPS: FilterChip[] = [
    { label: 'Mais recentes', value: 'recentes' },
    { label: 'Mais antigos',  value: 'antigos' },
    { label: 'Menor custo',   value: 'menor_custo' },
    { label: 'Maior custo',   value: 'maior_custo' },
]

function StatusBadge({ status }: { status: string }) {
    const config = {
        ativo:     { cor: '#40C057', label: 'Ativo' },
        rascunho:  { cor: '#FAB005', label: 'Rascunho' },
        encerrado: { cor: '#6C757D', label: 'Encerrado' },
    }[status] ?? { cor: '#6C757D', label: status }

    return (
        <View style={[styles.badge, { backgroundColor: config.cor + '20' }]}>
            <Text style={[styles.badgeText, { color: config.cor }]}>{config.label}</Text>
        </View>
    )
}

export default function FormulacoesScreen() {
    const [programas, setProgramas] = useState<ProgramaRacao[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [statusFiltro, setStatusFiltro] = useState('todos')
    const [vinculoFiltro, setVinculoFiltro] = useState('todos')
    const [especieFiltro, setEspecieFiltro] = useState('todos')
    const [ordem, setOrdem] = useState('recentes')
    const [especies, setEspecies] = useState<FilterChip[]>([{ label: 'Todos', value: 'todos' }])

    useFocusEffect(
        useCallback(() => {
            carregarProgramas()
        }, [])
    )

    async function carregarProgramas() {
        setLoading(true)
        try {
            const response = await api.get('/racao/programas')
            const data: ProgramaRacao[] = response.data.programas

            setProgramas(data)

            // Monta chips de espécie dinamicamente
            const especiesUnicas = Array.from(
                new Set(data.map(p => p.especie?.nome).filter(Boolean))
            ) as string[]

            setEspecies([
                { label: 'Todos', value: 'todos' },
                ...especiesUnicas.map(e => ({ label: e, value: e })),
            ])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const programasFiltrados = useMemo(() => {
        let resultado = [...programas]

        if (busca.trim()) {
            const termo = busca.toLowerCase()
            resultado = resultado.filter(p =>
                p.nome.toLowerCase().includes(termo) ||
                p.especie?.nome?.toLowerCase().includes(termo) ||
                p.raca?.nome?.toLowerCase().includes(termo)
            )
        }

        if (statusFiltro !== 'todos') {
            resultado = resultado.filter(p => p.status === statusFiltro)
        }

        if (vinculoFiltro === 'com_contrato') {
            resultado = resultado.filter(p => p.contrato_id !== null)
        } else if (vinculoFiltro === 'sem_contrato') {
            resultado = resultado.filter(p => p.contrato_id === null)
        }

        if (especieFiltro !== 'todos') {
            resultado = resultado.filter(p => p.especie?.nome === especieFiltro)
        }

        resultado.sort((a, b) => {
            if (ordem === 'recentes') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            if (ordem === 'antigos')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            if (ordem === 'menor_custo') return Number(a.custo_animal_dia ?? 0) - Number(b.custo_animal_dia ?? 0)
            if (ordem === 'maior_custo') return Number(b.custo_animal_dia ?? 0) - Number(a.custo_animal_dia ?? 0)
            return 0
        })

        return resultado
    }, [programas, busca, statusFiltro, vinculoFiltro, especieFiltro, ordem])

    function formatarData(data: string): string {
        return new Date(data).toLocaleDateString('pt-BR')
    }

    function renderPrograma({ item }: { item: ProgramaRacao }) {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/consultor/formulacoes/${item.id}` as any)}
                activeOpacity={0.8}
            >
                <View style={styles.cardIcone}>
                    <FlaskConical size={22} color={Colors.primary} />
                </View>

                <View style={styles.cardInfo}>
                    <View style={styles.cardTopo}>
                        <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
                        <StatusBadge status={item.status} />
                    </View>

                    <Text style={styles.cardDetalhe}>
                        {item.especie?.nome} · {item.raca?.nome} · {item.sistema?.nome}
                    </Text>

                    <Text style={styles.cardDetalhe}>
                        {item.quantidade_animais} anim{item.quantidade_animais > 1 ? 'ais' : 'al'} · {item.tipo_aplicacao}
                    </Text>

                    {item.contrato ? (
                        <Text style={styles.cardContrato}>
                            <Icons.clipBoard size={25} color={Colors.primary} />
                            {item.contrato.fazenda?.name ?? '—'} · @{item.contrato.fazendeiro?.username ?? '—'}
                        </Text>
                    ) : (
                        <Text style={styles.cardSemContrato}>Sem contrato vinculado</Text>
                    )}

                    <View style={styles.cardRodape}>
                        {item.custo_animal_dia && (
                            <Text style={styles.cardCusto}>
                                R$ {Number(item.custo_animal_dia).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/animal/dia
                            </Text>
                        )}
                        <Text style={styles.cardData}>{formatarData(item.created_at)}</Text>
                    </View>
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
                data={programasFiltrados}
                keyExtractor={item => item.id}
                renderItem={renderPrograma}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={globalStyles.pageTitle}>Minhas Formulações</Text>
                        <Text style={globalStyles.pageSubtitle}>
                            {programasFiltrados.length} formulação{programasFiltrados.length !== 1 ? 'ões' : ''} encontrada{programasFiltrados.length !== 1 ? 's' : ''}
                        </Text>

                        <View style={styles.filtrosRow}>
                            <SearchBar
                                value={busca}
                                onChange={setBusca}
                                placeholder="Buscar por nome, espécie ou raça..."
                            />
                            <FilterModal
                                grupos={[
                                    {
                                        label: 'Status',
                                        chips: STATUS_CHIPS,
                                        valor: statusFiltro,
                                        onChange: setStatusFiltro,
                                    },
                                    {
                                        label: 'Vínculo',
                                        chips: VINCULO_CHIPS,
                                        valor: vinculoFiltro,
                                        onChange: setVinculoFiltro,
                                    },
                                    ...(especies.length > 1 ? [{
                                        label: 'Espécie',
                                        chips: especies,
                                        valor: especieFiltro,
                                        onChange: setEspecieFiltro,
                                    }] : []),
                                    {
                                        label: 'Ordenar por',
                                        chips: ORDEM_CHIPS,
                                        valor: ordem,
                                        onChange: setOrdem,
                                    },
                                ] as FilterGroup[]}
                                onLimpar={() => {
                                    setStatusFiltro('todos')
                                    setVinculoFiltro('todos')
                                    setEspecieFiltro('todos')
                                    setOrdem('recentes')
                                }}
                            />
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.vazio}>
                        <Icons.notFoundBottle size={40} color="#FF0000" />
                        <Text style={styles.vazioTexto}>
                            {busca || statusFiltro !== 'todos' || vinculoFiltro !== 'todos'
                                ? 'Nenhuma formulação encontrada'
                                : 'Nenhuma formulação ainda'}
                        </Text>
                        <Text style={styles.vazioSubtexto}>
                            {busca || statusFiltro !== 'todos' || vinculoFiltro !== 'todos'
                                ? 'Tente outros filtros'
                                : 'Crie sua primeira formulação de ração'}
                        </Text>
                        {!busca && statusFiltro === 'todos' && vinculoFiltro === 'todos' && (
                            <TouchableOpacity
                                style={[globalStyles.buttonPrimary, { marginTop: Spacing.lg }]}
                                onPress={() => router.push('/consultor/racao' as any)}
                            >
                                <Text style={globalStyles.buttonPrimaryText}>Nova formulação</Text>
                            </TouchableOpacity>
                        )}
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
        paddingBottom: Spacing.xl,
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
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
    cardTopo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    cardNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
        flex: 1,
    },
    cardDetalhe: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
    },
    cardContrato: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    cardSemContrato: {
        fontSize: FontSize.xs,
        color: Colors.gray[400],
    },
    cardRodape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    cardCusto: {
        fontSize: FontSize.xs,
        color: Colors.success,
        fontWeight: '600',
    },
    cardData: {
        fontSize: FontSize.xs,
        color: Colors.gray[400],
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    vazio: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
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