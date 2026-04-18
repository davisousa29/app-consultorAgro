export const phoneMask = (text?: string) => {
    const cleaned = text?.replace(/\D/g, '') || ''

    if (cleaned.length <= 10) {
        return [
            '(', /\d/, /\d/, ')', ' ',
            /\d/, /\d/, /\d/, /\d/, '-',
            /\d/, /\d/, /\d/, /\d/
        ]
    }

    return [
        '(', /\d/, /\d/, ')', ' ',
        /\d/, /\d/, /\d/, /\d/, /\d/, '-',
        /\d/, /\d/, /\d/, /\d/
    ]
}