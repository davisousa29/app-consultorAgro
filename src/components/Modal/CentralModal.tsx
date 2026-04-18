import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native'
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants'

interface Props {
    visible: boolean
    title?: string
    message?: string
    onClose: () => void
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
    type?: 'default' | 'success' | 'error'
}

export default function CentralModal({
                                         visible,
                                         title,
                                         message,
                                         onClose,
                                         onConfirm,
                                         confirmText = 'OK',
                                         cancelText = 'Cancelar',
                                         type = 'default',
                                     }: Props) {

    const getColor = () => {
        switch (type) {
            case 'success':
                return '#16a34a'
            case 'error':
                return '#dc2626'
            default:
                return Colors.primary
        }
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* Header (linha colorida) */}
                    <View style={[styles.topBar, { backgroundColor: getColor() }]} />

                    {/* Conteúdo */}
                    {title && <Text style={styles.title}>{title}</Text>}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Botões */}
                    <View style={styles.actions}>

                        {onConfirm ? (
                            <>
                                <TouchableOpacity
                                    style={styles.buttonSecondary}
                                    onPress={onClose}
                                >
                                    <Text style={styles.buttonSecondaryText}>
                                        {cancelText}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.buttonPrimary, { backgroundColor: getColor() }]}
                                    onPress={onConfirm}
                                >
                                    <Text style={styles.buttonPrimaryText}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.buttonPrimary, { backgroundColor: getColor() }]}
                                onPress={onClose}
                            >
                                <Text style={styles.buttonPrimaryText}>
                                    {confirmText}
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    container: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    topBar: {
        height: 4,
        borderRadius: 2,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.sm,
    },
    buttonPrimary: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.gray[300],
    },
    buttonSecondaryText: {
        color: Colors.gray[700],
        fontWeight: 'bold',
    },
})