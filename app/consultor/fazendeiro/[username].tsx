import { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
    Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { MapPin, Phone, ChevronLeft, MessageCircle, FileText } from 'lucide-react-native'
import { buscarPerfilFazendeiro } from '../../../src/services/buscaService'
import { FazendeiroPublico } from '../../../src/types'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'

export default function PerfilFazendeiroScreen() {
    const { username } = useLocalSearchParams<{ username: string }>()
    const [fazendeiro, setFazendeiro] = useState<FazendeiroPublico | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        carregarPerfil()
    }, [username])

    async function carregarPerfil() {
        try {
            const data = await buscarPerfilFazendeiro(username)
            setFazendeiro(data)
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar o perfil.')
            router.back()
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <View style={[globalStyles.screen, globalStyles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!fazendeiro) return null

    return (
        <View style={globalStyles.screen}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Botão voltar ──────────────────────── */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={20} color={Colors.primary} />
                    <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>

                {/* ── Cabeçalho do perfil ───────────────── */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {fazendeiro.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.nome}>{fazendeiro.name}</Text>
                    <Text style={styles.username}>@{fazendeiro.username}</Text>

                    {fazendeiro.localizacao.cidade && (
                        <View style={styles.localRow}>
                            <MapPin size={14} color={Colors.gray[500]} />
                            <Text style={styles.local}>
                                {fazendeiro.localizacao.cidade} — {fazendeiro.localizacao.estado}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Fazendas ──────────────────────────── */}
                {fazendeiro.fazendas.length > 0 && (
                    <View style={styles.secao}>
                        <Text style={styles.secaoTitulo}>
                            Fazendas cadastradas
                        </Text>
                        <View style={styles.fazendasLista}>
                            {fazendeiro.fazendas.map((fazenda) => (
                                <View key={fazenda.id} style={styles.fazendaCard}>
                                    <View style={styles.fazendaIcone}>
                                        <Text style={styles.fazendaEmoji}>🏡</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fazendaNome}>{fazenda.name}</Text>
                                        <Text style={styles.fazendaInfo}>
                                            {fazenda.city} — {fazenda.state}
                                        </Text>
                                        {fazenda.area_hectares && (
                                            <Text style={styles.fazendaArea}>
                                                {Number(fazenda.area_hectares).toLocaleString('pt-BR')} hectares
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── Ações ─────────────────────────────── */}
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>Ações</Text>

                    <TouchableOpacity
                        style={styles.acaoCard}
                        onPress={() => router.push({
                            pathname: '/consultor/novoContrato',
                            params: { username: fazendeiro.username }
                        } as any)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.acaoIcone, { backgroundColor: '#E8F5EE' }]}>
                            <FileText size={22} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.acaoTitulo}>Propor contrato</Text>
                            <Text style={styles.acaoDesc}>
                                Inicie um vínculo de consultoria com este fazendeiro
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        color: Colors.white,
        fontSize: FontSize.xxxl,
        fontWeight: 'bold',
    },
    nome: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 4,
    },
    username: {
        fontSize: FontSize.md,
        color: Colors.gray[500],
        marginBottom: Spacing.sm,
    },
    localRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    local: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
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
    fazendasLista: {
        gap: Spacing.sm,
    },
    fazendaCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
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
    fazendaIcone: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fazendaEmoji: {
        fontSize: 22,
    },
    fazendaNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    fazendaInfo: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    fazendaArea: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    acaoCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
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
    acaoIcone: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acaoTitulo: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 2,
    },
    acaoDesc: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
})