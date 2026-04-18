import { Text, View } from 'react-native'
import MaskInput from 'react-native-mask-input'
import { globalStyles } from '../../constants/globalStyles'
import { Colors } from '../../constants'

interface Props {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    mask?: any
    keyboardType?: any
    hint?: string
}

export default function MaskedInput({
                                        label,
                                        value,
                                        onChange,
                                        placeholder,
                                        mask,
                                        keyboardType = 'default',
                                        hint
                                    }: Props) {
    return (
        <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>{label}</Text>

            <MaskInput
                style={globalStyles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.gray[400]}
                value={value}
                onChangeText={(masked, unmasked) => onChange(unmasked)}
                keyboardType={keyboardType}
                mask={mask}
            />

            {hint && <Text style={globalStyles.inputHint}>{hint}</Text>}
        </View>
    )
}