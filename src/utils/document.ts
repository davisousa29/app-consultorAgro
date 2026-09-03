export function onlyDigits(value?: string): string {
    return (value ?? '').replace(/\D/g, '')
}

export function isValidCpf(cpf?: string): boolean {
    const digits = onlyDigits(cpf)

    if (digits.length !== 11) return false

    if (/^(\d)\1{10}$/.test(digits)) return false

    for (let t = 9; t < 11; t++) {
        let sum = 0
        for (let i = 0; i < t; i++) {
            sum += Number(digits[i]) * (t + 1 - i)
        }
        const digit = ((10 * sum) % 11) % 10
        if (Number(digits[t]) !== digit) return false
    }

    return true
}

export function formatCpf(cpf?: string): string {
    const digits = onlyDigits(cpf)
    if (digits.length !== 11) return digits
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}