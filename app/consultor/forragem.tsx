import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import * as Location from 'expo-location'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { Trash2, BrushCleaning, Info } from 'lucide-react-native'

import { buscarClimaAnual, ClimaMensal } from '../../src/services/climaService'
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const screenWidth = Dimensions.get('window').width - Spacing.lg * 2

export default function ForragemScreen() {
    const [loading, setLoading] = useState(true)
    const [dados, setDados] = useState<ClimaMensal[]>([])
    const [abaGrafico, setAbaGrafico] = useState<'temperatura' | 'chuva'>('temperatura')
    const [anoReferencia, setAnoReferencia] = useState<number>(new Date().getFullYear() - 1)

    useEffect(() => {
        carregarDados()
    }, [])

    async function carregarDados() {
        try {
            const permission = await Location.requestForegroundPermissionsAsync()
            if (!permission.granted) return
            const location = await Location.getCurrentPositionAsync({})
            const clima = await buscarClimaAnual(location.coords.latitude, location.coords.longitude)
            setDados(clima)
            setAnoReferencia(new Date().getFullYear() - 1)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    function parsearNumero(valor: string): number | '' {
        if (valor === '' || valor === '-') return ''
        const limpo = valor.replace(',', '.')
        const num = parseFloat(limpo)
        return isNaN(num) ? '' : num
    }

    function atualizarCampo(index: number, campo: keyof ClimaMensal, valor: string) {
        const copia = [...dados]
        copia[index] = { ...copia[index], [campo]: valor }
        setDados(copia)
    }

    function finalizarCampo(index: number, campo: keyof ClimaMensal, valor: string) {
        const copia = [...dados]
        const parsed = parsearNumero(valor)
        copia[index] = {
            ...copia[index],
            [campo]: parsed,
            classificacao: campo === 'precipitacao_mm'
                ? classificar(parsed === '' ? 0 : parsed as number)
                : copia[index].classificacao,
        }
        setDados(copia)
    }

    function classificar(chuva: number): string {
        if (chuva >= 150) return 'chuva'
        if (chuva >= 50) return 'transicao'
        return 'seca'
    }

    function limparMes(index: number) {
        const copia = [...dados]
        copia[index] = { ...copia[index], temperatura_minima: '' as any, temperatura_maxima: '' as any, precipitacao_mm: '' as any }
        setDados(copia)
    }

    function limparTodos() {
        setDados(dados.map(item => ({ ...item, temperatura_minima: '' as any, temperatura_maxima: '' as any, precipitacao_mm: '' as any })))
    }

    function corClassificacao(classificacao: string) {
        switch (classificacao) {
            case 'chuva': return '#D8F3DC'
            case 'transicao': return '#FFF3BF'
            case 'seca': return '#FFE3E3'
            default: return Colors.white
        }
    }

    // ── Análise climática ─────────────────────────────────────────────────────
    function calcularAnalise() {
        let diasDisponiveis = 0
        dados.forEach(d => {
            const prcp = Number(d.precipitacao_mm)
            if (isNaN(prcp)) return
            if (prcp >= 150) diasDisponiveis += 30
            else if (prcp >= 50) diasDisponiveis += 10
        })

        let lotacao = ''
        let lotacaoDesc = ''
        if (diasDisponiveis >= 210) {
            lotacao = '5 a 7 U.A/ha'
            lotacaoDesc = 'período longo — alta capacidade'
        } else if (diasDisponiveis >= 150) {
            lotacao = '3 a 5 U.A/ha'
            lotacaoDesc = 'período médio — boa capacidade'
        } else if (diasDisponiveis >= 90) {
            lotacao = '2 a 4 U.A/ha'
            lotacaoDesc = 'período curto — intensificar produção'
        } else {
            lotacao = '1 a 2 U.A/ha'
            lotacaoDesc = 'período muito curto — alta pressão necessária'
        }

        return { diasDisponiveis, lotacao, lotacaoDesc }
    }

    const dadosValidos = dados.filter(d =>
        d.temperatura_minima !== ('' as any) &&
        d.temperatura_maxima !== ('' as any) &&
        d.precipitacao_mm !== ('' as any)
    )
    const temDadosGrafico = dadosValidos.length >= 2
    const analise = calcularAnalise()

    const chartConfig = {
        backgroundGradientFrom: Colors.white,
        backgroundGradientTo: Colors.white,
        color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
        labelColor: () => Colors.gray[600],
        strokeWidth: 2,
        propsForDotProps: { r: '4', fill: Colors.primary },
        decimalPlaces: 1,
        barPercentage: 0.5,
    }

    if (loading) {
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
            keyboardVerticalOffset={100}
        >
            <ScrollView
                style={globalStyles.screen}
                contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 120 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Header ───────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1 }}>
                            <Text style={globalStyles.pageTitle}>Acúmulo de Forragem</Text>
                            <Text style={globalStyles.pageSubtitle}>Dados climáticos da sua região</Text>
                        </View>
                        <TouchableOpacity style={styles.clearAllButton} onPress={limparTodos}>
                            <Trash2 size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Banner de fonte dos dados ─────────── */}
                <TouchableOpacity
                    style={styles.fonteBanner}
                    onPress={() => Linking.openURL('https://open-meteo.com')}
                    activeOpacity={0.8}
                >
                    <Info size={16} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.fonteTexto}>
                            Dados climáticos do ano de <Text style={styles.fonteBold}>{anoReferencia}</Text> obtidos automaticamente via <Text style={styles.fonteLink}>Open-Meteo Climate API</Text>
                        </Text>
                        <Text style={styles.fonteSubtexto}>
                            Modelo CMCC_CM2_VHR4 · Médias mensais · Toque para saber mais
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* ── Gráficos ─────────────────────────── */}
                {temDadosGrafico && (
                    <View style={styles.graficosContainer}>
                        <View style={styles.abas}>
                            <TouchableOpacity
                                style={[styles.aba, abaGrafico === 'temperatura' && styles.abaAtiva]}
                                onPress={() => setAbaGrafico('temperatura')}
                            >
                                <Text style={[styles.abaText, abaGrafico === 'temperatura' && styles.abaTextAtiva]}>Temperatura</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.aba, abaGrafico === 'chuva' && styles.abaAtiva]}
                                onPress={() => setAbaGrafico('chuva')}
                            >
                                <Text style={[styles.abaText, abaGrafico === 'chuva' && styles.abaTextAtiva]}>Precipitação</Text>
                            </TouchableOpacity>
                        </View>

                        {abaGrafico === 'temperatura' && (
                            <View>
                                <Text style={styles.graficoTitulo}>Temperatura (°C)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <LineChart
                                        data={{
                                            labels: dadosValidos.map(d => meses[d.mes - 1]),
                                            datasets: [
                                                {
                                                    data: dadosValidos.map(d => Number(d.temperatura_minima)),
                                                    color: (opacity = 1) => `rgba(66, 153, 225, ${opacity})`,
                                                    strokeWidth: 2,
                                                },
                                                {
                                                    data: dadosValidos.map(d => Number(d.temperatura_maxima)),
                                                    color: (opacity = 1) => `rgba(229, 62, 62, ${opacity})`,
                                                    strokeWidth: 2,
                                                },
                                            ],
                                            legend: ['Mín', 'Máx'],
                                        }}
                                        width={Math.max(screenWidth, dadosValidos.length * 55)}
                                        height={200}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={styles.grafico}
                                    />
                                </ScrollView>
                                <View style={styles.legenda}>
                                    <View style={styles.legendaItem}>
                                        <View style={[styles.legendaDot, { backgroundColor: '#4299E1' }]} />
                                        <Text style={styles.legendaTexto}>Temp. Mínima</Text>
                                    </View>
                                    <View style={styles.legendaItem}>
                                        <View style={[styles.legendaDot, { backgroundColor: '#E53E3E' }]} />
                                        <Text style={styles.legendaTexto}>Temp. Máxima</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {abaGrafico === 'chuva' && (
                            <View>
                                <Text style={styles.graficoTitulo}>Precipitação (mm)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <BarChart
                                        data={{
                                            labels: dadosValidos.map(d => meses[d.mes - 1]),
                                            datasets: [{ data: dadosValidos.map(d => Number(d.precipitacao_mm)) }],
                                        }}
                                        width={Math.max(screenWidth, dadosValidos.length * 55)}
                                        height={220}
                                        chartConfig={{
                                            ...chartConfig,
                                            color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
                                            barPercentage: 0.6,
                                        }}
                                        style={styles.grafico}
                                        yAxisLabel=""
                                        yAxisSuffix="mm"
                                        showValuesOnTopOfBars
                                        fromZero
                                    />
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.legenda}>
                            <View style={styles.legendaItem}>
                                <View style={[styles.legendaDot, { backgroundColor: '#D8F3DC', borderColor: '#95D5B2' }]} />
                                <Text style={styles.legendaTexto}>Chuva ≥150mm</Text>
                            </View>
                            <View style={styles.legendaItem}>
                                <View style={[styles.legendaDot, { backgroundColor: '#FFF3BF', borderColor: '#FAB005' }]} />
                                <Text style={styles.legendaTexto}>Transição 50-149mm</Text>
                            </View>
                            <View style={styles.legendaItem}>
                                <View style={[styles.legendaDot, { backgroundColor: '#FFE3E3', borderColor: '#FA5252' }]} />
                                <Text style={styles.legendaTexto}>Seca {'<'}50mm</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Análise climática ─────────────────── */}
                {temDadosGrafico && (
                    <View style={styles.analiseContainer}>
                        <Text style={styles.analiseTitulo}>Análise Climática</Text>

                        <View style={styles.analiseCard}>
                            <View style={styles.analiseIcone}>
                                <Text style={styles.analiseEmoji}>📅</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.analiseLabel}>Dias disponíveis para intensificação</Text>
                                <Text style={styles.analiseValor}>{analise.diasDisponiveis} dias</Text>
                                <Text style={styles.analiseDesc}>
                                    {analise.diasDisponiveis >= 150
                                        ? 'Bom período para intensificação do sistema'
                                        : 'Período curto — foque em alta produção durante as chuvas'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.analiseCard}>
                            <View style={styles.analiseIcone}>
                                <Text style={styles.analiseEmoji}>🐄</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.analiseLabel}>Lotação aproximada LIMITE</Text>
                                <Text style={styles.analiseValor}>{analise.lotacao}</Text>
                                <Text style={styles.analiseDesc}>{analise.lotacaoDesc}</Text>
                            </View>
                        </View>

                        <View style={styles.analiseAviso}>
                            <Text style={styles.analiseAvisoTexto}>
                                ℹ️ Meses com chuva ≥150mm contam 30 dias disponíveis. Meses de transição (50-149mm) contam 10 dias. Meses secos não contam.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Legendas da tabela ────────────────── */}
                <View style={styles.legendRow}>
                    <View style={styles.legendSpacer} />
                    <Text style={styles.legendText}>Temp. Min</Text>
                    <Text style={styles.legendText}>Temp. Max</Text>
                    <Text style={styles.legendText}>PRCP</Text>
                    <View style={styles.legendIconSpacer} />
                </View>

                {/* ── Tabela ───────────────────────────── */}
                <View style={styles.table}>
                    {dados.map((item, index) => (
                        <View key={index} style={[styles.row, { backgroundColor: corClassificacao(item.classificacao) }]}>
                            <Text style={styles.mes}>{meses[item.mes - 1]}</Text>
                            <TextInput
                                value={String(item.temperatura_minima ?? '')}
                                keyboardType="decimal-pad"
                                onChangeText={text => atualizarCampo(index, 'temperatura_minima', text)}
                                onBlur={() => finalizarCampo(index, 'temperatura_minima', String(item.temperatura_minima ?? ''))}
                                style={styles.input}
                                placeholder="°C"
                            />
                            <TextInput
                                value={String(item.temperatura_maxima ?? '')}
                                keyboardType="decimal-pad"
                                onChangeText={text => atualizarCampo(index, 'temperatura_maxima', text)}
                                onBlur={() => finalizarCampo(index, 'temperatura_maxima', String(item.temperatura_maxima ?? ''))}
                                style={styles.input}
                                placeholder="°C"
                            />
                            <TextInput
                                value={String(item.precipitacao_mm ?? '')}
                                keyboardType="decimal-pad"
                                onChangeText={text => atualizarCampo(index, 'precipitacao_mm', text)}
                                onBlur={() => finalizarCampo(index, 'precipitacao_mm', String(item.precipitacao_mm ?? ''))}
                                style={styles.input}
                                placeholder="mm"
                            />
                            <TouchableOpacity style={styles.clearButton} onPress={() => limparMes(index)}>
                                <BrushCleaning size={18} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    header: { marginBottom: Spacing.md },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    clearAllButton: {
        width: 44, height: 44, borderRadius: BorderRadius.full,
        backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center',
    },
    fonteBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        backgroundColor: '#EBF8FF', borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.lg,
        borderLeftWidth: 3, borderLeftColor: Colors.primary,
    },
    fonteTexto: { fontSize: FontSize.xs, color: Colors.gray[700], lineHeight: 18 },
    fonteBold: { fontWeight: 'bold', color: Colors.black },
    fonteLink: { color: Colors.primary, textDecorationLine: 'underline' },
    fonteSubtexto: { fontSize: FontSize.xs, color: Colors.gray[500], marginTop: 2 },
    graficosContainer: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
        padding: Spacing.md, marginBottom: Spacing.lg,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    abas: {
        flexDirection: 'row', backgroundColor: Colors.gray[100],
        borderRadius: BorderRadius.md, padding: 4, marginBottom: Spacing.md,
    },
    aba: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, alignItems: 'center' },
    abaAtiva: {
        backgroundColor: Colors.white,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    abaText: { fontSize: FontSize.sm, color: Colors.gray[600], fontWeight: '600' },
    abaTextAtiva: { color: Colors.primary },
    graficoTitulo: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray[700], marginBottom: Spacing.sm },
    grafico: { borderRadius: BorderRadius.md },
    legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
    legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendaDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: Colors.gray[300] },
    legendaTexto: { fontSize: FontSize.xs, color: Colors.gray[600] },
    analiseContainer: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
        padding: Spacing.md, marginBottom: Spacing.lg,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    analiseTitulo: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.black, marginBottom: Spacing.md },
    analiseCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
        backgroundColor: Colors.background, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.sm,
    },
    analiseIcone: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    analiseEmoji: { fontSize: 22 },
    analiseLabel: { fontSize: FontSize.sm, color: Colors.gray[600], marginBottom: 2 },
    analiseValor: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
    analiseDesc: { fontSize: FontSize.xs, color: Colors.gray[500] },
    analiseAviso: {
        backgroundColor: '#F0F9FF', borderRadius: BorderRadius.md,
        padding: Spacing.sm, marginTop: Spacing.xs,
    },
    analiseAvisoTexto: { fontSize: FontSize.xs, color: Colors.gray[600], lineHeight: 18 },
    legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, paddingHorizontal: Spacing.sm },
    legendSpacer: { width: 55 },
    legendText: { flex: 1, textAlign: 'center', fontSize: FontSize.xs, color: Colors.gray[700], fontWeight: '600' },
    legendIconSpacer: { width: 40 },
    table: { gap: Spacing.sm },
    row: { borderRadius: BorderRadius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    mes: { width: 40, fontWeight: 'bold', fontSize: FontSize.lg, color: Colors.black },
    input: {
        flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm, paddingVertical: 12,
        fontSize: FontSize.sm, textAlign: 'center', color: Colors.black,
    },
    clearButton: {
        width: 36, height: 36, borderRadius: BorderRadius.full,
        backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center',
    },
})