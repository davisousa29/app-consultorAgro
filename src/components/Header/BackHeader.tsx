import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ReactNode } from "react";

import { Colors, FontSize, Spacing } from '../../constants'
import { globalStyles } from "../../constants/globalStyles";
import Logo from "../Logo";

interface Props {
    title?: ReactNode
    subtitle?: ReactNode
    effectPhrase?: ReactNode
    showLogo?: boolean
}

export default function BackHeader({ title, effectPhrase, subtitle, showLogo = true }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={[globalStyles.backButton, { alignSelf: 'flex-start' }]}
            >
                <Text style={globalStyles.backText}>← Voltar</Text>
            </TouchableOpacity>

            {showLogo && <Logo size={72} />}

            {title && (
                typeof title === 'string'
                    ? <Text style={styles.title}>{title}</Text>
                    : title
            )}

            {effectPhrase && (
                typeof effectPhrase === 'string'
                    ? <Text style={styles.effectPhrase}>{effectPhrase}</Text>
                    : effectPhrase
            )}

            {subtitle && (
                typeof subtitle === 'string'
                    ? <Text style={styles.subtitle}>{subtitle}</Text>
                    : subtitle
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        textAlign: 'center',
    },
    effectPhrase: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.xs,
    },
})