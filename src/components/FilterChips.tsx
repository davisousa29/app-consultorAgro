import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, FontSize } from '../constants'

export interface FilterChip {
    label: string
    value: string
    cor?: string
}

interface Props {
    chips: FilterChip[]
    selecionado: string
    onChange: (value: string) => void
}

export default function FilterChips({ chips, selecionado, onChange }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {chips.map(chip => {
                const ativo = selecionado === chip.value
                const cor = chip.cor ?? Colors.primary

                return (
                    <TouchableOpacity
                        key={chip.value}
                        style={[
                            styles.chip,
                            ativo
                                ? { backgroundColor: cor, borderColor: cor }
                                : { backgroundColor: Colors.white, borderColor: Colors.gray[300] }
                        ]}
                        onPress={() => onChange(chip.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.chipText,
                            { color: ativo ? Colors.white : Colors.gray[700] }
                        ]}>
                            {chip.label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.xs,
        paddingVertical: Spacing.xs,
    },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
    },
    chipText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
})