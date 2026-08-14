import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { redefinirSenha } from '../../src/services/authService'
import { Colors, FontSize, Spacing } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import BackHeader from '../../src/components/Header/BackHeader'
import CentralModal from '../../src/components/Modal/CentralModal'
import PasswordInput from '../../src/components/Input/PasswordInput'
import PasswordStrength from '../../src/components/Input/PasswordStrength'

export default function NovaSenha() {
    const { email, codigo } = useLocalSearchParams<{ email: string; codigo: string }>()
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
    })

    async function handleRedefinir() {
        if (!password || !passwordConfirmation) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Preencha os dois campos de senha.',
                type: 'default',
            })
            return
        }

        if (password !== passwordConfirmation) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'As senhas não coincidem.',
                type: 'default',
            })
            return
        }

        setLoading(true)
        try {
            await redefinirSenha({
                email: email as string,
                codigo: codigo as string,
                password,
                password_confirmation: passwordConfirmation,
            })
            setIsSuccess(true)
            setModal({
                visible: true,
                title: 'Senha redefinida',
                message: 'Sua senha foi alterada com sucesso. Faça login com a nova senha.',
                type: 'success',
            })
        } catch (error: any) {
            const errors = error.response?.data?.errors
            let message = error.response?.data?.message || 'Erro ao redefinir senha.'

            if (errors) {
                const firstError = Object.values(errors)[0] as string[]
                message = firstError[0]
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
                    title="Nova senha"
                    effectPhrase={''}
                    subtitle="Defina uma nova senha para sua conta"
                    showLogo={false}
                />

                <View style={styles.form}>
                    <View>
                        <PasswordInput
                            label="Nova senha"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Mínimo 8 caracteres"
                        />
                        <PasswordStrength senha={password} />
                    </View>

                    <PasswordInput
                        label="Confirmar nova senha"
                        value={passwordConfirmation}
                        onChangeText={setPasswordConfirmation}
                        placeholder="Repita a nova senha"
                    />

                    <TouchableOpacity
                        style={[globalStyles.buttonPrimary, loading && globalStyles.buttonDisabled]}
                        onPress={handleRedefinir}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={globalStyles.buttonPrimaryText}>Redefinir senha</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                dismissable={!isSuccess}
                showCloseIcon={!isSuccess}
                confirmText="Fechar"
                onClose={() => {
                    setModal(prev => ({ ...prev, visible: false }))
                    if (isSuccess) {
                        setIsSuccess(false)
                        // Volta ao login limpando o histórico do fluxo de recuperação
                        router.replace('/auth/login')
                    }
                }}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    form: {
        gap: Spacing.md,
    },
})