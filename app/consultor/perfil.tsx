import { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { globalStyles } from '../../src/constants/globalStyles'
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants'
import api from '../../src/services/api'
import CentralModal from '../../src/components/Modal/CentralModal'
import BackHeader from "../../src/components/Header/BackHeader";

const ESPECIALIZACOES = [
    'Bovinos de corte',
    'Bovinos de leite',
    'Suínos',
    'Aves',
    'Ovinos e caprinos',
    'Equinos',
    'Aquicultura',
    'Geral',
    'Outro',
]

const ESTADOS = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO',
]

export default function Perfil() {
    const { user } = useAuthStore()

    const [crea, setCrea] = useState('')
    const [especializacao, setEspecializacao] = useState('')
    const [especializacaoCustom, setEspecializacaoCustom] = useState('')
    const [bio, setBio] = useState('')
    const [estado, setEstado] = useState('')
    const [cidade, setCidade] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingPerfil, setLoadingPerfil] = useState(true)

    const [isSuccess, setIsSuccess] = useState(false)
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
    })

    const [cidades, setCidades] = useState<string[]>([])
    const [cidadesFiltradas, setCidadesFiltradas] = useState<string[]>([])
    const [loadingCidades, setLoadingCidades] = useState(false)
    const [cidadeValida, setCidadeValida] = useState(false)

    // ── Carrega o perfil existente ─────────────────────────────────────────────
    useEffect(() => {
        async function fetchPerfil() {
            try {
                const response = await api.get('/perfil')
                const perfil = response.data.perfil

                if (perfil) {
                    setCrea(perfil.crea_number ?? '')
                    setBio(perfil.bio ?? '')
                    setEstado(perfil.location_state ?? '')
                    setCidade(perfil.location_city ?? '')
                    setCidadeValida(!!perfil.location_city)

                    const spec = perfil.specialization ?? ''
                    if (ESPECIALIZACOES.includes(spec)) {
                        setEspecializacao(spec)
                    } else if (spec) {
                        setEspecializacao('Outro')
                        setEspecializacaoCustom(spec)
                    }
                }
            } catch {
                // perfil ainda não existe — tudo bem, campos ficam vazios
            } finally {
                setLoadingPerfil(false)
            }
        }

        fetchPerfil()
    }, [])

    // ── Busca cidades pelo estado selecionado ──────────────────────────────────
    useEffect(() => {
        if (!estado) return

        const cidadeAtual = cidade  // salva antes de resetar
        setCidadesFiltradas([])

        async function fetchCidades() {
            setLoadingCidades(true)
            try {
                const response = await fetch(
                    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
                )
                const data = await response.json()
                const nomes = data.map((item: any) => item.nome)
                setCidades(nomes)

                // se tinha cidade salva, verifica se é válida e restaura
                if (cidadeAtual && nomes.includes(cidadeAtual)) {
                    setCidade(cidadeAtual)
                    setCidadeValida(true)
                } else {
                    setCidade('')
                    setCidadeValida(false)
                }
            } catch {
                Alert.alert('Aviso', 'Não foi possível carregar as cidades.')
            } finally {
                setLoadingCidades(false)
            }
        }

        fetchCidades()
    }, [estado])

    // ── Filtra sugestões de cidade conforme digitação ──────────────────────────
    useEffect(() => {
        if (!cidade || cidadeValida) {
            setCidadesFiltradas([])
            return
        }

        const filtradas = cidades.filter((c) =>
            c.toLowerCase().includes(cidade.toLowerCase())
        )
        setCidadesFiltradas(filtradas.slice(0, 10))
    }, [cidade, cidades])

    // ── Salva o perfil ─────────────────────────────────────────────────────────
    async function handleSalvar() {
        if (especializacao === 'Outro' && !especializacaoCustom.trim()) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Digite sua especialização.',
                type: 'default',
            })
            return
        }

        if (!cidadeValida) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Selecione uma cidade válida da lista.',
                type: 'default',
            })
            return
        }

        setLoading(true)

        try {
            await api.post('/perfil', {
                crea_number: crea,
                specialization:
                    especializacao === 'Outro'
                        ? especializacaoCustom
                        : especializacao,
                bio,
                location_state: estado,
                location_city: cidade,
            })

            setModal({
                visible: true,
                title: 'Sucesso',
                message: 'Perfil salvo com sucesso!',
                type: 'success',
            })
        } catch (error: any) {
            const errors = error.response?.data?.errors

            if (errors) {
                const firstError = Object.values(errors)[0] as string[]

                setModal({
                    visible: true,
                    title: 'Erro',
                    message: firstError[0],
                    type: 'error',
                })
            } else {
                setModal({
                    visible: true,
                    title: 'Erro',
                    message:
                        error.response?.data?.message ||
                        'Erro ao salvar perfil.',
                    type: 'error',
                })
            }
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

    return (
        <KeyboardAvoidingView
            style={globalStyles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={globalStyles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                <BackHeader
                    title={<Text style={styles.step}>Quase lá!</Text>}
                    effectPhrase={<Text style={styles.title}>Complete seu perfil</Text>}
                    subtitle={
                        <Text style={styles.subtitle}>
                            Essas informações ajudam os fazendeiros a te encontrarem
                        </Text>
                    }
                    showLogo={false}
                />

                <View style={styles.form}>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Número do CREA</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Ex: 12345-D/GO"
                            placeholderTextColor={Colors.gray[400]}
                            value={crea}
                            onChangeText={setCrea}
                            autoCapitalize="characters"
                        />
                        <Text style={globalStyles.inputHint}>Opcional</Text>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Especialização *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chips}
                        >
                            {ESPECIALIZACOES.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.chip,
                                        especializacao === item && styles.chipSelected,
                                    ]}
                                    onPress={() => {
                                        setEspecializacao(item)
                                        if (item !== 'Outro') setEspecializacaoCustom('')
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        especializacao === item && styles.chipTextSelected,
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {especializacao === 'Outro' && (
                        <View style={globalStyles.inputGroup}>
                            <Text style={globalStyles.inputLabel}>Qual sua especialização? *</Text>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Digite sua especialização"
                                placeholderTextColor={Colors.gray[400]}
                                value={especializacaoCustom}
                                onChangeText={setEspecializacaoCustom}
                            />
                        </View>
                    )}

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Bio</Text>
                        <TextInput
                            style={[globalStyles.input, styles.bioInput]}
                            placeholder="Fale um pouco sobre sua experiência..."
                            placeholderTextColor={Colors.gray[400]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={globalStyles.inputHint}>Opcional</Text>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Estado *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chips}
                        >
                            {ESTADOS.map((uf) => (
                                <TouchableOpacity
                                    key={uf}
                                    style={[
                                        styles.chip,
                                        styles.chipEstado,
                                        estado === uf && styles.chipSelected,
                                    ]}
                                    onPress={() => setEstado(uf)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        estado === uf && styles.chipTextSelected,
                                    ]}>
                                        {uf}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Cidade *</Text>

                        <View style={styles.cidadeContainer}>
                            <TextInput
                                style={[
                                    globalStyles.input,
                                    { flex: 1 },
                                    cidadeValida && styles.inputValido,
                                ]}
                                placeholder={
                                    !estado
                                        ? 'Selecione um estado primeiro'
                                        : loadingCidades
                                            ? 'Carregando cidades...'
                                            : 'Digite sua cidade'
                                }
                                placeholderTextColor={Colors.gray[400]}
                                value={cidade}
                                onChangeText={(text) => {
                                    setCidade(text)
                                    setCidadeValida(false)
                                }}
                                editable={!!estado && !loadingCidades}
                                autoCapitalize="words"
                            />

                            {cidadeValida && (
                                <View style={styles.validIconContainer}>
                                    <Text style={styles.validIcon}>✓</Text>
                                </View>
                            )}
                        </View>

                        {loadingCidades && (
                            <ActivityIndicator
                                size="small"
                                color={Colors.primary}
                                style={{ marginTop: 4 }}
                            />
                        )}

                        {cidadesFiltradas.length > 0 && (
                            <View style={styles.suggestions}>
                                {cidadesFiltradas.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setCidade(item)
                                            setCidadeValida(true)
                                            setCidadesFiltradas([])
                                        }}
                                    >
                                        <Text style={styles.suggestionText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {cidade.length > 2 && !cidadeValida && !loadingCidades && cidadesFiltradas.length === 0 && (
                            <Text style={styles.cidadeInvalida}>
                                Cidade não encontrada para o estado selecionado
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            globalStyles.buttonPrimary,
                            loading && globalStyles.buttonDisabled,
                        ]}
                        onPress={handleSalvar}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={globalStyles.buttonPrimaryText}>Salvar e continuar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.replace('/consultor/home')}
                    >
                        <Text style={styles.skipText}>Preencher depois</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => {
                    setModal(prev => ({ ...prev, visible: false }))

                    if (isSuccess) {
                        setIsSuccess(false)
                        router.replace('/consultor/perfil')
                    }
                }}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingTop: 80,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    step: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        lineHeight: 22,
    },
    form: {
        gap: Spacing.lg,
    },
    bioInput: {
        height: 100,
        paddingTop: Spacing.sm,
    },
    chips: {
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        backgroundColor: Colors.white,
    },
    chipEstado: {
        paddingHorizontal: Spacing.sm,
        minWidth: 44,
        alignItems: 'center',
    },
    chipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: FontSize.sm,
        color: Colors.gray[700],
    },
    chipTextSelected: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    cidadeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    inputValido: {
        borderColor: Colors.success,
    },
    validIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    validIcon: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    cidadeInvalida: {
        fontSize: FontSize.xs,
        color: Colors.error,
        marginTop: 4,
    },
    suggestions: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        marginTop: 4,
        maxHeight: 200,
    },
    suggestionItem: {
        padding: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    suggestionText: {
        fontSize: FontSize.md,
        color: Colors.black,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    skipText: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
})