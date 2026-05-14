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
import { FileText, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native'
import { listarContratos } from '../../src/services/contratoService'
import { Contrato } from '../../src/types'
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import SearchBar from '../../src/components/SearchBar'
import FilterChips, { FilterChip } from '../../src/components/FilterChips'

const STATUS_CHIPS: FilterChip[] = [
    { label: 'Todos',     value: 'todos' },
    { label: 'Pendente',  value: 'pendente',  cor: '#FAB005' },
    { label: 'Ativo',     value: 'ativo',     cor: '#40C057' },
    { label: 'Encerrado', value: 'encerrado', cor: '#6C757D' },
    { label: 'Cancelado', value: 'cancelado', cor: '#FA5252' },
]

const ORDEM_CHIPS: FilterChip[] = [
    { label: 'Mais recentes', value: 'recentes' },
    { label: 'Mais antigos',  value: 'antigos' },
]

function StatusBadge({ status }: { status: string }) {
    const config = {
        pendente:  { cor: '#FAB005', icone: Clock,       label: 'Pendente' },
        ativo:     { cor: '#40C057', icone: CheckCircle, label: 'Ativo' },
        encerrado: { cor: '#6C757D', icone: XCircle,     label: 'Encerrado' },
        cancelado: { cor: '#FA5252', icone: AlertCircle, label: 'Cancelado' },
    }[status] ?? { cor: '#6C757D', icone: AlertCircle, label: status }

    const Icone = config.icone

    return (
        <View style={[styles.badge, { backgroundColor: config.cor + '20' }]}>
            <Icone size={12} color={config.cor} />
            <Text style={[styles.badgeText, { color: config.cor }]}>{config.label}</Text>
        </View>
    )
}

export default function ContratosScreen() {
    const [contratos, setContratos] = useState<Contrato[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [statusFiltro, setStatusFiltro] = useState('todos')
    const [ordem, setOrdem] = useState('recentes')

    useFocusEffect(
        useCallback(() => {
            carregarContratos()
        }, [])
    )

    async function carregarContratos() {
        setLoading(true)
        try {
            const data = await listarContratos()
            setContratos(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // ── Filtragem e ordenação local ───────────────────────────────────────────
    const contratosFiltrados = useMemo(() => {
        let resultado = [...contratos]

        // Filtro por texto
        if (busca.trim()) {
            const termo = busca.toLowerCase().trim()
            resultado = resultado.filter(c =>
                c.fazenda?.name?.toLowerCase().includes(termo) ||
                c.fazendeiro?.username?.toLowerCase().includes(termo) ||
                c.fazendeiro?.name?.toLowerCase().includes(termo)
            )
        }

        // Filtro por status
        if (statusFiltro !== 'todos') {
            resultado = resultado.filter(c => c.status === statusFiltro)
        }

        // Ordenação
        resultado.sort((a, b) => {
            const dataA = new Date(a.created_at).getTime()
            const dataB = new Date(b.created_at).getTime()
            return ordem === 'recentes' ? dataB - dataA : dataA - dataB
        })

        return resultado
    }, [contratos, busca, statusFiltro, ordem])

    function formatarData(data: string | null): string {
        if (!data) return '—'
        return new Date(data).toLocaleDateString('pt-BR')
    }

    function renderContrato({ item }: { item: Contrato }) {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/consultor/contrato/${item.id}` as any)}
                activeOpacity={0.8}
            >
                <View style={styles.cardIcone}>
                    <FileText size={22} color={Colors.primary} />
                </View>

                <View style={styles.cardInfo}>
                    <View style={styles.cardTopo}>
                        <Text style={styles.cardFazenda} numberOfLines={1}>
                            {item.fazenda?.name ?? '—'}
                        </Text>
                        <StatusBadge status={item.status} />
                    </View>

                    <Text style={styles.cardFazendeiro}>
                        @{item.fazendeiro?.username ?? '—'}
                    </Text>

                    <Text style={styles.cardData}>
                        {formatarData(item.start_date)} → {formatarData(item.end_date)}
                    </Text>

                    {item.value && (
                        <Text style={styles.cardValor}>
                            R$ {Number(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

            {/* ── Cabeçalho ─────────────────────────── */}
            <View style={styles.header}>
                <Text style={globalStyles.pageTitle}>Contratos</Text>
                <Text style={globalStyles.pageSubtitle}>
                    {contratosFiltrados.length} contrato{contratosFiltrados.length !== 1 ? 's' : ''} encontrado{contratosFiltrados.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* ── Filtros ───────────────────────────── */}
            <View style={styles.filtros}>
                <SearchBar
                    value={busca}
                    onChange={setBusca}
                    placeholder="Buscar por fazenda ou @fazendeiro"
                />

                <FilterChips
                    chips={STATUS_CHIPS}
                    selecionado={statusFiltro}
                    onChange={setStatusFiltro}
                />

                <FilterChips
                    chips={ORDEM_CHIPS}
                    selecionado={ordem}
                    onChange={setOrdem}
                />
            </View>

            {/* ── Lista ─────────────────────────────── */}
            <FlatList
                data={contratosFiltrados}
                keyExtractor={item => item.id}
                renderItem={renderContrato}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.vazio}>
                        <Text style={styles.vazioEmoji}>📋</Text>
                        <Text style={styles.vazioTexto}>
                            {busca || statusFiltro !== 'todos'
                                ? 'Nenhum contrato encontrado'
                                : 'Nenhum contrato ainda'}
                        </Text>
                        <Text style={styles.vazioSubtexto}>
                            {busca || statusFiltro !== 'todos'
                                ? 'Tente outros filtros de busca'
                                : 'Busque um fazendeiro e proponha um contrato'}
                        </Text>
                        {!busca && statusFiltro === 'todos' && (
                            <TouchableOpacity
                                style={[globalStyles.buttonPrimary, { marginTop: Spacing.lg }]}
                                onPress={() => router.push('/consultor/busca' as any)}
                            >
                                <Text style={globalStyles.buttonPrimaryText}>Buscar fazendeiros</Text>
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
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    filtros: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
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
        gap: 2,
    },
    cardTopo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    cardFazenda: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
        flex: 1,
    },
    cardFazendeiro: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    cardData: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        marginTop: 2,
    },
    cardValor: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
    vazioEmoji: {
        fontSize: 48,
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