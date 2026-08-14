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
import { router } from 'expo-router'
import { solicitarCodigoRecuperacao } from '../../src/services/authService'
import { Colors, FontSize, Spacing } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import BackHeader from '../../src/components/Header/BackHeader'
import CentralModal from '../../src/components/Modal/CentralModal'

export default function RecuperarSenha() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
    })

    async function handleSolicitar() {
        const emailLimpo = email.trim().toLowerCase()

        if (!emailLimpo) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Informe seu email.',
                type: 'default',
            })
            return
        }

        setLoading(true)
        try {
            await solicitarCodigoRecuperacao(emailLimpo)
            // Segue para a tela de código independentemente de o email existir
            router.push({
                pathname: '/auth/codigo-recuperacao',
                params: { email: emailLimpo },
            } as any)
        } catch (error: any) {
            let message = error.response?.data?.message || 'Erro ao solicitar código.'
            if (error.response?.status === 429) {
                message = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.'
            }
            setModal({
                visible: true,
                title: 'Erro',
                message,
                type: 'error',
            })
        } finally {
            setLoading(false)
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
                    title="Recuperar senha"
                    effectPhrase={''}
                    subtitle="Informe seu email para receber o código"
                    showLogo={false}
                />

                <View style={styles.form}>
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Email</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="seu@email.com"
                            placeholderTextColor={Colors.gray[400]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={globalStyles.inputHint}>
                            Enviaremos um código de 6 dígitos para o seu email.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[globalStyles.buttonPrimary, loading && globalStyles.buttonDisabled]}
                        onPress={handleSolicitar}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={globalStyles.buttonPrimaryText}>Enviar código</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Lembrou a senha? </Text>
                    <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                        <Text style={styles.footerLink}>Entrar</Text>
                    </TouchableOpacity>
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    footerText: {
        color: Colors.gray[600],
        fontSize: FontSize.sm,
    },
    footerLink: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: 'bold',
    },
})