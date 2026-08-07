import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
} from 'react-native'
import { X } from 'lucide-react-native'
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
    // Novos parâmetros opcionais (não quebram telas existentes)
    dismissable?: boolean          // fecha ao clicar fora — padrão false p/ retrocompatibilidade
    showCloseIcon?: boolean         // exibe o X no topo — padrão false
    onCancel?: () => void           // ação do botão cancelar/não (se ausente, usa onClose)
    confirmColor?: string           // cor custom do botão confirmar
    cancelColor?: string            // cor custom do botão cancelar
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
                                         dismissable = false,
                                         showCloseIcon = false,
                                         onCancel,
                                         confirmColor,
                                         cancelColor,
                                     }: Props) {

    const getColor = () => {
        switch (type) {
            case 'success': return '#16a34a'
            case 'error':   return '#dc2626'
            default:        return Colors.primary
        }
    }

    // O botão cancelar/X/fora sempre usa onCancel se existir, senão onClose.
    // Isso NUNCA dispara onConfirm — a ação destrutiva só ocorre no botão confirmar.
    const handleCancel = onCancel ?? onClose

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <TouchableWithoutFeedback onPress={dismissable ? handleCancel : undefined}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.container}>

                            {/* Header (linha colorida) */}
                            <View style={[
                                styles.topBar,
                                { backgroundColor: getColor() },
                                showCloseIcon && styles.topBarWithClose,
                            ]} />

                            {/* Botão X (opcional) */}
                            {showCloseIcon && (
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleCancel}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <X size={20} color={Colors.gray[500]} />
                                </TouchableOpacity>
                            )}

                            {/* Conteúdo */}
                            {title && <Text style={styles.title}>{title}</Text>}
                            {message && <Text style={styles.message}>{message}</Text>}

                            {/* Botões */}
                            <View style={styles.actions}>
                                {onConfirm ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.buttonPrimary, { backgroundColor: confirmColor ?? getColor() }]}
                                            onPress={onConfirm}
                                        >
                                            <Text style={styles.buttonPrimaryText}>{confirmText}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.buttonPrimary, { backgroundColor: cancelColor ?? Colors.gray[400] }]}
                                            onPress={handleCancel}
                                        >
                                            <Text style={styles.buttonPrimaryText}>{cancelText}</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.buttonPrimary, { backgroundColor: getColor() }]}
                                        onPress={onClose}
                                    >
                                        <Text style={styles.buttonPrimaryText}>{confirmText}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
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
    topBarWithClose: {
        marginRight: 44,
    },
    closeButton: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
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