import { View, Text, StyleSheet } from 'react-native'
import { Colors, Spacing, FontSize } from '../../constants'

interface Props {
    senha: string
}

interface Nivel {
    label: string
    cor: string
    pontos: number
}

function avaliarForca(senha: string): Nivel {
    if (!senha) return { label: '', cor: 'transparent', pontos: 0 }

    let pontos = 0
    if (senha.length >= 8) pontos++
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++
    if (/[0-9]/.test(senha)) pontos++
    if (/[^a-zA-Z0-9]/.test(senha)) pontos++

    if (pontos <= 2) return { label: 'Fraca', cor: '#FA5252', pontos }
    if (pontos === 3) return { label: 'Média', cor: '#FAB005', pontos }
    return { label: 'Forte', cor: '#40C057', pontos }
}

export default function PasswordStrength({ senha }: Props) {
    const nivel = avaliarForca(senha)

    if (!senha) return null

    return (
        <View style={styles.container}>
            <View style={styles.barras}>
                {[1, 2, 3, 4].map(i => (
                    <View
                        key={i}
                        style={[
                            styles.barra,
                            { backgroundColor: i <= nivel.pontos ? nivel.cor : Colors.gray[200] },
                        ]}
                    />
                ))}
            </View>
            <Text style={[styles.label, { color: nivel.cor }]}>
                Senha {nivel.label.toLowerCase()}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.xs,
        gap: 4,
    },
    barras: {
        flexDirection: 'row',
        gap: 4,
    },
    barra: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
})