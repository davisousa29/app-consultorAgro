import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Colors, FontSize, Spacing } from '../../constants'

interface Props {
    onPress?: () => void
}

export default function BackButton({ onPress }: Props) {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress ?? (() => router.back())}
            activeOpacity={0.7}
        >
            <Text style={styles.arrow}>←</Text>
            <Text style={styles.texto}>Voltar</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: Spacing.lg,
        alignSelf: 'flex-start',
    },
    arrow: {
        fontSize: FontSize.md,
        color: Colors.primary,
    },
    texto: {
        fontSize: FontSize.md,
        color: Colors.primary,
    },
})