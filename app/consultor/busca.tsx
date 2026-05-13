import { useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Linking,
    Image,
} from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { Search, MapPin, Phone, ChevronRight } from 'lucide-react-native'
import { buscarFazendeiros } from '../../src/services/buscaService'
import { FazendeiroPublico } from '../../src/types'
import { Icons } from '../../src/constants/icons'
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'

const ESTADOS = [
    'Todos','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO',
]

export default function BuscaScreen() {
    const [username, setUsername] = useState('')
    const [estadoSelecionado, setEstadoSelecionado] = useState('Todos')
    const [fazendeiros, setFazendeiros] = useState<FazendeiroPublico[]>([])
    const [loading, setLoading] = useState(false)
    const [pagina, setPagina] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [buscou, setBuscou] = useState(false)

    async function buscar(novaPagina = 1) {
        setLoading(true)
        try {
            const resultado = await buscarFazendeiros({
                username: username || undefined,
                estado: estadoSelecionado !== 'Todos' ? estadoSelecionado : undefined,
                page: novaPagina,
            })
            if (novaPagina === 1) {
                setFazendeiros(resultado.data)
            } else {
                setFazendeiros(prev => [...prev, ...resultado.data])
            }
            setPagina(novaPagina)
            setTotalPaginas(resultado.meta.last_page)
            setBuscou(true)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    function carregarMais() {
        if (pagina < totalPaginas && !loading) {
            buscar(pagina + 1)
        }
    }

    function abrirWhatsApp(whatsapp: string) {
        const numero = whatsapp.replace(/\D/g, '')
        Linking.openURL(`https://wa.me/55${numero}`)
    }

    function renderFazendeiro({ item }: { item: FazendeiroPublico }) {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/consultor/fazendeiro/${item.username}` as any)}
                activeOpacity={0.8}
            >
                {/* Avatar */}
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>

                {/* Informações */}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardNome}>{item.name}</Text>
                    <Text style={styles.cardUsername}>@{item.username}</Text>

                    {item.localizacao.cidade && (
                        <View style={styles.cardRow}>
                            <MapPin size={12} color={Colors.gray[500]} />
                            <Text style={styles.cardLocal}>
                                {item.localizacao.cidade} — {item.localizacao.estado}
                            </Text>
                        </View>
                    )}

                    {item.fazendas.length > 0 && (
                        <Text style={styles.cardFazendas}>
                            {item.fazendas.length} fazenda{item.fazendas.length > 1 ? 's' : ''} cadastrada{item.fazendas.length > 1 ? 's' : ''}
                        </Text>
                    )}
                </View>

                <ChevronRight size={18} color={Colors.gray[400]} />
            </TouchableOpacity>
        )
    }

    return (
        <View style={globalStyles.screen}>

            {/* ── Cabeçalho ─────────────────────────── */}
            <View style={styles.header}>
                <Text style={globalStyles.pageTitle}>Buscar Fazendeiros</Text>
                <Text style={globalStyles.pageSubtitle}>
                    Encontre fazendeiros pelo @ ou estado
                </Text>
            </View>

            {/* ── Filtros ───────────────────────────── */}
            <View style={styles.filtros}>

                {/* Input de busca */}
                <View style={styles.searchContainer}>
                    <Search size={18} color={Colors.gray[400]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por @usuario"
                        placeholderTextColor={Colors.gray[400]}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={() => buscar(1)}
                    />
                    {username.length > 0 && (
                        <TouchableOpacity onPress={() => setUsername('')}>
                            <Text style={styles.clearText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filtro de estado */}
                <View style={styles.estadoContainer}>
                    <FlatList
                        data={ESTADOS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => item}
                        contentContainerStyle={{ gap: Spacing.xs }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.estadoChip,
                                    estadoSelecionado === item && styles.estadoChipAtivo,
                                ]}
                                onPress={() => setEstadoSelecionado(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.estadoChipText,
                                    estadoSelecionado === item && styles.estadoChipTextAtivo,
                                ]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Botão buscar */}
                <TouchableOpacity
                    style={[globalStyles.buttonPrimary, loading && globalStyles.buttonDisabled]}
                    onPress={() => buscar(1)}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading && pagina === 1 ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={globalStyles.buttonPrimaryText}>Buscar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Resultados ────────────────────────── */}
            <FlatList
                data={fazendeiros}
                keyExtractor={item => item.id}
                renderItem={renderFazendeiro}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                onEndReached={carregarMais}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={
                    buscou && !loading ? (
                        <View style={styles.vazio}>
                            <Icons.circleAlert size={40} color="#FF0000" />
                            <Text style={styles.vazioTexto}>Nenhum fazendeiro encontrado</Text>
                            <Text style={styles.vazioSubtexto}>Tente buscar por outro @ ou estado</Text>
                        </View>
                    ) : !buscou ? (
                        <View style={styles.vazio}>
                            <Image
                                source={require('../../assets/png-files/chapeu_fazendeiro.png')}
                                style={{ width: 100, height: 100 }}
                            />
                            <Text style={styles.vazioTexto}>Busque fazendeiros</Text>
                            <Text style={styles.vazioSubtexto}>Use o campo acima para encontrar fazendeiros disponíveis</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loading && pagina > 1 ? (
                        <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
                    ) : null
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    filtros: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
    },
    clearText: {
        color: Colors.gray[400],
        fontSize: FontSize.md,
        paddingHorizontal: 4,
    },
    estadoContainer: {
        marginHorizontal: -Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    estadoChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        backgroundColor: Colors.white,
        minWidth: 44,
        alignItems: 'center',
    },
    estadoChipAtivo: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    estadoChipText: {
        fontSize: FontSize.xs,
        color: Colors.gray[700],
        fontWeight: '600',
    },
    estadoChipTextAtivo: {
        color: Colors.white,
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
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontSize: FontSize.xl,
        fontWeight: 'bold',
    },
    cardInfo: {
        flex: 1,
        gap: 2,
    },
    cardNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    cardUsername: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    cardLocal: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
    },
    cardFazendas: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    vazio: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
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