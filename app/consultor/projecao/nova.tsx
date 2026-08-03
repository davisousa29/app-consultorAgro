import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Switch,
    ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Plus, Trash2 } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import BackButton from '../../../src/components/Header/BackButton'
import CentralModal from '../../../src/components/Modal/CentralModal'
import FilterChips, { FilterChip } from '../../../src/components/FilterChips'
import { sanitizarNumero, parsearNumero } from '../../../src/utils/numbers'
import { currencyMask, parseCurrency } from '../../../src/utils/masks/currencyMask'
import api from '../../../src/services/api'

type Modalidade = 'arroba' | 'kg' | 'cabeca'

interface Animal {
    id: string
    numero_animal: string
    prenhez: boolean
    peso_kg: string
    quantidade: string
}

const MODALIDADE_CHIPS: FilterChip[] = [
    { label: 'Arroba (@)', value: 'arroba' },
    { label: 'Kg vivo',    value: 'kg' },
    { label: 'Cabeça',     value: 'cabeca' },
]

const FORMULAS: Record<Modalidade, string> = {
    arroba: 'Valor = (Peso ÷ 30) × Qtd × R$/@',
    kg:     'Valor = Peso × Qtd × R$/kg',
    cabeca: 'Valor = Qtd × R$/cabeça',
}

const LABEL_PRECO: Record<Modalidade, string> = {
    arroba: 'Preço por arroba (R$/@)',
    kg:     'Preço por kg (R$/kg)',
    cabeca: 'Preço por cabeça (R$/cabeça)',
}

function gerarId() {
    return Math.random().toString(36).substring(2)
}

function novoAnimal(): Animal {
    return {
        id:            gerarId(),
        numero_animal: '',
        prenhez:       false,
        peso_kg:       '',
        quantidade:    '1',
    }
}

function calcularValor(animal: Animal, modalidade: Modalidade, preco: number): number {
    const qty  = parsearNumero(animal.quantidade) || 1
    const peso = parsearNumero(animal.peso_kg)

    switch (modalidade) {
        case 'arroba': return peso ? (peso / 30) * qty * preco : 0
        case 'kg':     return peso ? peso * qty * preco : 0
        case 'cabeca': return qty * preco
    }
}

