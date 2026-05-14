import { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { ChevronDown } from 'lucide-react-native'
import { buscarPerfilFazendeiro } from '../../src/services/buscaService'
import { proporContrato } from '../../src/services/contratoService'
import { FazendeiroPublico } from '../../src/types'
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import DateInput from '../../src/components/Input/DateInput'
import CurrencyInput, { parsearMoeda } from '../../src/components/Input/CurrencyInput'
import CentralModal from '../../src/components/Modal/CentralModal'
import BackButton from "../../src/components/Header/BackButton";



export default function NovoContratoScreen() {
    const { username } = useLocalSearchParams<{ username: string }>()

    const [fazendeiro, setFazendeiro] = useState<FazendeiroPublico | null>(null)
    const [loadingPerfil, setLoadingPerfil] = useState(true)
    const [loading, setLoading] = useState(false)

    const [fazendaSelecionada, setFazendaSelecionada] = useState<string>('')
    const [mostrarFazendas, setMostrarFazendas] = useState(false)
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [valor, setValor] = useState('')
    const [descricao, setDescricao] = useState('')
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
        onClose: undefined as (() => void) | undefined,
    })

    useEffect(() => {
        carregarPerfil()
    }, [username])

    async function carregarPerfil() {
        try {
            const data = await buscarPerfilFazendeiro(username)
            setFazendeiro(data)
            if (data.fazendas.length === 1) {
                setFazendaSelecionada(data.fazendas[0].id)
            }
        } catch {
            setModal({ visible: true, title: 'Erro', message: 'Não foi possível carregar os dados do fazendeiro.', type: 'error', onClose: () => router.back() })
            router.back()
        } finally {
            setLoadingPerfil(false)
        }
    }

    function converterData(data: string): string {
        const partes = data.split('/')
        if (partes.length !== 3) return ''
        return `${partes[2]}-${partes[1]}-${partes[0]}`
    }

    async function handleEnviar() {
        if (!fazendaSelecionada) {
            setModal({ visible: true, title: 'Atenção', message: 'Selecione uma fazenda.', type: 'error', onClose: undefined })
            return
        }

        if (!dataInicio || dataInicio.length < 10) {
            setModal({ visible: true, title: 'Atenção', message: 'Preencha a data de início.', type: 'error', onClose: undefined })
            return
        }

        if (!dataFim || dataFim.length < 10) {
            setModal({ visible: true, title: 'Atenção', message: 'Preencha a data de fim.', type: 'error', onClose: undefined })
            return
        }

        // Verifica se data início é menor que data fim
        const inicioConvertida = converterData(dataInicio)
        const fimConvertida = converterData(dataFim)

        if (inicioConvertida >= fimConvertida) {
            setModal({ visible: true, title: 'Atenção', message: 'A data de início deve ser anterior à data de fim.', type: 'error', onClose: undefined })
            return
        }

        setLoading(true)
        try {
            await proporContrato({
                fazendeiro_username: username,
                fazenda_id: fazendaSelecionada,
                start_date: inicioConvertida,
                end_date: fimConvertida,
                value: valor ? parsearMoeda(valor) : undefined,
                scope_description: descricao || undefined,
            })

            setModal({ visible: true, title: 'Proposta enviada!', message: `Sua proposta foi enviada para @${username}. Aguarde a confirmação.`, type: 'success', onClose: () => router.replace('/consultor/contratos') })
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao enviar proposta.'
            setModal({ visible: true, title: 'Erro', message, type: 'error', onClose: undefined })
        } finally {
            setLoading(false)
        }
    }

    if (loadingPerfil) {
        return (
            <View style={[globalStyles.screen, globalStyles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!fazendeiro) return null

    const fazendaSelecionadaObj = fazendeiro.fazendas.find(f => f.id === fazendaSelecionada)

    return (
        <KeyboardAvoidingView
            style={globalStyles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Voltar ────────────────────────────── */}
                <BackButton />

                {/* ── Cabeçalho ─────────────────────────── */}
                <View style={styles.header}>
                    <Text style={globalStyles.pageTitle}>Propor contrato</Text>
                    <Text style={globalStyles.pageSubtitle}>
                        Enviando proposta para <Text style={styles.destaque}>@{username}</Text>
                    </Text>
                </View>

                {/* ── Formulário ────────────────────────── */}
                <View style={styles.form}>

                    {/* Seleção de fazenda */}
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Fazenda *</Text>
                        <TouchableOpacity
                            style={styles.seletorFazenda}
                            onPress={() => setMostrarFazendas(!mostrarFazendas)}
                            activeOpacity={0.8}
                        >
                            <Text style={fazendaSelecionada ? styles.seletorTexto : styles.seletorPlaceholder}>
                                {fazendaSelecionadaObj ? fazendaSelecionadaObj.name : 'Selecione uma fazenda'}
                            </Text>
                            <ChevronDown size={18} color={Colors.gray[500]} />
                        </TouchableOpacity>

                        {mostrarFazendas && (
                            <View style={styles.fazendaDropdown}>
                                {fazendeiro.fazendas.map(fazenda => (
                                    <TouchableOpacity
                                        key={fazenda.id}
                                        style={[
                                            styles.fazendaOpcao,
                                            fazendaSelecionada === fazenda.id && styles.fazendaOpcaoAtiva,
                                        ]}
                                        onPress={() => {
                                            setFazendaSelecionada(fazenda.id)
                                            setMostrarFazendas(false)
                                        }}
                                    >
                                        <Text style={[
                                            styles.fazendaOpcaoTexto,
                                            fazendaSelecionada === fazenda.id && styles.fazendaOpcaoTextoAtivo,
                                        ]}>
                                            {fazenda.name}
                                        </Text>
                                        <Text style={styles.fazendaOpcaoLocal}>
                                            {fazenda.city} — {fazenda.state}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Datas */}
                    <View style={styles.duasColunas}>
                        <View style={{ flex: 1 }}>
                            <DateInput
                                label="Data início"
                                value={dataInicio}
                                onChange={setDataInicio}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <DateInput
                                label="Data fim"
                                value={dataFim}
                                onChange={setDataFim}
                            />
                        </View>
                    </View>

                    <CurrencyInput
                        label="Valor do contrato (R$)"
                        value={valor}
                        onChange={setValor}
                        hint="Opcional"
                    />

                    {/* Descrição */}
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Descrição dos serviços</Text>
                        <TextInput
                            style={[globalStyles.input, styles.textArea]}
                            placeholder="Descreva os serviços que serão prestados..."
                            placeholderTextColor={Colors.gray[400]}
                            value={descricao}
                            onChangeText={setDescricao}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={globalStyles.inputHint}>Opcional</Text>
                    </View>

                    {/* Botão enviar */}
                    <TouchableOpacity
                        style={[globalStyles.buttonPrimary, loading && globalStyles.buttonDisabled]}
                        onPress={handleEnviar}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={globalStyles.buttonPrimaryText}>Enviar proposta</Text>
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
        </KeyboardAvoidingView>
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
    destaque: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    form: {
        gap: Spacing.md,
    },
    seletorFazenda: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    seletorTexto: {
        fontSize: FontSize.md,
        color: Colors.black,
    },
    seletorPlaceholder: {
        fontSize: FontSize.md,
        color: Colors.gray[400],
    },
    fazendaDropdown: {
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        marginTop: 4,
        overflow: 'hidden',
    },
    fazendaOpcao: {
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    fazendaOpcaoAtiva: {
        backgroundColor: '#F0FAF5',
    },
    fazendaOpcaoTexto: {
        fontSize: FontSize.md,
        color: Colors.black,
        fontWeight: '600',
    },
    fazendaOpcaoTextoAtivo: {
        color: Colors.primary,
    },
    fazendaOpcaoLocal: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
        marginTop: 2,
    },
    duasColunas: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    textArea: {
        height: 100,
        paddingTop: Spacing.sm,
    },
})