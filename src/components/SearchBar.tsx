import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Search, X } from 'lucide-react-native'
import { Colors, Spacing, BorderRadius, FontSize } from '../constants'

interface Props {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }: Props) {
    return (
        <View style={styles.container}>
            <Search size={18} color={Colors.gray[400]} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.gray[400]}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChange('')} activeOpacity={0.7}>
                    <X size={16} color={Colors.gray[400]} />
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
    },
})