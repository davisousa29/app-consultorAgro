import { useState, useEffect, useRef } from 'react'
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
import { solicitarCodigoRecuperacao } from '../../src/services/authService'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import BackHeader from '../../src/components/Header/BackHeader'
import CentralModal from '../../src/components/Modal/CentralModal'

const COOLDOWN_SEGUNDOS = 180 // 3 minutos

export default function CodigoRecuperacao() {
    const { email } = useLocalSearchParams<{ email: string }>()
    const [codigo, setCodigo] = useState('')
    const [segundos, setSegundos] = useState(COOLDOWN_SEGUNDOS)
    const [reenviando, setReenviando] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
    })

    // Inicia o contador regressivo ao montar
    useEffect(() => {
        iniciarContador()
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    function iniciarContador() {
        setSegundos(COOLDOWN_SEGUNDOS)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setSegundos(s => {
                if (s <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    return 0
                }
                return s - 1
            })
        }, 1000)
    }

    function formatarTempo(seg: number): string {
        const min = Math.floor(seg / 60)
        const s = seg % 60
        return `${min}:${s.toString().padStart(2, '0')}`
    }

    function handleContinuar() {
        if (codigo.length !== 6) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Digite os 6 dígitos do código.',
                type: 'default',
            })
            return
        }

        // Passa email e código para a tela de nova senha
        router.push({
            pathname: '/auth/nova-senha',
            params: { email, codigo },
        } as any)
    }

    async function handleReenviar() {
        if (segundos > 0) return

        setReenviando(true)
        try {
            await solicitarCodigoRecuperacao(email as string)
            iniciarContador()
            setModal({
                visible: true,
                title: 'Código reenviado',
                message: 'Se o email estiver cadastrado, um novo código foi enviado.',
                type: 'success',
            })
        } catch (error: any) {
            let message = error.response?.data?.message || 'Erro ao reenviar código.'
            if (error.response?.status === 429) {
                message = 'Aguarde o tempo indicado antes de solicitar um novo código.'
            }
            setModal({
                visible: true,
                title: 'Erro',
                message,
                type: 'error',
            })
        } finally {
            setReenviando(false)
        }
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
                    title="Digite o código"
                    effectPhrase={''}
                    subtitle={`Enviamos um código de 6 dígitos para ${email}`}
                    showLogo={false}
                />

                <View style={styles.form}>
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Código de verificação</Text>
                        <TextInput
                            style={styles.codigoInput}
                            placeholder="000000"
                            placeholderTextColor={Colors.gray[300]}
                            value={codigo}
                            onChangeText={text => setCodigo(text.replace(/[^0-9]/g, '').slice(0, 6))}
                            keyboardType="number-pad"
                            maxLength={6}
                            textAlign="center"
                        />
                    </View>

                    <TouchableOpacity
                        style={globalStyles.buttonPrimary}
                        onPress={handleContinuar}
                    >
                        <Text style={globalStyles.buttonPrimaryText}>Continuar</Text>
                    </TouchableOpacity>

                    {/* Reenviar código */}
                    <View style={styles.reenviarContainer}>
                        {segundos > 0 ? (
                            <Text style={styles.reenviarTexto}>
                                Reenviar código em {formatarTempo(segundos)}
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleReenviar} disabled={reenviando}>
                                {reenviando ? (
                                    <ActivityIndicator color={Colors.primary} size="small" />
                                ) : (
                                    <Text style={styles.reenviarLink}>Reenviar código</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                dismissable
                showCloseIcon
                confirmText="Fechar"
                onClose={() => setModal(prev => ({ ...prev, visible: false }))}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    form: {
        gap: Spacing.md,
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
    },
    reenviarContainer: {
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    reenviarTexto: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
    reenviarLink: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: 'bold',
    },
})