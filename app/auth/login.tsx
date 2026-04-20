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
import { login } from '../../src/services/authService'
import { useAuthStore } from '../../src/store/authStore'
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants'
import { globalStyles } from '../../src/constants/globalStyles'
import BackHeader from '../../src/components/Header/BackHeader'
import CentralModal from '../../src/components/Modal/CentralModal'

export default function Login() {
    const { setUser } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'default' as 'default' | 'success' | 'error',
    })

    async function handleLogin() {
        if (!email || !password) {
            setModal({
                visible: true,
                title: 'Atenção',
                message: 'Preencha email e senha.',
                type: 'default',
            })
            return
        }

        setLoading(true)
        try {
            const response = await login(email, password)
            setUser(response.user, response.token)
            router.replace('/consultor/home')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao fazer login.'

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
                    title="Criar conta"
                    effectPhrase={''}
                    subtitle="Preencha seus dados para começar"
                    showLogo={true}
                />

                {/* Formulário */}
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
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.inputLabel}>Senha</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Sua senha"
                            placeholderTextColor={Colors.gray[400]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[globalStyles.buttonPrimary, loading && globalStyles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={globalStyles.buttonPrimaryText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                </View>

                {/* Link para cadastro */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Ainda não tem conta? </Text>
                    <TouchableOpacity onPress={() => router.replace('/auth/register')}>
                        <Text style={styles.footerLink}>Criar conta</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <CentralModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, visible: false })}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        marginTop: Spacing.md,
    },
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