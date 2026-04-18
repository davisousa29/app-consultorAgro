export const cpfCnpjMask = (text?: string) => {
    const cleaned = text?.replace(/\D/g, '') || ''

    // CPF
    if (cleaned.length <= 11) {
        return [
            /\d/, /\d/, /\d/, '.',
            /\d/, /\d/, /\d/, '.',
            /\d/, /\d/, /\d/, '-',
            /\d/, /\d/
        ]
    }

    // CNPJ
    return [
        /\d/, /\d/, '.',
        /\d/, /\d/, /\d/, '.',
        /\d/, /\d/, /\d/, '/',
        /\d/, /\d/, /\d/, /\d/, '-',
        /\d/, /\d/
    ]
}