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
import { FileText, TrendingUp } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import BackButton from '../../../src/components/Header/BackButton'
import CentralModal from '../../../src/components/Modal/CentralModal'
import api from '../../../src/services/api'
import { Icons } from '../../../src/constants/icons'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { toastErro, toastInfo, toastSucesso } from '../../../src/utils/toast'

const MODALIDADE_LABEL: Record<string, string> = {
    arroba: 'Arroba (@)',
    kg:     'Kg vivo',
    cabeca: 'Cabeça',
}

export default function ProjecaoDetalheScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [projecao, setProjecao] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [gerandoPdf, setGerandoPdf] = useState(false)

    const [contratosAtivos, setContratosAtivos] = useState<any[]>([])
    const [mostrarContratos, setMostrarContratos] = useState(false)
    const [loadingContratos, setLoadingContratos] = useState(false)
    const [vinculando, setVinculando] = useState(false)

    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
        onClose: undefined as (() => void) | undefined,
    })

    useFocusEffect(
        useCallback(() => {
            carregarProjecao()
        }, [id])
    )

    async function carregarProjecao() {
        setLoading(true)
        try {
            const response = await api.get(`/projecoes/${id}`)
            setProjecao(response.data.projecao)
        } catch {
            setModal({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível carregar a projeção.',
                type: 'error',
                onClose: () => router.back(),
            })
        } finally {
            setLoading(false)
        }
    }

    async function buscarContratosAtivos() {
        setLoadingContratos(true)
        try {
            const response = await api.get('/contratos')
            const ativos = response.data.contratos.filter((c: any) => c.status === 'ativo')

            if (ativos.length === 0) {
                toastInfo('Nenhum contrato ativo encontrado.')
                return
            }

            setContratosAtivos(ativos)
            setMostrarContratos(true)
        } catch {
            toastErro('Não foi possível carregar os contratos.')
        } finally {
            setLoadingContratos(false)
        }
    }

    async function handleVincular(contratoId: string) {
        setMostrarContratos(false)
        setVinculando(true)
        try {
            await api.patch(`/projecoes/${id}/contrato`, { contrato_id: contratoId })
            toastSucesso('Projeção vinculada ao contrato com sucesso.')
            carregarProjecao()
        } catch (error: any) {
            toastErro(error.response?.data?.message || 'Erro ao vincular.')
        } finally {
            setVinculando(false)
        }
    }

    async function handleGerarPdf() {
        setGerandoPdf(true)
        try {
            const response = await api.get(`/projecoes/${id}/pdf`)
            const html = response.data.html

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            })

            const podeCompartilhar = await Sharing.isAvailableAsync()

            if (podeCompartilhar) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: projecao.nome,
                    UTI: 'com.adobe.pdf',
                })
            } else {
                setModal({
                    visible: true,
                    title: 'PDF gerado!',
                    message: `O PDF foi salvo em: ${uri}`,
                    type: 'success',
                    onClose: undefined,
                })
            }
        } catch {
            setModal({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível gerar o PDF.',
                type: 'error',
                onClose: undefined,
            })
        } finally {
            setGerandoPdf(false)
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

    if (!projecao) return null

    const mediaPesoVazias = projecao.media_peso_vazias
        ? Number(projecao.media_peso_vazias).toLocaleString('pt-BR', { minimumFractionDigits: 1 })
        : '—'

    return (
        <View style={globalStyles.screen}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <BackButton />

                {/* Cabeçalho */}
                <View style={styles.cabecalho}>
                    <View style={styles.cabecalhoTopo}>
                        <View style={styles.cabecalhoIcone}>
                            <TrendingUp size={28} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={globalStyles.pageTitle} numberOfLines={2}>
                                {projecao.nome}
                            </Text>
                            <Text style={styles.cabecalhoData}>
                                {formatarData(projecao.created_at)} · {MODALIDADE_LABEL[projecao.modalidade]}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Resumo */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Resumo</Text>
                    <View style={styles.resumoGrid}>
                        <View style={styles.resumoCard}>
                            <Icons.pawPrint size={22} color={Colors.primary} />
                            <Text style={styles.resumoValor}>{projecao.total_animais}</Text>
                            <Text style={styles.resumoLabel}>total animais</Text>
                        </View>
                        <View style={styles.resumoCard}>
                            <Icons.circleMinus size={22} color={Colors.primary} />
                            <Text style={styles.resumoValor}>{projecao.total_vazias}</Text>
                            <Text style={styles.resumoLabel}>vazias</Text>
                        </View>
                        <View style={styles.resumoCard}>
                            <Icons.circleDotDashed size={22} color={Colors.primary} />
                            <Text style={styles.resumoValor}>{projecao.total_prenhas}</Text>
                            <Text style={styles.resumoLabel}>prenhas</Text>
                        </View>
                        <View style={styles.resumoCard}>
                            <Icons.dolar size={22} color={Colors.primary} />
                            <Text style={styles.resumoValor}>
                                R$ {Number(projecao.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={styles.resumoLabel}>valor total</Text>
                        </View>
                    </View>
                </View>

                {/* Configuração */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Configuração</Text>
                    <View style={styles.card}>
                        {[
                            { label: 'Modalidade', valor: MODALIDADE_LABEL[projecao.modalidade] },
                            { label: 'Preço unitário', valor: `R$ ${Number(projecao.preco_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                            projecao.total_peso_kg > 0 && { label: 'Peso total', valor: `${Number(projecao.total_peso_kg).toLocaleString('pt-BR')} kg` },
                            projecao.total_arrobas && { label: 'Total arrobas', valor: `${Number(projecao.total_arrobas).toLocaleString('pt-BR', { minimumFractionDigits: 3 })} @` },
                            projecao.media_peso_vazias && { label: 'Média peso vazias', valor: `${mediaPesoVazias} kg` },
                        ].filter(Boolean).map((item: any, index, arr) => (
                            <View key={index}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{item.label}</Text>
                                    <Text style={styles.infoValor}>{item.valor}</Text>
                                </View>
                                {index < arr.length - 1 && <View style={styles.divisor} />}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Tabela de animais */}
                {projecao.animais?.length > 0 && (
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Animais</Text>
                        <View style={styles.card}>
                            <View style={styles.tabelaHeader}>
                                <Text style={[styles.tabelaColHeader, { flex: 1 }]}>N°</Text>
                                <Text style={[styles.tabelaColHeader, { width: 50 }]}>Pren.</Text>
                                <Text style={[styles.tabelaColHeader, { width: 60, textAlign: 'right' }]}>Peso</Text>
                                <Text style={[styles.tabelaColHeader, { width: 40, textAlign: 'center' }]}>Qtd</Text>
                                <Text style={[styles.tabelaColHeader, { width: 80, textAlign: 'right' }]}>Valor</Text>
                            </View>
                            <View style={styles.divisor} />

                            {projecao.animais.map((animal: any, index: number) => (
                                <View key={animal.id}>
                                    <View style={styles.tabelaLinha}>
                                        <Text style={[styles.tabelaCol, { flex: 1 }]} numberOfLines={1}>
                                            {animal.numero_animal ?? `#${index + 1}`}
                                        </Text>
                                        <Text style={[styles.tabelaCol, { width: 50, color: animal.prenhez ? Colors.success : Colors.gray[400] }]}>
                                            {animal.prenhez ? '✓ Sim' : 'Não'}
                                        </Text>
                                        <Text style={[styles.tabelaCol, { width: 60, textAlign: 'right' }]}>
                                            {animal.peso_kg ? `${Number(animal.peso_kg).toFixed(0)}kg` : '—'}
                                        </Text>
                                        <Text style={[styles.tabelaCol, { width: 40, textAlign: 'center' }]}>
                                            {animal.quantidade}
                                        </Text>
                                        <Text style={[styles.tabelaCol, { width: 80, textAlign: 'right', color: Colors.primary, fontWeight: '600' }]}>
                                            {Number(animal.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                                        </Text>
                                    </View>
                                    {index < projecao.animais.length - 1 && <View style={styles.divisor} />}
                                </View>
                            ))}

                            <View style={styles.divisor} />
                            <View style={styles.tabelaLinha}>
                                <Text style={[styles.tabelaCol, { flex: 1, fontWeight: 'bold', color: Colors.black }]}>Total</Text>
                                <Text style={[styles.tabelaCol, { width: 50 }]} />
                                <Text style={[styles.tabelaCol, { width: 60 }]} />
                                <Text style={[styles.tabelaCol, { width: 40, textAlign: 'center', fontWeight: 'bold' }]}>
                                    {projecao.total_animais}
                                </Text>
                                <Text style={[styles.tabelaCol, { width: 80, textAlign: 'right', fontWeight: 'bold', color: Colors.primary, fontSize: FontSize.sm }]}>
                                    {Number(projecao.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Contrato vinculado */}
                {projecao.contrato && (
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Contrato vinculado</Text>
                        <TouchableOpacity
                            style={styles.contratoCard}
                            onPress={() => router.push(`/consultor/contrato/${projecao.contrato.id}` as any)}
                            activeOpacity={0.8}
                        >
                            <FileText size={20} color={Colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contratoNome}>{projecao.contrato.fazenda?.name}</Text>
                                <Text style={styles.contratoFazendeiro}>@{projecao.contrato.fazendeiro?.username}</Text>
                            </View>
                            <Text style={styles.contratoVer}>Ver →</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Vincular a contrato */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>
                        {projecao.contrato ? 'Vincular a outro contrato' : 'Vincular a um contrato'}
                    </Text>

                    <TouchableOpacity
                        style={[styles.botaoVincular, (loadingContratos || vinculando) && globalStyles.buttonDisabled]}
                        onPress={buscarContratosAtivos}
                        disabled={loadingContratos || vinculando}
                        activeOpacity={0.8}
                    >
                        {loadingContratos || vinculando ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <Text style={styles.botaoVincularTexto}>
                                {projecao.contrato ? '+ Vincular a outro contrato' : '+ Vincular a um contrato'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {mostrarContratos && (
                        <View style={[styles.card, { marginTop: Spacing.sm }]}>
                            <Text style={styles.contratoDropdownTitulo}>
                                {contratosAtivos.length > 0 ? 'Selecione um contrato' : 'Nenhum contrato ativo encontrado'}
                            </Text>
                            {contratosAtivos.map((contrato, index) => (
                                <View key={contrato.id}>
                                    {index > 0 && <View style={styles.divisor} />}
                                    <TouchableOpacity
                                        style={styles.contratoOpcao}
                                        onPress={() => handleVincular(contrato.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.contratoNome}>{contrato.fazenda?.name ?? '—'}</Text>
                                            <Text style={styles.contratoFazendeiro}>@{contrato.fazendeiro?.username ?? '—'}</Text>
                                        </View>
                                        <Text style={styles.contratoVer}>Vincular →</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.divisor} />
                            <TouchableOpacity
                                style={{ alignItems: 'center', paddingVertical: Spacing.sm }}
                                onPress={() => setMostrarContratos(false)}
                            >
                                <Text style={{ color: Colors.error, fontWeight: '600', fontSize: FontSize.sm }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Ações */}
                <View style={styles.secao}>
                    <TouchableOpacity
                        style={[globalStyles.buttonSecondary, gerandoPdf && globalStyles.buttonDisabled]}
                        onPress={handleGerarPdf}
                        disabled={gerandoPdf}
                        activeOpacity={0.8}
                    >
                        {gerandoPdf ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <View style={globalStyles.buttonRow}>
                                <Icons.graphic size={20} color={Colors.primary} />
                                <Text style={globalStyles.buttonSecondaryText}>Gerar PDF</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

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
    cabecalho: {
        marginBottom: Spacing.xl,
    },
    cabecalhoTopo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
    },
    cabecalhoIcone: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cabecalhoData: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        marginTop: 4,
    },
    secao: {
        marginBottom: Spacing.xl,
    },
    secaoTitulo: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.sm,
    },
    resumoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    resumoCard: {
        width: '47%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    resumoValor: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
    },
    resumoLabel: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        textAlign: 'center',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    infoLabel: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    infoValor: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.black,
    },
    divisor: {
        height: 1,
        backgroundColor: Colors.gray[200],
    },
    tabelaHeader: {
        flexDirection: 'row',
        paddingVertical: Spacing.xs,
    },
    tabelaColHeader: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: Colors.gray[500],
        textTransform: 'uppercase',
    },
    tabelaLinha: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    tabelaCol: {
        fontSize: FontSize.xs,
        color: Colors.black,
    },
    contratoCard: {
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
    contratoNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    contratoFazendeiro: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    contratoVer: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    botaoVincular: {
        borderWidth: 1.5,
        borderColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    botaoVincularTexto: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    contratoDropdownTitulo: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.sm,
    },
    contratoOpcao: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
})