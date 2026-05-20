export function currencyMask(valor: string): string {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')

    if (!numeros || numeros === '0') return ''

    // Converte para centavos
    const centavos = parseInt(numeros)

    // Formata como moeda brasileira
    return (centavos / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function parseCurrency(valor: string): number {
    if (!valor) return 0
    // Remove pontos de milhar e substitui vírgula por ponto
    const limpo = valor.replace(/\./g, '').replace(',', '.')
    const num = parseFloat(limpo)
    return isNaN(num) ? 0 : num
}