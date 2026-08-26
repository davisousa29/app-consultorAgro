import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Smartphone, Mail, KeyRound } from 'lucide-react-native'
import { useAuthStore } from '../../src/store/authStore'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import BackHeader from '../../src/components/Header/BackHeader'
import CentralModal from '../../src/components/Modal/CentralModal'
import { enviarCodigoEmail2fa, verificarLogin2fa } from '../../src/services/doisFatoresService'

interface Metodo {
    chave: string
    nome: string
    descricao: string
}

type Etapa = 'escolher' | 'codigo'

export default function Verificar2fa() {
    const { setUser } = useAuthStore()
    const { email, metodos } = useLocalSearchParams<{ email: string; metodos: string }>()

    const listaMetodos: Metodo[] = metodos ? JSON.parse(metodos) : []

    const [etapa, setEtapa] = useState<Etapa>('escolher')
    const [metodoEscolhido, setMetodoEscolhido] = useState<'authenticator' | 'email' | 'backup'>('authenticator')
    const [codigo, setCodigo] = useState('')
    const [loading, setLoading] = useState(false)
    const [usandoBackup, setUsandoBackup] = useState(false)
    const [modal, setModal] = useState({ visible: false, title: '', message: '' })

    function mostrarErro(message: string) {
        setModal({ visible: true, title: 'Erro', message })
    }

    async function escolherMetodo(metodo: 'authenticator' | 'email') {
        setMetodoEscolhido(metodo)
        setUsandoBackup(false)

        // Se for email, dispara o envio do código
        if (metodo === 'email') {
            setLoading(true)
            try {
                await enviarCodigoEmail2fa(email as string)
            } catch {
                // segue mesmo assim (resposta genérica)
            } finally {
                setLoading(false)
            }
        }

        setCodigo('')
        setEtapa('codigo')
    }

    function usarCodigoBackup() {
        setMetodoEscolhido('backup')
        setUsandoBackup(true)
        setCodigo('')
        setEtapa('codigo')
    }

    async function verificar() {
        const codigoLimpo = codigo.trim()

        if (metodoEscolhido === 'backup') {
            if (codigoLimpo.length < 8) {
                mostrarErro('Digite um código de recuperação válido.')
                return
            }
        } else if (codigoLimpo.length !== 6) {
            mostrarErro('Digite os 6 dígitos do código.')
            return
        }

        setLoading(true)
        try {
            const resposta = await verificarLogin2fa({
                email: email as string,
                codigo: codigoLimpo,
                metodo: metodoEscolhido,
            })

            setUser(resposta.user, resposta.token)
            router.replace('/consultor/home')
        } catch (error: any) {
            mostrarErro(error.response?.data?.message || 'Código incorreto.')
        } finally {
            setLoading(false)
        }
    }

    const iconePorMetodo: Record<string, any> = {
        authenticator: Smartphone,
        email: Mail,
    }

    return (
        <KeyboardAvoidingView
            style={globalStyles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={globalStyles.scrollContentLoggedOut}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <BackHeader
                    title="Verificação em duas etapas"
                    effectPhrase={''}
                    subtitle={
                        etapa === 'escolher'
                            ? 'Escolha como deseja receber o código'
                            : 'Digite o código de verificação'
                    }
                    showLogo={false}
                />

                {etapa === 'escolher' ? (
                    <View style={styles.metodos}>
                        {listaMetodos.map((m) => {
                            const Icone = iconePorMetodo[m.chave] ?? Smartphone
                            return (
                                <TouchableOpacity
                                    key={m.chave}
                                    style={styles.metodoCard}
                                    onPress={() => escolherMetodo(m.chave as 'authenticator' | 'email')}
                                    activeOpacity={0.7}
                                    disabled={loading}
                                >
                                    <View style={styles.metodoIcone}>
                                        <Icone size={22} color={Colors.primary} />
                                    </View>
                                    <View style={styles.metodoInfo}>
                                        <Text style={styles.metodoNome}>{m.nome}</Text>
                                        <Text style={styles.metodoDescricao}>{m.descricao}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}

                        {/* Usar código de recuperação */}
                        <TouchableOpacity
                            style={styles.backupLink}
                            onPress={usarCodigoBackup}
                            activeOpacity={0.7}
                        >
                            <KeyRound size={16} color={Colors.gray[600]} />
                            <Text style={styles.backupTexto}>Usar código de recuperação</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        {loading && metodoEscolhido === 'email' ? (
                            <View style={styles.enviando}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.enviandoTexto}>Enviando código...</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.instrucao}>
                                    {metodoEscolhido === 'authenticator'
                                        ? 'Insira o código de 6 dígitos do seu aplicativo autenticador.'
                                        : metodoEscolhido === 'email'
                                            ? `Enviamos um código para ${email}.`
                                            : 'Insira um dos seus códigos de recuperação.'}
                                </Text>

                                <TextInput
                                    style={styles.codigoInput}
                                    placeholder={metodoEscolhido === 'backup' ? 'XXXX-XXXX' : '000000'}
                                    placeholderTextColor={Colors.gray[300]}
                                    value={codigo}
                                    onChangeText={(t) => {
                                        if (metodoEscolhido === 'backup') {
                                            setCodigo(t.toUpperCase().slice(0, 9))
                                        } else {
                                            setCodigo(t.replace(/[^0-9]/g, '').slice(0, 6))
                                        }
                                    }}
                                    keyboardType={metodoEscolhido === 'backup' ? 'default' : 'number-pad'}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    textAlign="center"
                                />

                                <TouchableOpacity
                                    style={[globalStyles.buttonPrimary, loading && globalStyles.buttonDisabled]}
                                    onPress={verificar}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={Colors.white} />
                                    ) : (
                                        <Text style={globalStyles.buttonPrimaryText}>Verificar</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.voltarMetodo}
                                    onPress={() => setEtapa('escolher')}
                                >
                                    <Text style={styles.voltarMetodoTexto}>Escolher outro método</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type="error"
                dismissable
                showCloseIcon
                confirmText="Fechar"
                onClose={() => setModal({ ...modal, visible: false })}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    metodos: {
        gap: Spacing.md,
    },
    metodoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
    },
    metodoIcone: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metodoInfo: {
        flex: 1,
        gap: 2,
    },
    metodoNome: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    metodoDescricao: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
    },
    backupLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
    },
    backupTexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        fontWeight: '600',
    },
    form: {
        gap: Spacing.md,
    },
    instrucao: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
    },
    codigoInput: {
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 8,
        color: Colors.black,
    },
    enviando: {
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.xl,
    },
    enviandoTexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
    },
    voltarMetodo: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    voltarMetodoTexto: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
})