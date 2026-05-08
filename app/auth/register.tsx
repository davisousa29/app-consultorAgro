import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import * as Location from 'expo-location'

import {
    Trash2,
    BrushCleaning,
} from 'lucide-react-native'

import {
    buscarClimaAnual,
    ClimaMensal
} from '../../src/services/climaService'

import {
    Colors,
    Spacing,
    BorderRadius,
    FontSize,
} from '../../src/constants'

import { globalStyles } from '../../src/constants/globalStyles'

import CentralModal from '../../src/components/Modal/CentralModal'

const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
]

export default function ForragemScreen() {

    const [loading, setLoading] = useState(true)

    const [dados, setDados] = useState<ClimaMensal[]>([])

    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
    })

    async function carregarDados() {

        try {

            const permission =
                await Location.requestForegroundPermissionsAsync()

            if (!permission.granted) {

                setModal({
                    visible: true,
                    title: 'Permissão necessária',
                    message: 'Precisamos da sua localização para buscar os dados climáticos.',
                    type: 'default',
                })

                return
            }

            const location =
                await Location.getCurrentPositionAsync({})

            const clima = await buscarClimaAnual(
                location.coords.latitude,
                location.coords.longitude
            )

            setDados(clima)

        } catch (error) {

            console.log(error)

            setModal({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível carregar os dados climáticos.',
                type: 'error',
            })

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDados()
    }, [])

    function formatarNumero(valor: string) {

        return valor
            .replace(',', '.')
            .replace(/[^0-9.]/g, '')
    }

    function atualizarCampo(
        index: number,
        campo: keyof ClimaMensal,
        valor: string
    ) {

        const valorFormatado = formatarNumero(valor)

        const copia = [...dados]

        copia[index] = {
            ...copia[index],
            [campo]: valorFormatado as any,
        }

        setDados(copia)
    }

    function limparMes(index: number) {

        const copia = [...dados]

        copia[index] = {
            ...copia[index],
            temperatura_minima: '' as any,
            temperatura_maxima: '' as any,
            precipitacao_mm: '' as any,
        }

        setDados(copia)
    }

    function limparTodos() {

        const novosDados = dados.map((item) => ({
            ...item,
            temperatura_minima: '' as any,
            temperatura_maxima: '' as any,
            precipitacao_mm: '' as any,
        }))

        setDados(novosDados)

        setModal({
            visible: true,
            title: 'Campos limpos',
            message: 'Todos os dados climáticos foram removidos.',
            type: 'success',
        })
    }

    function corClassificacao(classificacao: string) {

        switch (classificacao) {

            case 'chuva':
                return '#D8F3DC'

            case 'transicao':
                return '#FFF3BF'

            case 'seca':
                return '#FFE3E3'

            default:
                return Colors.white
        }
    }

    if (loading) {

        return (
            <View
                style={[
                    globalStyles.screen,
                    globalStyles.center
                ]}
            >
                <ActivityIndicator
                    size="large"
                    color={Colors.primary}
                />
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

                {/* ── Header ───────────────────────────── */}

                <View style={styles.header}>

                    <View style={styles.headerTop}>

                        <View style={{ flex: 1 }}>

                            <Text style={globalStyles.pageTitle}>
                                Acúmulo de Forragem
                            </Text>

                            <Text style={globalStyles.pageSubtitle}>
                                Dados climáticos automáticos da sua região
                            </Text>

                        </View>

                        <TouchableOpacity
                            style={styles.clearAllButton}
                            onPress={limparTodos}
                        >
                            <Trash2
                                size={20}
                                color={Colors.white}
                            />
                        </TouchableOpacity>

                    </View>

                </View>

                {/* ── Legendas ─────────────────────────── */}

                <View style={styles.legendRow}>

                    <View style={styles.legendSpacer} />

                    <Text style={styles.legendText}>
                        Temp. Min
                    </Text>

                    <Text style={styles.legendText}>
                        Temp. Max
                    </Text>

                    <Text style={styles.legendText}>
                        PRCP
                    </Text>

                    <View style={styles.legendIconSpacer} />

                </View>

                {/* ── Tabela ───────────────────────────── */}

                <View style={styles.table}>

                    {
                        dados.map((item, index) => (

                            <View
                                key={index}
                                style={[
                                    styles.row,
                                    {
                                        backgroundColor:
                                            corClassificacao(
                                                item.classificacao
                                            ),
                                    }
                                ]}
                            >

                                {/* Mês */}

                                <Text style={styles.mes}>
                                    {meses[item.mes - 1]}
                                </Text>

                                {/* Temp Min */}

                                <TextInput
                                    value={String(
                                        item.temperatura_minima ?? ''
                                    )}
                                    keyboardType="decimal-pad"
                                    onChangeText={(text) =>
                                        atualizarCampo(
                                            index,
                                            'temperatura_minima',
                                            text
                                        )
                                    }
                                    style={styles.input}
                                    placeholder='°C'
                                    placeholderTextColor={Colors.gray[400]}
                                />

                                {/* Temp Max */}

                                <TextInput
                                    value={String(
                                        item.temperatura_maxima ?? ''
                                    )}
                                    keyboardType="decimal-pad"
                                    onChangeText={(text) =>
                                        atualizarCampo(
                                            index,
                                            'temperatura_maxima',
                                            text
                                        )
                                    }
                                    style={styles.input}
                                    placeholder='°C'
                                    placeholderTextColor={Colors.gray[400]}
                                />

                                {/* PRCP */}

                                <TextInput
                                    value={String(
                                        item.precipitacao_mm ?? ''
                                    )}
                                    keyboardType="decimal-pad"
                                    onChangeText={(text) =>
                                        atualizarCampo(
                                            index,
                                            'precipitacao_mm',
                                            text
                                        )
                                    }
                                    style={styles.input}
                                    placeholder='mm'
                                    placeholderTextColor={Colors.gray[400]}
                                />

                                {/* Botão limpar */}

                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => limparMes(index)}
                                >
                                    <BrushCleaning
                                        size={18}
                                        color={Colors.white}
                                    />
                                </TouchableOpacity>

                            </View>
                        ))
                    }

                </View>

            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() =>
                    setModal(prev => ({
                        ...prev,
                        visible: false
                    }))
                }
            />

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({

    header: {
        marginBottom: Spacing.lg,
    },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },

    clearAllButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.red,
        justifyContent: 'center',
        alignItems: 'center',
    },

    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.sm,
    },

    legendSpacer: {
        width: 55,
    },

    legendText: {
        flex: 1,
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.gray[700],
        fontWeight: '600',
    },

    legendIconSpacer: {
        width: 40,
    },

    table: {
        gap: Spacing.sm,
        paddingBottom: 100,
    },

    row: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    mes: {
        width: 40,
        fontWeight: 'bold',
        fontSize: FontSize.lg,
        color: Colors.black,
    },

    input: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 12,
        fontSize: FontSize.sm,
        textAlign: 'center',
        color: Colors.black,
    },

    clearButton: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.red,
        justifyContent: 'center',
        alignItems: 'center',
    },
})