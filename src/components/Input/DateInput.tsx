import { View, Text, TextInput, StyleSheet } from 'react-native'
import { globalStyles } from '../../constants/globalStyles'
import { Colors } from '../../constants'

interface DateInputProps {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    hint?: string
}

function formatarData(texto: string): string {
    const numeros = texto.replace(/\D/g, '').slice(0, 8)

    const dia = numeros.slice(0, 2)
    const mes = numeros.slice(2, 4)
    const ano = numeros.slice(4, 8)

    if (numeros.length <= 2) return dia
    if (numeros.length <= 4) return `${dia}/${mes}`
    return `${dia}/${mes}/${ano}`
}

function validarData(texto: string): boolean {
    if (texto.length < 10) return true

    const partes = texto.split('/')
    if (partes.length !== 3) return false

    const dia = parseInt(partes[0])
    const mes = parseInt(partes[1])
    const ano = parseInt(partes[2])

    if (mes < 1 || mes > 12) return false
    if (dia < 1 || dia > 31) return false
    if (ano < 2000 || ano > 2100) return false

    // Validação de dias por mês
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const bissexto = (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0
    if (bissexto) diasPorMes[1] = 29
    if (dia > diasPorMes[mes - 1]) return false

    return true
}

export default function DateInput({ label, value, onChange, placeholder = 'DD/MM/AAAA', hint }: DateInputProps) {
    const invalida = value.length === 10 && !validarData(value)

    function handleChange(texto: string) {
        const formatado = formatarData(texto)
        onChange(formatado)
    }

    return (
        <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>{label}</Text>
            <TextInput
                style={[
                    globalStyles.input,
                    { width: '100%' },
                    invalida && styles.inputInvalido,
                ]}
                placeholder={placeholder}
                placeholderTextColor={Colors.gray[400]}
                value={value}
                onChangeText={handleChange}
                keyboardType="number-pad"
                maxLength={10}
            />
            {invalida && (
                <Text style={styles.erroTexto}>Data inválida</Text>
            )}
            {hint && !invalida && (
                <Text style={globalStyles.inputHint}>{hint}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    inputInvalido: {
        borderColor: '#FA5252',
    },
    erroTexto: {
        fontSize: 11,
        color: '#FA5252',
    },
})