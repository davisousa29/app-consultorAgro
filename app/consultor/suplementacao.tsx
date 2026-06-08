import { View, Text } from 'react-native'
import { globalStyles } from '../../src/constants/globalStyles'
import { Colors, FontSize } from '../../src/constants'

export default function SuplementacaoScreen() {
    return (
        <View style={[globalStyles.screen, globalStyles.center]}>
            <Text style={{ fontSize: FontSize.lg, color: Colors.gray[500] }}>
                Em breve — Suplementação
            </Text>
        </View>
    )
}