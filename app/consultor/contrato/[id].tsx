import { useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import {
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react-native'
import { buscarContrato, encerrarContrato } from '../../../src/services/contratoService'
import { Contrato } from '../../../src/types'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import CentralModal from '../../../src/components/Modal/CentralModal'
import BackButton from "../../../src/components/Header/BackButton";

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
            <Icone size={14} color={config.cor} />
            <Text style={[styles.badgeText, { color: config.cor }]}>{config.label}</Text>
        </View>
    )
}

function InfoRow({ icone, label, valor }: { icone: React.ReactNode, label: string, valor: string }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcone}>{icone}</View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValor}>{valor}</Text>
            </View>
        </View>
    )
}

export default function ContratoDetalheScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [contrato, setContrato] = useState<Contrato | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingAcao, setLoadingAcao] = useState(false)
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
        onClose: undefined as (() => void) | undefined,
    })

    useFocusEffect(
        useCallback(() => {
            carregarContrato()
        }, [id])
    )

    async function carregarContrato() {
        setLoading(true)
        try {
            const data = await buscarContrato(id)
            setContrato(data)
        } catch {
            setModal({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível carregar o contrato.',
                type: 'error',
                onClose: () => router.back(),
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleEncerrar() {
        setModal({
            visible: true,
            title: 'Encerrar contrato',
            message: 'Tem certeza que deseja encerrar este contrato? Esta ação não pode ser desfeita.',
            type: 'default',
            onClose: confirmarEncerramento,
        })
    }

    async function confirmarEncerramento() {
        setLoadingAcao(true)
        try {
            await encerrarContrato(id)
            setModal({
                visible: true,
                title: 'Contrato encerrado',
                message: 'O contrato foi encerrado com sucesso.',
                type: 'success',
                onClose: () => carregarContrato(),
            })
        } catch (error: any) {
            setModal({
                visible: true,
                title: 'Erro',
                message: error.response?.data?.message || 'Erro ao encerrar contrato.',
                type: 'error',
                onClose: undefined,
            })
        } finally {
            setLoadingAcao(false)
        }
    }

    function formatarData(data: string | null): string {
        if (!data) return '—'
        const d = new Date(data)
        return d.toLocaleDateString('pt-BR')
    }

    if (loading) {
        return (
            <View style={[globalStyles.screen, globalStyles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!contrato) return null

    return (
        <View style={globalStyles.screen}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Voltar ────────────────────────────── */}
                <BackButton />

                {/* ── Cabeçalho ─────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerTopo}>
                        <Text style={globalStyles.pageTitle}>Contrato</Text>
                        <StatusBadge status={contrato.status} />
                    </View>
                    <Text style={globalStyles.pageSubtitle}>
                        {contrato.fazenda?.name ?? '—'}
                    </Text>
                </View>

                {/* ── Informações ───────────────────────── */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Detalhes</Text>
                    <View style={styles.card}>
                        <InfoRow
                            icone={<User size={16} color={Colors.primary} />}
                            label="Fazendeiro"
                            valor={`${contrato.fazendeiro?.name ?? '—'} (@${contrato.fazendeiro?.username ?? '—'})`}
                        />
                        <View style={styles.divisor} />
                        <InfoRow
                            icone={<MapPin size={16} color={Colors.primary} />}
                            label="Fazenda"
                            valor={contrato.fazenda?.name ?? '—'}
                        />
                        <View style={styles.divisor} />
                        <InfoRow
                            icone={<Calendar size={16} color={Colors.primary} />}
                            label="Período"
                            valor={`${formatarData(contrato.start_date)} → ${formatarData(contrato.end_date)}`}
                        />
                        {contrato.value && (
                            <>
                                <View style={styles.divisor} />
                                <InfoRow
                                    icone={<DollarSign size={16} color={Colors.primary} />}
                                    label="Valor"
                                    valor={`R$ ${Number(contrato.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                            </>
                        )}
                        {contrato.scope_description && (
                            <>
                                <View style={styles.divisor} />
                                <InfoRow
                                    icone={<FileText size={16} color={Colors.primary} />}
                                    label="Descrição dos serviços"
                                    valor={contrato.scope_description}
                                />
                            </>
                        )}
                    </View>
                </View>

                {/* ── Ações ─────────────────────────────── */}
                {contrato.status === 'ativo' && (
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Ações</Text>
                        <TouchableOpacity
                            style={[styles.botaoEncerrar, loadingAcao && globalStyles.buttonDisabled]}
                            onPress={handleEncerrar}
                            disabled={loadingAcao}
                            activeOpacity={0.8}
                        >
                            {loadingAcao ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.botaoEncerrarTexto}>Encerrar contrato</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {contrato.status === 'pendente' && (
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Ações</Text>
                        <TouchableOpacity
                            style={[styles.botaoCancelar, loadingAcao && globalStyles.buttonDisabled]}
                            onPress={() => setModal({
                                visible: true,
                                title: 'Cancelar proposta',
                                message: 'Deseja cancelar esta proposta de contrato?',
                                type: 'default',
                                onClose: confirmarEncerramento,
                            })}
                            disabled={loadingAcao}
                            activeOpacity={0.8}
                        >
                            {loadingAcao ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.botaoCancelarTexto}>Cancelar proposta</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => {
                    const fn = modal.onClose
                    setModal({ ...modal, visible: false, onClose: undefined })
                    fn?.()
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: Spacing.lg,
    },
    backText: {
        color: Colors.primary,
        fontSize: FontSize.md,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    headerTopo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
    },
    secao: {
        marginBottom: Spacing.xl,
    },
    secaoTitulo: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    infoIcone: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    infoLabel: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        marginBottom: 2,
    },
    infoValor: {
        fontSize: FontSize.md,
        color: Colors.black,
        fontWeight: '500',
    },
    divisor: {
        height: 1,
        backgroundColor: Colors.gray[200],
    },
    botaoEncerrar: {
        backgroundColor: Colors.error,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    botaoEncerrarTexto: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
    botaoCancelar: {
        backgroundColor: Colors.white,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.error,
    },
    botaoCancelarTexto: {
        color: Colors.error,
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
})