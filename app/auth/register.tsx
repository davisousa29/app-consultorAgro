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
import { register } from '../../src/services/authService'
import { useAuthStore } from '../../src/store/authStore'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import BackHeader from '../../src/components/Header/BackHeader'
import MaskedInput from '../../src/components/Input/MaskedInput'
import { phoneMask } from '../../src/utils/masks'
import CentralModal from '../../src/components/Modal/CentralModal'

export default function Register() {
    const { setUser } = useAuthStore()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [phone, setPhone] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
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

    async function handleRegister() {
        if (!name || !email || !username || !password || !passwordConfirmation) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Preencha todos os campos obrigatórios.',
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
            const response = await register({
                name,
                email,
                username,
                phone,
                whatsapp,
                password,
                password_confirmation: passwordConfirmation,
            })
            setUser(response.user, response.token)
            setIsSuccess(true)

            setModal({
                visible: true,
                title: 'Sucesso',
                message: 'Conta criada com sucesso!',
                type: 'success',
            })
        } catch (error: any) {
            const errors = error.response?.data?.errors

            if (errors) {
                const firstError = Object.values(errors)[0] as string[]

                setModal({
                    visible: true,
                    title: 'Erro',
                    message: firstError[0],
                    type: 'error',
                })
            } else {
                setModal({
                    visible: true,
                    title: 'Erro',
                    message: error.response?.data?.message || 'Erro ao criar conta.',
                    type: 'error',
                })
            }
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
                contentContainerStyle={globalStyles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <BackHeader
                    title="Criar conta"
                    subtitle="Preencha seus dados para começar"
                    showLogo={false}
                />

                {/* Formulário */}
                <View style={styles.form}>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Nome completo *</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Seu nome completo"
                            placeholderTextColor={Colors.gray[400]}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Email *</Text>
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
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Nome de usuário *</Text>
                        <View style={styles.usernameContainer}>
                            <Text style={styles.usernamePrefix}>@</Text>
                            <TextInput
                                style={styles.usernameInput}
                                placeholder="seu_usuario"
                                placeholderTextColor={Colors.gray[400]}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <Text style={globalStyles.inputHint}>Usado para que fazendeiros te encontrem</Text>
                    </View>

                    <MaskedInput
                        label="Telefone"
                        value={phone}
                        onChange={setPhone}
                        placeholder="(62) 99999-9999"
                        keyboardType="phone-pad"
                        mask={phoneMask}
                    />

                    <MaskedInput
                        label="WhatsApp"
                        value={whatsapp}
                        onChange={setWhatsapp}
                        placeholder="(62) 99999-9999"
                        keyboardType="phone-pad"
                        mask={phoneMask}
                    />

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Senha *</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Mínimo 8 caracteres"
                            placeholderTextColor={Colors.gray[400]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Confirmar senha *</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Repita sua senha"
                            placeholderTextColor={Colors.gray[400]}
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            globalStyles.buttonPrimary,
                            loading && globalStyles.buttonDisabled
                        ]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={globalStyles.buttonPrimaryText}>Criar conta</Text>
                        )}
                    </TouchableOpacity>

                </View>

                {/* Link para login */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Já tem conta? </Text>
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
                onClose={() => {
                    setModal(prev => ({ ...prev, visible: false }))

                    if (isSuccess) {
                        setIsSuccess(false)
                        router.replace('/consultor/perfil')
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
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
    },
    usernamePrefix: {
        fontSize: FontSize.md,
        color: Colors.primary,
        fontWeight: 'bold',
        marginRight: 4,
    },
    usernameInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
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