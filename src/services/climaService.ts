import api from './api'

export interface ClimaMensal {
    mes: number
    temperatura_minima: number
    temperatura_maxima: number
    precipitacao_mm: number
    classificacao: string
}

interface ClimaResponse {
    success: boolean
    data: ClimaMensal[]
}

export async function buscarClimaAnual(
    latitude: number,
    longitude: number
): Promise<ClimaMensal[]> {

    const response = await api.get<ClimaResponse>(
        '/clima/anual',
        {
            params: {
                latitude,
                longitude,
            },
        }
    )

    return response.data.data
}