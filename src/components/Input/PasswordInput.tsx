import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
} from 'react-native'
import { Icons } from '../../constants/icons'
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants'
import { globalStyles } from '../../constants/globalStyles'

interface Props extends Omit<TextInputProps, 'secureTextEntry'> {
    label?: string
    value: string
    onChangeText: (text: string) => void
    placeholder?: string
    hint?: string
}

export default function PasswordInput({
                                          label,
                                          value,
                                          onChangeText,
                                          placeholder = 'Sua senha',
                                          hint,
                                          ...rest
                                      }: Props) {
    const [mostrarSenha, setMostrarSenha] = useState(false)

    return (
        <View style={globalStyles.inputGroup}>
            {label && <Text style={globalStyles.inputLabel}>{label}</Text>}

            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.gray[400]}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                    autoCorrect={false}
                    {...rest}
                />
                <TouchableOpacity
                    onPress={() => setMostrarSenha(v => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    {mostrarSenha ? (
                        <Icons.eyeOff size={20} color={Colors.gray[500]} />
                    ) : (
                        <Icons.eye size={20} color={Colors.gray[500]} />
                    )}
                </TouchableOpacity>
            </View>

            {hint && <Text style={globalStyles.inputHint}>{hint}</Text>}
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
    input: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
    },
})