export default function NovaProjecaoScreen() {
    const [nome, setNome] = useState('')
    const [modalidade, setModalidade] = useState<Modalidade>('arroba')
    const [precoTexto, setPrecoTexto] = useState('')
    const [animais, setAnimais] = useState<Animal[]>([novoAnimal()])
    const [salvando, setSalvando] = useState(false)

    const [contratosAtivos, setContratosAtivos] = useState<any[]>([])
    const [mostrarContratos, setMostrarContratos] = useState(false)
    const [loadingContratos, setLoadingContratos] = useState(false)
    const [contratoSelecionado, setContratoSelecionado] = useState<any>(null)

    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
        onClose: undefined as (() => void) | undefined,
    })

    const preco = parseCurrency(precoTexto)

    function adicionarAnimal() {
        setAnimais(prev => [...prev, novoAnimal()])
    }

    function removerAnimal(id: string) {
        if (animais.length === 1) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'A projeção precisa ter pelo menos um animal.',
                type: 'default',
                onClose: undefined,
            })
            return
        }
        setAnimais(prev => prev.filter(a => a.id !== id))
    }

    function atualizarAnimal(id: string, campo: keyof Animal, valor: any) {
        setAnimais(prev => prev.map(a =>
            a.id === id ? { ...a, [campo]: valor } : a
        ))
    }

    async function buscarContratosAtivos() {
        setLoadingContratos(true)
        try {
            const response = await api.get('/contratos')
            const ativos = response.data.contratos.filter((c: any) => c.status === 'ativo')
            setContratosAtivos(ativos)
            setMostrarContratos(true)
        } catch {
            setModal({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível carregar os contratos.',
                type: 'error',
                onClose: undefined,
            })
        } finally {
            setLoadingContratos(false)
        }
    }

    async function handleSalvar() {
        if (!nome.trim()) {
            setModal({ visible: true, title: 'Atenção', message: 'Informe o nome da projeção.', type: 'error', onClose: undefined })
            return
        }
        if (!preco || preco <= 0) {
            setModal({ visible: true, title: 'Atenção', message: 'Informe o preço unitário.', type: 'error', onClose: undefined })
            return
        }
        if (modalidade !== 'cabeca') {
            const semPeso = animais.some(a => !a.peso_kg || parsearNumero(a.peso_kg) <= 0)
            if (semPeso) {
                setModal({ visible: true, title: 'Atenção', message: 'Informe o peso de todos os animais.', type: 'error', onClose: undefined })
                return
            }
        }

        setSalvando(true)
        try {
            const response = await api.post('/projecoes', {
                nome,
                modalidade,
                preco_unitario: preco,
                contrato_id: contratoSelecionado?.id ?? null,
                animais: animais.map(a => ({
                    numero_animal: a.numero_animal || null,
                    prenhez:       a.prenhez,
                    peso_kg:       modalidade !== 'cabeca' ? parsearNumero(a.peso_kg) : null,
                    quantidade:    parsearNumero(a.quantidade) || 1,
                })),
            })

            const novoId = response.data.projecao.id

            setModal({
                visible: true,
                title: 'Projeção salva!',
                message: 'Sua projeção de venda foi salva com sucesso.',
                type: 'success',
                onClose: () => router.replace(`/consultor/projecao/${novoId}` as any),
            })
        } catch (error: any) {
            setModal({
                visible: true,
                title: 'Erro',
                message: error.response?.data?.message || 'Erro ao salvar projeção.',
                type: 'error',
                onClose: undefined,
            })
        } finally {
            setSalvando(false)
        }
    }

    // Totais em tempo real
    const totalAnimais = animais.reduce((acc, a) => acc + (parsearNumero(a.quantidade) || 1), 0)
    const totalValor   = animais.reduce((acc, a) => acc + calcularValor(a, modalidade, preco), 0)
    const totalPesoKg  = animais.reduce((acc, a) => {
        const peso = parsearNumero(a.peso_kg)
        const qty  = parsearNumero(a.quantidade) || 1
        return acc + (peso ? peso * qty : 0)
    }, 0)
    const totalArrobas = modalidade === 'arroba' ? totalPesoKg / 30 : null
    const totalVazias  = animais.reduce((acc, a) => acc + (!a.prenhez ? parsearNumero(a.quantidade) || 1 : 0), 0)
    const totalPrenhas = animais.reduce((acc, a) => acc + (a.prenhez ? parsearNumero(a.quantidade) || 1 : 0), 0)

    return (
        <KeyboardAvoidingView
            style={globalStyles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <BackButton />

                <View style={styles.header}>
                    <Text style={globalStyles.pageTitle}>Nova Projeção</Text>
                    <Text style={globalStyles.pageSubtitle}>Projeção de valor de venda</Text>
                </View>

                {/* ── Configuração ─────────────────────── */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Configuração</Text>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Nome da projeção *</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Ex: Venda lote recria Fazenda Maranata"
                            placeholderTextColor={Colors.gray[400]}
                            value={nome}
                            onChangeText={setNome}
                        />
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Modalidade de precificação *</Text>
                        <FilterChips
                            chips={MODALIDADE_CHIPS}
                            selecionado={modalidade}
                            onChange={v => setModalidade(v as Modalidade)}
                        />
                    </View>

                    <View style={styles.formulaBanner}>
                        <Text style={styles.formulaLabel}>Fórmula utilizada</Text>
                        <Text style={styles.formulaTexto}>{FORMULAS[modalidade]}</Text>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>{LABEL_PRECO[modalidade]} *</Text>
                        <View style={styles.precoContainer}>
                            <Text style={styles.precoPrefixo}>R$</Text>
                            <TextInput
                                style={styles.precoInput}
                                placeholder="0,00"
                                placeholderTextColor={Colors.gray[400]}
                                value={precoTexto}
                                onChangeText={v => setPrecoTexto(currencyMask(v))}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* ── Animais ──────────────────────────── */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Animais</Text>

                    {animais.map((animal, index) => (
                        <View key={animal.id} style={styles.animalCard}>
                            <View style={styles.animalHeader}>
                                <Text style={styles.animalNumeroLabel}>Animal {index + 1}</Text>
                                <TouchableOpacity onPress={() => removerAnimal(animal.id)}>
                                    <Trash2 size={18} color={Colors.error} />
                                </TouchableOpacity>
                            </View>

                            <View style={globalStyles.inputGroup}>
                                <Text style={globalStyles.inputLabel}>N° do animal (opcional)</Text>
                                <TextInput
                                    style={globalStyles.input}
                                    placeholder="Ex: 4002"
                                    placeholderTextColor={Colors.gray[400]}
                                    value={animal.numero_animal}
                                    onChangeText={v => atualizarAnimal(animal.id, 'numero_animal', v)}
                                />
                            </View>

                            <View style={styles.duasColunas}>
                                <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                                    <Text style={globalStyles.inputLabel}>Prenhez</Text>
                                    <View style={styles.switchRow}>
                                        <Switch
                                            value={animal.prenhez}
                                            onValueChange={v => atualizarAnimal(animal.id, 'prenhez', v)}
                                            trackColor={{ false: Colors.gray[300], true: Colors.primary + '80' }}
                                            thumbColor={animal.prenhez ? Colors.primary : Colors.gray[100]}
                                        />
                                        <Text style={styles.switchLabel}>
                                            {animal.prenhez ? 'Sim' : 'Não'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                                    <Text style={globalStyles.inputLabel}>Quantidade</Text>
                                    <TextInput
                                        style={[globalStyles.input, { width: '100%' }]}
                                        placeholder="1"
                                        placeholderTextColor={Colors.gray[400]}
                                        value={animal.quantidade}
                                        onChangeText={v => atualizarAnimal(animal.id, 'quantidade', sanitizarNumero(v).replace(/[.,]/g, ''))}
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            {modalidade !== 'cabeca' && (
                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.inputLabel}>Peso (kg) *</Text>
                                    <TextInput
                                        style={globalStyles.input}
                                        placeholder="Ex: 380"
                                        placeholderTextColor={Colors.gray[400]}
                                        value={animal.peso_kg}
                                        onChangeText={v => atualizarAnimal(animal.id, 'peso_kg', sanitizarNumero(v))}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            )}

                            {preco > 0 && (
                                <View style={styles.valorCalculado}>
                                    <Text style={styles.valorCalculadoLabel}>Valor deste grupo</Text>
                                    <Text style={styles.valorCalculadoTexto}>
                                        R$ {calcularValor(animal, modalidade, preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.botaoAdicionar}
                        onPress={adicionarAnimal}
                        activeOpacity={0.8}
                    >
                        <Plus size={18} color={Colors.primary} />
                        <Text style={styles.botaoAdicionarTexto}>Adicionar animal</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Resumo em tempo real ─────────────── */}
                {preco > 0 && totalAnimais > 0 && (
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>Resumo</Text>
                        <View style={styles.resumoCard}>
                            <View style={styles.resumoLinha}>
                                <Text style={styles.resumoLabel}>Total de animais</Text>
                                <Text style={styles.resumoValor}>{totalAnimais} cabeças</Text>
                            </View>
                            <View style={styles.divisor} />
                            <View style={styles.resumoLinha}>
                                <Text style={styles.resumoLabel}>Vazias</Text>
                                <Text style={styles.resumoValor}>{totalVazias}</Text>
                            </View>
                            <View style={styles.divisor} />
                            <View style={styles.resumoLinha}>
                                <Text style={styles.resumoLabel}>Prenhas</Text>
                                <Text style={styles.resumoValor}>{totalPrenhas}</Text>
                            </View>
                            {totalPesoKg > 0 && (
                                <>
                                    <View style={styles.divisor} />
                                    <View style={styles.resumoLinha}>
                                        <Text style={styles.resumoLabel}>Peso total</Text>
                                        <Text style={styles.resumoValor}>{totalPesoKg.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} kg</Text>
                                    </View>
                                </>
                            )}
                            {totalArrobas !== null && totalArrobas > 0 && (
                                <>
                                    <View style={styles.divisor} />
                                    <View style={styles.resumoLinha}>
                                        <Text style={styles.resumoLabel}>Total arrobas</Text>
                                        <Text style={styles.resumoValor}>{totalArrobas.toLocaleString('pt-BR', { minimumFractionDigits: 3 })} @</Text>
                                    </View>
                                </>
                            )}
                            <View style={styles.divisor} />
                            <View style={styles.resumoLinha}>
                                <Text style={[styles.resumoLabel, { fontWeight: 'bold', color: Colors.black }]}>Valor total</Text>
                                <Text style={[styles.resumoValor, { color: Colors.primary, fontSize: FontSize.lg }]}>
                                    R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Vincular a contrato ─────────────── */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Vincular a contrato</Text>

                    {contratoSelecionado ? (
                        <View style={styles.contratoSelecionadoCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contratoSelecionadoNome}>
                                    {contratoSelecionado.fazenda?.name ?? '—'}
                                </Text>
                                <Text style={styles.contratoSelecionadoFazendeiro}>
                                    @{contratoSelecionado.fazendeiro?.username ?? '—'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setContratoSelecionado(null)}>
                                <Text style={styles.removerContrato}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.botaoVincular}
                            onPress={buscarContratosAtivos}
                            disabled={loadingContratos}
                            activeOpacity={0.8}
                        >
                            {loadingContratos ? (
                                <ActivityIndicator color={Colors.primary} />
                            ) : (
                                <Text style={styles.botaoVincularTexto}>
                                    + Vincular a um contrato (opcional)
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {mostrarContratos && (
                        <View style={styles.contratoDropdown}>
                            <Text style={styles.contratoDropdownTitulo}>
                                {contratosAtivos.length > 0 ? 'Selecione um contrato' : 'Nenhum contrato ativo'}
                            </Text>
                            {contratosAtivos.map((contrato, index) => (
                                <View key={contrato.id}>
                                    {index > 0 && <View style={styles.divisor} />}
                                    <TouchableOpacity
                                        style={styles.contratoOpcao}
                                        onPress={() => {
                                            setContratoSelecionado(contrato)
                                            setMostrarContratos(false)
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.contratoOpcaoNome}>{contrato.fazenda?.name ?? '—'}</Text>
                                            <Text style={styles.contratoOpcaoFazendeiro}>@{contrato.fazendeiro?.username ?? '—'}</Text>
                                        </View>
                                        <Text style={styles.contratoOpcaoSelecionar}>Selecionar →</Text>
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

                {/* ── Botão salvar ─────────────────────── */}
                <TouchableOpacity
                    style={[globalStyles.buttonPrimary, salvando && globalStyles.buttonDisabled, { marginBottom: Spacing.xl }]}
                    onPress={handleSalvar}
                    disabled={salvando}
                    activeOpacity={0.8}
                >
                    {salvando ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={globalStyles.buttonPrimaryText}>Salvar projeção</Text>
                    )}
                </TouchableOpacity>

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
    },
    header: {
        marginBottom: Spacing.xl,
    },
    secao: {
        marginBottom: Spacing.xl,
        gap: Spacing.md,
    },
    secaoTitulo: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
    },
    formulaBanner: {
        backgroundColor: '#EBF8FF',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    formulaLabel: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    formulaTexto: {
        fontSize: FontSize.md,
        color: Colors.black,
        fontWeight: 'bold',
    },
    precoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
    },
    precoPrefixo: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        fontWeight: '600',
        marginRight: Spacing.xs,
    },
    precoInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
    },
    animalCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        gap: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    animalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    animalNumeroLabel: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    duasColunas: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    switchLabel: {
        fontSize: FontSize.md,
        color: Colors.black,
    },
    valorCalculado: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valorCalculadoLabel: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
    },
    valorCalculadoTexto: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    botaoAdicionar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.white,
    },
    botaoAdicionarTexto: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    resumoCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    resumoLinha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    resumoLabel: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    resumoValor: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.black,
    },
    divisor: {
        height: 1,
        backgroundColor: Colors.gray[200],
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
    contratoSelecionadoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FAF5',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    contratoSelecionadoNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    contratoSelecionadoFazendeiro: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    removerContrato: {
        fontSize: FontSize.sm,
        color: Colors.error,
        fontWeight: '600',
    },
    contratoDropdown: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
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
    contratoOpcaoNome: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.black,
    },
    contratoOpcaoFazendeiro: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    contratoOpcaoSelecionar: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
})