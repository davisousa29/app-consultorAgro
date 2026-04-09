import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { register } from '../../src/services/authService'
import { useAuthStore } from '../../src/store/authStore'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'
import Logo from '../../src/components/Logo'
import BackHeader from '../../src/components/Header/BackHeader'
import { globalStyles } from '../../src/constants/globalStyles'

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

    async function handleRegister() {
        if (!name || !email || !username || !password || !passwordConfirmation) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.')
            return
        }

        if (password !== passwordConfirmation) {
            Alert.alert('Atenção', 'As senhas não coincidem.')
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
            router.replace('/consultor/home')
        } catch (error: any) {
            const errors = error.response?.data?.errors
            if (errors) {
                const firstError = Object.values(errors)[0] as string[]
                Alert.alert('Erro', firstError[0])
            } else {
                Alert.alert('Erro', error.response?.data?.message || 'Erro ao criar conta.')
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

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Telefone</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="(62) 99999-9999"
                            placeholderTextColor={Colors.gray[400]}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>WhatsApp</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="(62) 99999-9999"
                            placeholderTextColor={Colors.gray[400]}
                            value={whatsapp}
                            onChangeText={setWhatsapp}
                            keyboardType="phone-pad"
                        />
                    </View>

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
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
    },
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