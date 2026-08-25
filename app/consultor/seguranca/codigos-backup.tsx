import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Copy, Check, ShieldAlert } from 'lucide-react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/constants'
import { globalStyles } from '../../../src/constants/globalStyles'
import { toastInfo } from '../../../src/utils/toast'

export default function CodigosBackup() {
    const { codigos } = useLocalSearchParams<{ codigos: string }>()
    const [copiado, setCopiado] = useState(false)

    const listaCodigos: string[] = codigos ? JSON.parse(codigos) : []

    async function copiarTodos() {
        const texto = listaCodigos.join('\n')
        await Clipboard.setStringAsync(texto)
        setCopiado(true)
        toastInfo('Códigos copiados.')
        setTimeout(() => setCopiado(false), 2000)
    }

    function concluir() {
        router.replace('/consultor/seguranca/dois-fatores' as any)
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView
                contentContainerStyle={styles.conteudo}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.iconeSucesso}>
                        <Check size={28} color="#40C057" />
                    </View>
                    <Text style={globalStyles.pageTitle}>Verificação ativada!</Text>
                    <Text style={globalStyles.pageSubtitle}>
                        Guarde seus códigos de recuperação
                    </Text>
                </View>

                {/* Aviso importante */}
                <View style={styles.aviso}>
                    <ShieldAlert size={20} color={Colors.warning} />
                    <Text style={styles.avisoTexto}>
                        Guarde estes códigos em um lugar seguro. Cada um pode ser usado uma
                        única vez para entrar caso você perca o acesso ao autenticador.
                        Eles não serão exibidos novamente.
                    </Text>
                </View>

                {/* Grade de códigos */}
                <View style={styles.grade}>
                    {listaCodigos.map((codigo, index) => (
                        <View key={index} style={styles.codigoBox}>
                            <Text style={styles.codigoTexto}>{codigo}</Text>
                        </View>
                    ))}
                </View>

                {/* Copiar */}
                <TouchableOpacity
                    style={styles.botaoCopiar}
                    onPress={copiarTodos}
                    activeOpacity={0.7}
                >
                    {copiado ? (
                        <Check size={18} color="#40C057" />
                    ) : (
                        <Copy size={18} color={Colors.primary} />
                    )}
                    <Text style={styles.botaoCopiarTexto}>
                        {copiado ? 'Copiado!' : 'Copiar todos os códigos'}
                    </Text>
                </TouchableOpacity>

                {/* Concluir */}
                <TouchableOpacity
                    style={[globalStyles.buttonPrimary, { marginTop: Spacing.lg }]}
                    onPress={concluir}
                    activeOpacity={0.8}
                >
                    <Text style={globalStyles.buttonPrimaryText}>Já guardei meus códigos</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    conteudo: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    iconeSucesso: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F5EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    aviso: {
        flexDirection: 'row',
        gap: Spacing.sm,
        backgroundColor: '#FFF9DB',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    avisoTexto: {
        flex: 1,
        fontSize: FontSize.xs,
        color: '#7A6320',
        lineHeight: 18,
    },
    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    codigoBox: {
        width: '47%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    codigoTexto: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.black,
        letterSpacing: 1,
    },
    botaoCopiar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    botaoCopiarTexto: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.primary,
    },
})