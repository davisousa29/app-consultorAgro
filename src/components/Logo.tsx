import { View, Image, StyleSheet } from 'react-native'
import { Colors, BorderRadius } from '../constants'

interface LogoProps {
    size?: number
}

export default function Logo({ size = 100 }: LogoProps) {
    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.24 }]}>
            <Image
                source={require('../../assets/logo_AgroSystem_Consultor.png')}
                style={{ width: size, height: size, borderRadius: size * 0.24 }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',

        // iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,

        // Android
        elevation: 6,
    },
})