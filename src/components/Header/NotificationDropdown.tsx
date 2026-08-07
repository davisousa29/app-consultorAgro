import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
} from 'react-native'
import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants'
import { Icons } from '../../constants/icons'
import {
    ultimasNotificacoes,
    marcarLida,
    Notificacao,
} from '../../services/notificacaoService'
import { useNotificacaoStore } from '../../store/notificacaoStore'

interface Props {
    visible: boolean
    onClose: () => void
}

// Mapa de ícone e cor por tipo de notificação
const TIPO_CONFIG: Record<string, { icone: any; cor: string }> = {
    contrato_aceito:    { icone: Icons.handShake,  cor: '#40C057' },
    contrato_recusado:  { icone: Icons.circleAlert, cor: '#FA5252' },
    contrato_encerrado: { icone: Icons.contract,   cor: '#6C757D' },
}

function tempoRelativo(data: string): string {
    const agora = new Date()
    const then = new Date(data)
    const diffMs = agora.getTime() - then.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin}min`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 30) return `${diffD}d`
    return then.toLocaleDateString('pt-BR')
}

export default function NotificationDropdown({ visible, onClose }: Props) {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
    const [loading, setLoading] = useState(false)
    const { atualizarNaoLidas } = useNotificacaoStore()

    useEffect(() => {
        if (visible) {
            carregar()
        }
    }, [visible])

    async function carregar() {
        setLoading(true)
        try {
            const dados = await ultimasNotificacoes()
            setNotificacoes(dados)
        } catch {
            // silencioso
        } finally {
            setLoading(false)
        }
    }

    async function handleTocar(notif: Notificacao) {
        onClose()

        // Marca como lida se ainda não for
        if (!notif.lida) {
            try {
                await marcarLida(notif.id)
                atualizarNaoLidas()
            } catch {
                // segue mesmo se falhar
            }
        }

        // Navega para o recurso, se houver
        if (notif.dados?.rota === 'contrato' && notif.dados.id) {
            router.push(`/consultor/contrato/${notif.dados.id}` as any)
        }
    }

    function verTodas() {
        onClose()
        router.push('/consultor/notificacoes' as any)
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.container}
                    onPress={() => {}}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Notificações</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Lista */}
                    {loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator color={Colors.primary} />
                        </View>
                    ) : notificacoes.length === 0 ? (
                        <View style={styles.vazio}>
                            <Icons.bell size={28} color={Colors.gray[300]} />
                            <Text style={styles.vazioTexto}>Nenhuma notificação</Text>
                        </View>
                    ) : (
                        notificacoes.map((notif, index) => {
                            const config = TIPO_CONFIG[notif.tipo] ?? { icone: Icons.bell, cor: Colors.gray[500] }
                            const Icone = config.icone
                            return (
                                <View key={notif.id}>
                                    {index > 0 && <View style={styles.divider} />}
                                    <TouchableOpacity
                                        style={styles.item}
                                        onPress={() => handleTocar(notif)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.itemIcone, { backgroundColor: config.cor + '20' }]}>
                                            <Icone size={16} color={config.cor} />
                                        </View>
                                        <View style={styles.itemConteudo}>
                                            <Text style={styles.itemTitulo} numberOfLines={1}>
                                                {notif.titulo}
                                            </Text>
                                            <Text style={styles.itemMensagem} numberOfLines={2}>
                                                {notif.mensagem}
                                            </Text>
                                            <Text style={styles.itemTempo}>
                                                {tempoRelativo(notif.created_at)}
                                            </Text>
                                        </View>
                                        {!notif.lida && <View style={styles.dotNaoLida} />}
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    )}

                    <View style={styles.divider} />

                    {/* Ver todas */}
                    <TouchableOpacity
                        style={styles.verTodas}
                        onPress={verTodas}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.verTodasTexto}>Ver todas</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        top: 100,
        right: Spacing.lg,
        width: 300,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    loading: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    vazio: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.xs,
    },
    vazioTexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    itemIcone: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemConteudo: {
        flex: 1,
        gap: 1,
    },
    itemTitulo: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.black,
    },
    itemMensagem: {
        fontSize: FontSize.xs,
        color: Colors.gray[600],
    },
    itemTempo: {
        fontSize: 10,
        color: Colors.gray[400],
        marginTop: 2,
    },
    dotNaoLida: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginTop: 4,
    },
    verTodas: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    verTodasTexto: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray[200],
    },
})