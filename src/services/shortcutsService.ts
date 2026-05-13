import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = '@agro:shortcuts'
const DEFAULT_SHORTCUTS = ['/consultor/contratos', '/consultor/busca']
const MIN = 1
const MAX = 10

export async function getShortcuts(): Promise<string[]> {
    try {
        const saved = await AsyncStorage.getItem(KEY)
        return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS
    } catch {
        return DEFAULT_SHORTCUTS
    }
}

export async function saveShortcuts(paths: string[]): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(paths))
}

export { MIN, MAX }