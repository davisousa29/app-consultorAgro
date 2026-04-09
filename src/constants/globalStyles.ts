import { StyleSheet } from 'react-native'
import { Colors, FontSize, Spacing, BorderRadius } from './index'

export const globalStyles = StyleSheet.create({

    // ── Inputs ────────────────────────────────────────────────────────────────
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.black,
    },
    inputLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.gray[700],
    },
    inputHint: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
    },
    inputGroup: {
        gap: Spacing.xs,
    },

    // ── Botões ────────────────────────────────────────────────────────────────
    buttonPrimary: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center' as const,
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: 'bold' as const,
    },
    buttonSecondary: {
        backgroundColor: Colors.white,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center' as const,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    buttonSecondaryText: {
        color: Colors.primary,
        fontSize: FontSize.lg,
        fontWeight: 'bold' as const,
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // ── Tipografia ────────────────────────────────────────────────────────────
    pageTitle: {
        fontSize: FontSize.xxxl,
        fontWeight: 'bold' as const,
        color: Colors.black,
        marginBottom: Spacing.xs,
    },
    pageSubtitle: {
        fontSize: FontSize.md,
        color: Colors.gray[600],
    },
    modalTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    modalSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        textAlign: 'center',
        marginBottom: Spacing.md,
    },

    // ── Layout ────────────────────────────────────────────────────────────────
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.xl,
    },
    row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    center: {
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },

    // ── Cards ─────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    // ── Navegação ─────────────────────────────────────────────────────────────
    backButton: {
        marginBottom: Spacing.lg,
    },
    backText: {
        color: Colors.primary,
        fontSize: FontSize.md,
    },
})

