// ── Converte string com vírgula ou ponto para número ─────────────────────────
export function parsearNumero(valor: string): number {
    if (!valor) return 0
    const limpo = valor.replace(',', '.')
    const num = parseFloat(limpo)
    return isNaN(num) ? 0 : num
}

// ── Formata número para exibição com casas decimais ───────────────────────────
export function formatarNumero(valor: number, casas = 2): string {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
    })
}

// ── Remove tudo que não é número, vírgula ou ponto ───────────────────────────
export function sanitizarNumero(texto: string): string {
    return texto.replace(/[^0-9.,]/g, '')
}

// ── Verifica se string é um número válido ─────────────────────────────────────
export function isNumeroValido(valor: string): boolean {
    if (!valor) return false
    const limpo = valor.replace(',', '.')
    return !isNaN(parseFloat(limpo)) && isFinite(Number(limpo))
}