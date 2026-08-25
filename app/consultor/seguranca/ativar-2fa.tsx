import { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { router } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import * as Clipboard from 'expo-clipboard'
import { Copy, Check } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import BackButton from '../../../src/components/Header/BackButton'
import { gerar2fa, confirmar2fa } from '../../../src/services/doisFatoresService'
import { toastSucesso, toastErro, toastInfo } from '../../../src/utils/toast'

export default function Ativar2fa() {
    const [loading, setLoading] = useState(true)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [chaveManual, setChaveManual] = useState('')
    const [codigo, setCodigo] = useState('')
    const [confirmando, setConfirmando] = useState(false)
    const [copiado, setCopiado] = useState(false)

    useEffect(() => {
        gerarSegredo()
    }, [])

    async function gerarSegredo() {
        setLoading(true)
        try {
            const dados = await gerar2fa()
            setQrCodeUrl(dados.qr_code_url)
            setChaveManual(dados.chave_manual)
        } catch (error: any) {
            toastErro(error.response?.data?.message || 'Erro ao gerar o código.')
            router.back()
        } finally {
            setLoading(false)
        }
    }

    async function copiarChave() {
        await Clipboard.setStringAsync(chaveManual)
        setCopiado(true)
        toastInfo('Chave copiada.')
        setTimeout(() => setCopiado(false), 2000)
    }

    async function handleConfirmar() {
        if (codigo.length !== 6) {
            toastErro('Digite os 6 dígitos do código.')
            return
        }

        setConfirmando(true)
        try {
            const resultado = await confirmar2fa(codigo)
            // Leva para a tela de códigos de backup, passando os códigos
            router.replace({
                pathname: '/consultor/seguranca/codigos-backup',
                params: { codigos: JSON.stringify(resultado.codigos_recuperacao) },
            } as any)
        } catch (error: any) {
            toastErro(error.response?.data?.message || 'Código incorreto.')
        } finally {
            setConfirmando(false)
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
        <KeyboardAvoidingView
            style={globalStyles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={globalStyles.backButtonContainer}>
                <BackButton />
            </View>

            <ScrollView
                contentContainerStyle={styles.conteudo}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={globalStyles.screen}>
                    <View style={globalStyles.backButtonContainer}>
                        <BackButton />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.conteudo}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Text style={globalStyles.pageTitle}>Ativar verificação</Text>
                            <Text style={globalStyles.pageSubtitle}>
                                Configure seu aplicativo autenticador
                            </Text>
                        </View>

                        {/* Passo 1 — QR code */}
                        <View style={styles.passo}>
                            <Text style={styles.passoTitulo}>1. Escaneie o QR code</Text>
                            <Text style={styles.passoTexto}>
                                Abra o Google Authenticator (ou similar) e escaneie o código abaixo.
                            </Text>
                            <View style={styles.qrContainer}>
                                {qrCodeUrl ? (
                                    <QRCode value={qrCodeUrl} size={180} />
                                ) : null}
                            </View>
                        </View>

                        {/* Passo 2 — Chave manual */}
                        <View style={styles.passo}>
                            <Text style={styles.passoTitulo}>2. Ou insira a chave manualmente</Text>
                            <Text style={styles.passoTexto}>
                                Se estiver usando o mesmo celular, copie a chave e cole no autenticador.
                            </Text>
                            <TouchableOpacity style={styles.chaveBox} onPress={copiarChave} activeOpacity={0.7}>
                                <Text style={styles.chaveTexto} selectable>{chaveManual}</Text>
                                {copiado ? (
                                    <Check size={18} color="#40C057" />
                                ) : (
                                    <Copy size={18} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Passo 3 — Confirmar código */}
                        <View style={styles.passo}>
                            <Text style={styles.passoTitulo}>3. Digite o código gerado</Text>
                            <Text style={styles.passoTexto}>
                                Insira o código de 6 dígitos que aparece no aplicativo.
                            </Text>
                            <TextInput
                                style={styles.codigoInput}
                                placeholder="000000"
                                placeholderTextColor={Colors.gray[300]}
                                value={codigo}
                                onChangeText={(t) => setCodigo(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                            />
                        </View>

                        <TouchableOpacity
                            style={[globalStyles.buttonPrimary, confirmando && globalStyles.buttonDisabled]}
                            onPress={handleConfirmar}
                            disabled={confirmando}
                            activeOpacity={0.8}
                        >
                            {confirmando ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={globalStyles.buttonPrimaryText}>Confirmar e ativar</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    conteudo: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    header: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.lg,
    },
    passo: {
        marginBottom: Spacing.lg,
        gap: Spacing.xs,
    },
    passoTitulo: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.black,
    },
    passoTexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        lineHeight: 18,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginTop: Spacing.sm,
        alignSelf: 'center',
    },
    chaveBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.gray[100],
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    chaveTexto: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.black,
        letterSpacing: 1,
    },
    codigoInput: {
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 12,
        color: Colors.black,
        marginTop: Spacing.sm,
    },
})