import { useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    Modal,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { ShieldCheck, ShieldOff } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import BackButton from '../../../src/components/Header/BackButton'
import PasswordInput from '../../../src/components/Input/PasswordInput'
import { status2fa, desativar2fa } from '../../../src/services/doisFatoresService'
import { toastSucesso, toastErro } from '../../../src/utils/toast'

export default function DoisFatores() {
    const [ativo, setAtivo] = useState(false)
    const [loading, setLoading] = useState(true)
    const [modalDesativar, setModalDesativar] = useState(false)
    const [senha, setSenha] = useState('')
    const [desativando, setDesativando] = useState(false)

    useFocusEffect(
        useCallback(() => {
            carregarStatus()
        }, [])
    )

    async function carregarStatus() {
        setLoading(true)
        try {
            const resultado = await status2fa()
            setAtivo(resultado.ativo)
        } catch {
            // silencioso
        } finally {
            setLoading(false)
        }
    }

    async function handleDesativar() {
        if (!senha) {
            toastErro('Informe sua senha.')
            return
        }

        setDesativando(true)
        try {
            await desativar2fa(senha)
            setModalDesativar(false)
            setSenha('')
            setAtivo(false)
            toastSucesso('Autenticação em duas etapas desativada.')
        } catch (error: any) {
            toastErro(error.response?.data?.message || 'Erro ao desativar.')
        } finally {
            setDesativando(false)
        }
    }

    if (loading) {
        return (
            <View style={[globalStyles.screen, globalStyles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    return (
        <View style={globalStyles.screen}>
            <View style={globalStyles.backButtonContainer}>
                <BackButton />
            </View>

            <ScrollView
                contentContainerStyle={styles.conteudo}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={globalStyles.pageTitle}>Autenticação em duas etapas</Text>
                    <Text style={globalStyles.pageSubtitle}>
                        Uma camada extra de segurança para sua conta
                    </Text>
                </View>

                {/* Card de status */}
                <View style={styles.cardStatus}>
                    <View style={[
                        styles.statusIcone,
                        { backgroundColor: ativo ? '#E8F5EE' : Colors.gray[100] },
                    ]}>
                        {ativo ? (
                            <ShieldCheck size={28} color="#40C057" />
                        ) : (
                            <ShieldOff size={28} color={Colors.gray[400]} />
                        )}
                    </View>
                    <Text style={styles.statusTitulo}>
                        {ativo ? 'Ativada' : 'Desativada'}
                    </Text>
                    <Text style={styles.statusDescricao}>
                        {ativo
                            ? 'Sua conta está protegida. A cada login, será pedido um código de verificação.'
                            : 'Ative para exigir um código de verificação além da senha ao entrar.'}
                    </Text>
                </View>

                {/* Explicação */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitulo}>Como funciona</Text>
                    <Text style={styles.infoTexto}>
                        Com a verificação em duas etapas ativa, além da sua senha você precisará
                        informar um código gerado por um aplicativo autenticador (como o Google
                        Authenticator) ou recebido por email a cada login.
                    </Text>
                </View>

                {/* Ação */}
                {ativo ? (
                    <TouchableOpacity
                        style={styles.botaoDesativar}
                        onPress={() => setModalDesativar(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.botaoDesativarTexto}>Desativar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={globalStyles.buttonPrimary}
                        onPress={() => router.push('/consultor/seguranca/ativar-2fa' as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={globalStyles.buttonPrimaryText}>Ativar agora</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Modal de desativação (pede senha) */}
            <Modal
                visible={modalDesativar}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    setModalDesativar(false)
                    setSenha('')
                }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlaySenha}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalSenha}>
                                <Text style={styles.modalSenhaTitulo}>Desativar verificação</Text>
                                <Text style={styles.modalSenhaTexto}>
                                    Para desativar, confirme sua senha.
                                </Text>

                                <PasswordInput
                                    label="Senha"
                                    value={senha}
                                    onChangeText={setSenha}
                                    placeholder="Sua senha"
                                />

                                <View style={styles.modalSenhaBotoes}>
                                    <TouchableOpacity
                                        style={styles.modalBotaoCancelar}
                                        onPress={() => {
                                            setModalDesativar(false)
                                            setSenha('')
                                        }}
                                        disabled={desativando}
                                    >
                                        <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalBotaoConfirmar}
                                        onPress={handleDesativar}
                                        disabled={desativando}
                                    >
                                        {desativando ? (
                                            <ActivityIndicator color={Colors.white} size="small" />
                                        ) : (
                                            <Text style={styles.modalBotaoConfirmarTexto}>Desativar</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    conteudo: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    header: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.lg,
    },
    cardStatus: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    statusIcone: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusTitulo: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
    },
    statusDescricao: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
    },
    infoBox: {
        backgroundColor: Colors.gray[100],
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        gap: Spacing.xs,
    },
    infoTitulo: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.gray[700],
    },
    infoTexto: {
        fontSize: FontSize.xs,
        color: Colors.gray[600],
        lineHeight: 18,
    },
    botaoDesativar: {
        backgroundColor: Colors.error,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    botaoDesativarTexto: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    overlaySenha: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalSenha: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    modalSenhaTitulo: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
    },
    modalSenhaTexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        marginBottom: Spacing.sm,
    },
    modalSenhaBotoes: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    modalBotaoCancelar: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        alignItems: 'center',
    },
    modalBotaoCancelarTexto: {
        color: Colors.gray[700],
        fontWeight: 'bold',
    },
    modalBotaoConfirmar: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.error,
        alignItems: 'center',
    },
    modalBotaoConfirmarTexto: {
        color: Colors.white,
        fontWeight: 'bold',
    },
})