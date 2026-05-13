import { View, Text, TextInput, StyleSheet } from 'react-native'
import { globalStyles } from '../../constants/globalStyles'
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants'

interface CurrencyInputProps {
    label: string
    value: string
    onChange: (value: string) => void
    hint?: string
}

function formatarMoeda(texto: string): string {
    // Remove tudo que não é número
    const numeros = texto.replace(/\D/g, '')
    if (!numeros) return ''

    // Converte para centavos e formata
    const valor = parseInt(numeros) / 100
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function parsearMoeda(texto: string): number {
    const limpo = texto.replace(/\./g, '').replace(',', '.')
    return parseFloat(limpo) || 0
}

export default function CurrencyInput({ label, value, onChange, hint }: CurrencyInputProps) {

    function handleChange(texto: string) {
        const formatado = formatarMoeda(texto)
        onChange(formatado)
    }

    return (
        <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>{label}</Text>
            <View style={styles.container}>
                <Text style={styles.prefixo}>R$</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0,00"
                    placeholderTextColor={Colors.gray[400]}
                    value={value}
                    onChangeText={handleChange}
                    keyboardType="number-pad"
                />
            </View>
            {hint && (
                <Text style={globalStyles.inputHint}>{hint}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
    },
    prefixo: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        fontWeight: '600',
        marginRight: Spacing.xs,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
    },
})